'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { GraduationCap, Send, CheckCircle } from 'lucide-react'

export default function BecomeTeacherPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState({ full_name: profile?.full_name || '', email: profile?.email || '', phone: '', specialty: '', experience_years: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.specialty) return alert('يرجى ملء الحقول المطلوبة')
    setLoading(true)
    const supabase = createClient()
    await supabase.from('teacher_requests').insert({
      user_id: profile?.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      specialty: form.specialty,
      experience_years: parseInt(form.experience_years) || 0,
      message: form.message,
      status: 'pending'
    })
    setSuccess(true)
  }

  if (success) return (
    <main className="min-h-screen mesh-bg"><Navbar />
      <div className="pt-28 flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-10 text-center max-w-md border border-green-500/20">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">تم إرسال طلبك!</h2>
          <p className="text-gray-400">سيراجع فريقنا طلبك ويتواصل معك قريباً.</p>
        </div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen mesh-bg"><Navbar />
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <GraduationCap size={40} className="text-primary-400 mx-auto mb-3" />
            <h1 className="text-3xl font-black mb-2">انضم كـ <span className="gradient-text">معلم</span></h1>
            <p className="text-gray-400 text-sm">انشر كورساتك لآلاف الطلاب وابدأ كسب الدخل</p>
          </div>
          <div className="glass-card rounded-2xl p-7 border border-white/10 space-y-4">
            {[
              { label: 'الاسم الكامل *', key: 'full_name', type: 'text' },
              { label: 'البريد الإلكتروني *', key: 'email', type: 'email' },
              { label: 'رقم الهاتف', key: 'phone', type: 'tel' },
              { label: 'التخصص أو مجال الخبرة *', key: 'specialty', type: 'text' },
              { label: 'سنوات الخبرة', key: 'experience_years', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-sm text-gray-300 mb-1.5 block">{label}</label>
                <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white" />
              </div>
            ))}
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">نبذة عن نفسك والكورسات التي تودّ تقديمها</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4}
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              <Send size={16} /> {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
