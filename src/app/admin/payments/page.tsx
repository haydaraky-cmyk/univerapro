'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CreditCard, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminPaymentsPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  const fetchPayments = async () => {
    const supabase = createClient()
    let query = supabase
      .from('payment_requests')
      .select('*, user:profiles(full_name, email, phone, plan)')
      .order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query.limit(50)
    setPayments(data || [])
    setFetching(false)
  }

  useEffect(() => { if (profile) fetchPayments() }, [profile, filter])

  const handleApprove = async (payment: any) => {
    if (!confirm(`تأكيد قبول طلب ${payment.user?.full_name}؟ سيتم ترقية خطته إلى ${payment.requested_plan}`)) return
    const supabase = createClient()
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + payment.duration_months)

    await Promise.all([
      supabase.from('payment_requests').update({
        status: 'approved',
        reviewed_by: profile!.id,
        reviewed_at: new Date().toISOString()
      }).eq('id', payment.id),
      supabase.from('profiles').update({
        plan: payment.requested_plan,
        plan_expires_at: expiresAt.toISOString()
      }).eq('id', payment.user_id),
      supabase.from('notifications').insert({
        user_id: payment.user_id,
        title: 'تم تفعيل اشتراكك ✅',
        message: `تم تفعيل خطة ${payment.requested_plan === 'pro' ? 'برو' : 'ماكس'} بنجاح. استمتع بجميع المزايا!`,
        type: 'success'
      })
    ])
    fetchPayments()
  }

  const handleReject = async (payment: any) => {
    const note = prompt('سبب الرفض (اختياري):')
    const supabase = createClient()
    await Promise.all([
      supabase.from('payment_requests').update({
        status: 'rejected',
        admin_note: note || '',
        reviewed_by: profile!.id,
        reviewed_at: new Date().toISOString()
      }).eq('id', payment.id),
      supabase.from('notifications').insert({
        user_id: payment.user_id,
        title: 'تم رفض طلب الدفع ❌',
        message: note ? `تم رفض طلبك: ${note}` : 'تم رفض طلب الدفع. تواصل مع الإدارة.',
        type: 'error'
      })
    ])
    fetchPayments()
  }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
        <span className="text-gray-600">/</span>
        <span className="font-bold">طلبات الدفع</span>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <CreditCard className="text-gold-400" size={24} /> طلبات الدفع والاشتراك
        </h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'pending', label: 'قيد المراجعة', color: 'bg-yellow-500/20 text-yellow-400' },
            { key: 'approved', label: 'مقبولة', color: 'bg-green-500/20 text-green-400' },
            { key: 'rejected', label: 'مرفوضة', color: 'bg-red-500/20 text-red-400' },
            { key: 'all', label: 'الكل', color: 'bg-white/10 text-gray-300' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key ? f.color + ' ring-1 ring-white/20' : 'glass-card text-gray-500 hover:text-gray-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
            <p>لا توجد طلبات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p: any) => (
              <div key={p.id} className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="font-bold">{p.user?.full_name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : p.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {p.status === 'pending' ? 'قيد المراجعة' : p.status === 'approved' ? 'مقبول' : 'مرفوض'}
                      </span>
                      <span className={`badge-${p.requested_plan}`}>{p.requested_plan === 'pro' ? 'برو' : 'ماكس'}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div><span className="text-gray-500 text-xs">البريد</span><div className="text-gray-200">{p.user?.email}</div></div>
                      <div><span className="text-gray-500 text-xs">طريقة الدفع</span><div className="text-gray-200">{p.method === 'sham_cash' ? 'شام كاش' : 'سيريتل كاش'}</div></div>
                      <div><span className="text-gray-500 text-xs">رقم العملية</span><div className="text-gold-400 font-mono font-bold">{p.transaction_number}</div></div>
                      <div><span className="text-gray-500 text-xs">المبلغ / المدة</span><div className="text-gray-200">{p.amount.toLocaleString('ar')} ل.س / {p.duration_months} شهر</div></div>
                    </div>
                    {p.admin_note && <div className="mt-2 text-xs text-red-400">ملاحظة: {p.admin_note}</div>}
                    <div className="text-xs text-gray-600 mt-2">{new Date(p.created_at).toLocaleString('ar-SY')}</div>
                  </div>

                  {p.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(p)}
                        className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <CheckCircle size={16} /> قبول
                      </button>
                      <button
                        onClick={() => handleReject(p)}
                        className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                      >
                        <XCircle size={16} /> رفض
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
