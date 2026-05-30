'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Bell, Send, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminNotificationsPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all', user_id: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  useEffect(() => {
    if (!profile) return
    const supabase = createClient()
    supabase.from('profiles').select('id, full_name, email').limit(100).then(({ data }) => setUsers(data || []))
  }, [profile])

  const handleSend = async () => {
    if (!form.title || !form.message) return alert('العنوان والرسالة مطلوبان')
    setSending(true)
    const supabase = createClient()

    if (form.target === 'all') {
      const inserts = users.map(u => ({ user_id: u.id, title: form.title, message: form.message, type: form.type }))
      await supabase.from('notifications').insert(inserts)
    } else if (form.target === 'user' && form.user_id) {
      await supabase.from('notifications').insert({ user_id: form.user_id, title: form.title, message: form.message, type: form.type })
    }

    setSending(false)
    setSent(true)
    setTimeout(() => { setSent(false); setForm({ title: '', message: '', type: 'info', target: 'all', user_id: '' }) }, 3000)
  }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
        <span className="text-gray-600">/</span>
        <span className="font-bold">إرسال إشعار</span>
      </div>
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Bell className="text-red-400" size={24} /> إرسال إشعارات
        </h1>
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
          {sent && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle size={16} /> تم الإرسال بنجاح!
            </div>
          )}
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">المستلمون</label>
            <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500">
              <option value="all">جميع المستخدمين ({users.length})</option>
              <option value="user">مستخدم محدد</option>
            </select>
          </div>
          {form.target === 'user' && (
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">اختر المستخدم</label>
              <select value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500">
                <option value="">اختر...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name} — {u.email}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">نوع الإشعار</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500">
              <option value="info">معلومة</option>
              <option value="success">نجاح</option>
              <option value="warning">تنبيه</option>
              <option value="error">خطأ</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">العنوان *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="عنوان الإشعار"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500" />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">نص الرسالة *</label>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4}
              placeholder="محتوى الإشعار..."
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white resize-none placeholder-gray-500" />
          </div>
          <button onClick={handleSend} disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            <Send size={16} /> {sending ? 'جارٍ الإرسال...' : `إرسال${form.target === 'all' ? ` لـ ${users.length} مستخدم` : ''}`}
          </button>
        </div>
      </div>
    </main>
  )
}
