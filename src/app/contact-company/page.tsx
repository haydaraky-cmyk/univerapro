'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Building, Send, CheckCircle } from 'lucide-react'

export default function ContactCompanyPage() {
  const [form, setForm] = useState({ company_name: '', contact_person: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!form.company_name || !form.contact_person || !form.email) return alert('يرجى ملء الحقول المطلوبة')
    setLoading(true)
    const supabase = createClient()
    await supabase.from('company_contacts').insert(form)
    setSuccess(true)
  }

  if (success) return (
    <main className="min-h-screen mesh-bg"><Navbar />
      <div className="pt-28 flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-10 text-center max-w-md border border-green-500/20">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">شكراً!</h2>
          <p className="text-gray-400">تلقينا طلبكم، سيتواصل معكم فريقنا في أقرب وقت.</p>
        </div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen mesh-bg"><Navbar />
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <Building size={40} className="text-green-400 mx-auto mb-3" />
            <h1 className="text-3xl font-black mb-2">نشر <span className="gradient-text">فرصة عمل</span></h1>
            <p className="text-gray-400 text-sm">تواصل معنا لنشر فرص عملكم وعرضها لآلاف المستخدمين</p>
          </div>
          <div className="glass-card rounded-2xl p-7 border border-white/10 space-y-4">
            {[
              { label: 'اسم الشركة أو المنظمة *', key: 'company_name', type: 'text' },
              { label: 'اسم المسؤول *', key: 'contact_person', type: 'text' },
              { label: 'البريد الإلكتروني *', key: 'email', type: 'email' },
              { label: 'رقم الهاتف', key: 'phone', type: 'tel' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-sm text-gray-300 mb-1.5 block">{label}</label>
                <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white" />
              </div>
            ))}
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">تفاصيل الوظيفة أو رسالتكم</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4}
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              <Send size={16} /> {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
