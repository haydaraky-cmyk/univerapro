'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { User, Save, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { profile, loading, refreshProfile } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', phone: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!loading && !profile) router.push('/auth/login')
    if (profile) setForm({ full_name: profile.full_name, phone: profile.phone || '', bio: profile.bio || '' })
  }, [loading, profile])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update(form).eq('id', profile!.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading || !profile) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> لوحة التحكم</Link>
            <span className="text-gray-600">/</span>
            <span className="font-bold">الملف الشخصي</span>
          </div>
          <div className="glass-card rounded-2xl p-7 border border-white/10">
            <div className="flex items-center gap-4 mb-7">
              <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold">
                {profile.full_name[0]}
              </div>
              <div>
                <div className="font-bold text-lg">{profile.full_name}</div>
                <div className="text-sm text-gray-400">{profile.email}</div>
                <span className={`badge-${profile.plan} mt-1 inline-block`}>{profile.plan === 'free' ? 'مجاني' : profile.plan === 'pro' ? 'برو' : 'ماكس'}</span>
              </div>
            </div>
            {saved && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2 text-green-400 text-sm mb-5">
                <CheckCircle size={16} /> تم حفظ التغييرات!
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">الاسم الكامل</label>
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">رقم الهاتف</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1.5 block">نبذة شخصية</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white resize-none" />
              </div>
              <div className="bg-dark-700 rounded-xl p-4 text-sm">
                <div className="text-gray-500 text-xs mb-2">معلومات الحساب (لا يمكن تعديلها)</div>
                <div className="text-gray-300">البريد الإلكتروني: {profile.email}</div>
                <div className="text-gray-300 mt-1">الدور: {profile.role === 'admin' ? 'مدير' : profile.role === 'teacher' ? 'معلم' : profile.role === 'staff' ? 'موظف' : 'طالب'}</div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={16} /> {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
