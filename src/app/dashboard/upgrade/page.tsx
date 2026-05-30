'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { CreditCard, Upload, CheckCircle } from 'lucide-react'

export default function UpgradePage() {
  const { profile } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [plan, setPlan] = useState<'pro' | 'max'>(searchParams.get('plan') as any || 'pro')
  const [method, setMethod] = useState<'sham_cash' | 'syriatel_cash'>('sham_cash')
  const [txNumber, setTxNumber] = useState('')
  const [months, setMonths] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const prices = { pro: 1500, max: 2500 }
  const totalAmount = prices[plan] * months

  const handleSubmit = async () => {
    if (!txNumber.trim()) { setError('يرجى إدخال رقم العملية'); return }
    if (!profile) { router.push('/auth/login'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('payment_requests').insert({
      user_id: profile.id,
      method,
      transaction_number: txNumber.trim(),
      amount: totalAmount,
      requested_plan: plan,
      duration_months: months,
      status: 'pending'
    })
    if (err) { setError('حدث خطأ، حاول مجدداً'); setLoading(false); return }
    setSuccess(true)
  }

  if (success) return (
    <main className="min-h-screen mesh-bg">
      <Navbar />
      <div className="pt-28 flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-10 text-center max-w-md border border-green-500/20">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">تم إرسال طلبك!</h2>
          <p className="text-gray-400 mb-2">سيتم مراجعة طلبك وتفعيل اشتراكك خلال <strong className="text-white">24 ساعة</strong>.</p>
          <p className="text-xs text-gray-500 mb-6">رقم العملية: {txNumber}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">العودة للوحة التحكم</button>
        </div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen mesh-bg">
      <Navbar />
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2">ترقية <span className="gradient-text">الاشتراك</span></h1>
            <p className="text-gray-400 text-sm">ادفع عبر شام كاش أو سيريتل كاش وأدخل رقم العملية</p>
          </div>

          <div className="glass-card rounded-2xl p-7 border border-white/10 space-y-6">
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}

            {/* Plan selection */}
            <div>
              <label className="text-sm text-gray-300 mb-3 block">اختر الخطة</label>
              <div className="grid grid-cols-2 gap-3">
                {(['pro', 'max'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPlan(p)}
                    className={`rounded-xl p-4 text-right border-2 transition-all ${plan === p ? (p === 'pro' ? 'border-primary-500 bg-primary-500/10' : 'border-gold-500 bg-gold-500/10') : 'border-white/10 hover:border-white/20'}`}
                  >
                    <div className={`font-bold mb-1 ${p === 'max' ? 'text-gold-400' : ''}`}>{p === 'pro' ? 'برو' : 'ماكس'}</div>
                    <div className="text-lg font-black">{prices[p].toLocaleString('ar')} <span className="text-xs font-normal text-gray-400">ل.س/شهر</span></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm text-gray-300 mb-3 block">مدة الاشتراك</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 6].map(m => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={`rounded-xl p-3 text-center border transition-all text-sm ${months === m ? 'border-primary-500 bg-primary-500/10 font-bold' : 'border-white/10 hover:border-white/20'}`}
                  >
                    {m} {m === 1 ? 'شهر' : 'أشهر'}
                    {m > 1 && <div className="text-xs text-green-400 mt-0.5">وفر {m === 3 ? '10%' : '15%'}</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-dark-700 rounded-xl p-4 flex justify-between items-center">
              <span className="text-gray-400 text-sm">المجموع</span>
              <span className="text-xl font-black">{totalAmount.toLocaleString('ar')} ل.س</span>
            </div>

            {/* Payment method */}
            <div>
              <label className="text-sm text-gray-300 mb-3 block">طريقة الدفع</label>
              <div className="space-y-2">
                {[
                  { id: 'sham_cash', label: 'شام كاش', number: '09XXXXXXXX' },
                  { id: 'syriatel_cash', label: 'سيريتل كاش', number: '09XXXXXXXX' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as any)}
                    className={`w-full rounded-xl p-4 text-right border transition-all flex items-center justify-between ${method === m.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20'}`}
                  >
                    <div>
                      <div className="font-medium text-sm">{m.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">الرقم: {m.number}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${method === m.id ? 'border-primary-500 bg-primary-500' : 'border-gray-600'}`}></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction number */}
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">رقم العملية *</label>
              <div className="relative">
                <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={txNumber}
                  onChange={e => setTxNumber(e.target.value)}
                  placeholder="أدخل رقم العملية كما وردك"
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">الرقم الذي يصلك بعد إتمام عملية التحويل</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'جارٍ الإرسال...' : 'إرسال طلب الاشتراك'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
