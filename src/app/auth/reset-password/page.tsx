'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // عند فتح الرابط من البريد ينشئ Supabase جلسة استعادة مؤقتة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
    })
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true) })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async () => {
    if (password.length < 8) { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError('تعذّر تحديث كلمة المرور. قد يكون الرابط منتهي الصلاحية.'); return }
    setDone(true)
    setTimeout(() => router.push('/auth/login'), 2500)
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">تعيين كلمة مرور جديدة</h1>
          <p className="text-gray-400 text-sm mt-1">اختر كلمة مرور قوية لحسابك</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/10">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={26} className="text-green-400" />
              </div>
              <p className="text-gray-200 font-medium">تم تحديث كلمة المرور بنجاح</p>
              <p className="text-gray-400 text-sm mt-1">سيتم تحويلك لتسجيل الدخول...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              <p className="mb-2">جارٍ التحقق من الرابط...</p>
              <p className="text-gray-500">افتح هذه الصفحة من خلال الرابط المُرسَل إلى بريدك الإلكتروني.</p>
            </div>
          ) : (
            <>
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5">{error}</div>}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1.5 block">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 pl-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                    />
                    <button onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1.5 block">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    />
                  </div>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-50">
                {loading ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور'}
              </button>
            </>
          )}
          <div className="text-center mt-6">
            <Link href="/auth/login" className="text-sm text-primary-400 hover:text-primary-300">العودة لتسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
