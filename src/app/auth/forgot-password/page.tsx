'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!email) { setError('يرجى إدخال البريد الإلكتروني'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    // نُظهر نفس الرسالة دائماً حتى لا نكشف هل البريد مسجَّل أم لا (حماية الخصوصية)
    if (error && error.message.toLowerCase().includes('rate')) {
      setError('عدد كبير من المحاولات، يرجى المحاولة لاحقاً')
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">استعادة كلمة المرور</h1>
          <p className="text-gray-400 text-sm mt-1">سنرسل لك رابط إعادة التعيين على بريدك</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/10">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={26} className="text-green-400" />
              </div>
              <p className="text-gray-200 font-medium mb-2">تحقّق من بريدك الإلكتروني</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                إذا كان البريد <span className="text-primary-300">{email}</span> مسجّلاً لدينا، فستصلك رسالة تحتوي رابط إعادة تعيين كلمة المرور.
              </p>
            </div>
          ) : (
            <>
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5">{error}</div>}
              <label className="text-sm text-gray-300 mb-1.5 block">البريد الإلكتروني</label>
              <div className="relative mb-6">
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
              </button>
            </>
          )}

          <div className="text-center mt-6">
            <Link href="/auth/login" className="text-sm text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
              العودة لتسجيل الدخول <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
