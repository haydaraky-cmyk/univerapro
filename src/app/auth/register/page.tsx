'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useSiteName } from '@/hooks/useSettings'
import { Mail, Lock, User, Phone } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const siteName = useSiteName()

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleRegister = async () => {
    if (!form.full_name || !form.email || !form.password) { setError('يرجى ملء الحقول المطلوبة'); return }
    if (form.password !== form.confirm) { setError('كلمتا المرور غير متطابقتين'); return }
    if (form.password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name, phone: form.phone } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-10 text-center max-w-md border border-green-500/20">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-3">تم إنشاء حسابك!</h2>
        <p className="text-gray-400 mb-6">تفقد بريدك الإلكتروني لتأكيد الحساب ثم سجّل دخولك.</p>
        <Link href="/auth/login" className="btn-primary inline-block">تسجيل الدخول</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center font-bold">{siteName[0]}</div>
            <span className="text-2xl font-bold gradient-text">{siteName}</span>
          </Link>
          <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
          <p className="text-gray-400 text-sm mt-1">انضم إلى مجتمع التعلم</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/10">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5">{error}</div>}

          <div className="space-y-4">
            {[
              { label: 'الاسم الكامل *', key: 'full_name', type: 'text', icon: User, placeholder: 'محمد أحمد' },
              { label: 'البريد الإلكتروني *', key: 'email', type: 'email', icon: Mail, placeholder: 'example@email.com' },
              { label: 'رقم الهاتف', key: 'phone', type: 'tel', icon: Phone, placeholder: '09XXXXXXXX' },
              { label: 'كلمة المرور *', key: 'password', type: 'password', icon: Lock, placeholder: '••••••••' },
              { label: 'تأكيد كلمة المرور *', key: 'confirm', type: 'password', icon: Lock, placeholder: '••••••••' },
            ].map(({ label, key, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="text-sm text-gray-300 mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={e => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleRegister} disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-50">
            {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
          </button>

          <div className="text-center mt-4 text-sm text-gray-400">
            لديك حساب؟ <Link href="/auth/login" className="text-primary-400 hover:text-primary-300">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
