'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { GraduationCap, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminTeachersPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  const fetchRequests = async () => {
    const supabase = createClient()
    let query = supabase.from('teacher_requests').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    const { data } = await query
    setRequests(data || [])
    setFetching(false)
  }

  useEffect(() => { if (profile) fetchRequests() }, [profile, filter])

  const handleApprove = async (req: any) => {
    const supabase = createClient()
    await Promise.all([
      supabase.from('teacher_requests').update({ status: 'published', reviewed_by: profile!.id, reviewed_at: new Date().toISOString() }).eq('id', req.id),
      req.user_id && supabase.from('profiles').update({ role: 'teacher' }).eq('id', req.user_id),
      req.user_id && supabase.from('notifications').insert({ user_id: req.user_id, title: 'تم قبول طلبك كمعلم ✅', message: 'مبروك! يمكنك الآن رفع كورساتك.', type: 'success' })
    ])
    fetchRequests()
  }

  const handleReject = async (req: any) => {
    const note = prompt('سبب الرفض:') || ''
    const supabase = createClient()
    await Promise.all([
      supabase.from('teacher_requests').update({ status: 'rejected', admin_note: note, reviewed_by: profile!.id, reviewed_at: new Date().toISOString() }).eq('id', req.id),
      req.user_id && supabase.from('notifications').insert({ user_id: req.user_id, title: 'طلبك كمعلم', message: note || 'للأسف لم يتم قبول طلبك حالياً.', type: 'error' })
    ])
    fetchRequests()
  }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
        <span className="text-gray-600">/</span>
        <span className="font-bold">طلبات المعلمين</span>
      </div>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <GraduationCap className="text-purple-400" size={24} /> طلبات الانضمام كمعلم
        </h1>
        <div className="flex gap-2 mb-6">
          {['pending', 'published', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm transition-all ${filter === f ? 'bg-primary-500 text-white' : 'glass-card text-gray-400 hover:text-white'}`}>
              {f === 'pending' ? 'قيد المراجعة' : f === 'published' ? 'مقبول' : f === 'rejected' ? 'مرفوض' : 'الكل'}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="glass-card rounded-2xl p-5 border border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold">{req.full_name}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{req.email} {req.phone && `· ${req.phone}`}</div>
                  <div className="text-sm text-primary-400 mt-1">التخصص: {req.specialty}</div>
                  {req.experience_years > 0 && <div className="text-xs text-gray-500 mt-0.5">{req.experience_years} سنوات خبرة</div>}
                  {req.message && <p className="text-sm text-gray-300 mt-2 leading-relaxed">{req.message}</p>}
                  {req.admin_note && <div className="text-xs text-red-400 mt-1">ملاحظة: {req.admin_note}</div>}
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleApprove(req)} className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl px-3 py-2 text-sm transition-colors">
                      <CheckCircle size={15} /> قبول
                    </button>
                    <button onClick={() => handleReject(req)} className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl px-3 py-2 text-sm transition-colors">
                      <XCircle size={15} /> رفض
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
