'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LifeBuoy, ArrowRight, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function AdminTicketsPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [tickets, setTickets] = useState<any[]>([])
  const [active, setActive] = useState<any>(null)
  const [thread, setThread] = useState<any[]>([])
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  const load = async () => {
    let q = supabase.from('support_tickets').select('*, user:profiles(full_name, email)').order('updated_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setTickets(data || [])
  }
  useEffect(() => { if (profile) load() }, [profile, filter])

  const open = async (t: any) => {
    setActive(t)
    const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', t.id).order('created_at')
    setThread(data || [])
  }

  const sendReply = async () => {
    if (!reply.trim() || busy || !active) return
    setBusy(true)
    await supabase.from('ticket_messages').insert({ ticket_id: active.id, sender_id: profile!.id, is_admin: true, body: reply.trim() })
    await supabase.from('support_tickets').update({ status: 'answered', updated_at: new Date().toISOString() }).eq('id', active.id)
    setReply('')
    await open(active)
    setBusy(false)
  }

  const closeTicket = async () => {
    if (!active) return
    await supabase.from('support_tickets').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('id', active.id)
    setActive({ ...active, status: 'closed' })
    load()
  }

  const statusLabel: Record<string, string> = { open: 'مفتوحة', answered: 'تم الرد', closed: 'مغلقة' }
  const statusColor: Record<string, string> = { open: 'text-yellow-400', answered: 'text-green-400', closed: 'text-gray-500' }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
        <span className="text-gray-600">/</span>
        <span className="font-bold">تذاكر الدعم</span>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><LifeBuoy className="text-primary-400" size={24} /> تذاكر الدعم</h1>

        {!active && (
          <div className="flex gap-2 mb-5 text-sm">
            {[['all', 'الكل'], ['open', 'مفتوحة'], ['answered', 'تم الرد'], ['closed', 'مغلقة']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-lg transition-colors ${filter === v ? 'bg-primary-500 text-white' : 'glass-card text-gray-300'}`}>{l}</button>
            ))}
          </div>
        )}

        {active ? (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-dark-800">
              <button onClick={() => { setActive(null); load() }} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"><ArrowRight size={15} /> رجوع</button>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${statusColor[active.status]}`}>{statusLabel[active.status]}</span>
                {active.status !== 'closed' && <button onClick={closeTicket} className="text-xs text-gray-400 hover:text-white flex items-center gap-1"><CheckCircle size={13} /> إغلاق</button>}
              </div>
            </div>
            <div className="px-5 py-3 border-b border-white/10">
              <div className="font-semibold text-sm">{active.subject}</div>
              <div className="text-xs text-gray-500">{active.user?.full_name} · {active.user?.email}</div>
            </div>
            <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
              {thread.map((m: any) => (
                <div key={m.id} className={`flex ${m.is_admin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.is_admin ? 'bg-primary-600 text-white' : 'bg-dark-700 border border-white/5'}`}>
                    <div className="text-[10px] opacity-60 mb-1">{m.is_admin ? 'فريق الدعم' : 'المستخدم'}</div>
                    {m.body}
                  </div>
                </div>
              ))}
            </div>
            {active.status !== 'closed' && (
              <div className="p-4 border-t border-white/10 flex gap-2">
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} placeholder="اكتب الرد..." className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500" />
                <button onClick={sendReply} disabled={busy} className="btn-primary px-3 disabled:opacity-50"><Send size={16} /></button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="text-center py-16 text-gray-500">لا توجد تذاكر</div>
            ) : tickets.map((t: any) => (
              <button key={t.id} onClick={() => open(t)} className="w-full text-right glass-card rounded-xl p-4 border border-white/5 hover:border-primary-500/30 transition-colors flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{t.subject}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.user?.full_name} · {formatDate(t.created_at)}</div>
                </div>
                <span className={`text-xs ${statusColor[t.status]}`}>{statusLabel[t.status]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
