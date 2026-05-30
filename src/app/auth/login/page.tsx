'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useSiteName } from '@/hooks/useSettings'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const siteName = useSiteName()

  const handleLogin = async () => {
    if (!email || !password) { setError('يرجى ملء جميع الحقول'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('البريد الإلكتروني أو كلمة المرور غير صحيحة'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center font-bold">{siteName[0]}</div>
            <span className="text-2xl font-bold gradient-text">{siteName}</span>
          </Link>
          <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
          <p className="text-gray-400 text-sm mt-1">أهلاً بعودتك</p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/10">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-5">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-gray-300">كلمة المرور</label>
                <Link href="/auth/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">نسيت كلمة المرور؟</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 pl-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          </button>

          <div className="text-center mt-6 text-sm text-gray-400">
            ليس لديك حساب؟{' '}
            <Link href="/auth/register" className="text-primary-400 hover:text-primary-300">إنشاء حساب جديد</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
