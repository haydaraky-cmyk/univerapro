'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { LifeBuoy, Plus, Send, ArrowRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function SupportPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [tickets, setTickets] = useState<any[]>([])
  const [active, setActive] = useState<any>(null)
  const [thread, setThread] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (!loading && !profile) router.push('/auth/login') }, [loading, profile])

  const loadTickets = async () => {
    const { data } = await supabase.from('support_tickets').select('*').order('updated_at', { ascending: false })
    setTickets(data || [])
  }
  useEffect(() => { if (profile) loadTickets() }, [profile])

  const openTicket = async (t: any) => {
    setActive(t)
    const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', t.id).order('created_at')
    setThread(data || [])
  }

  const createTicket = async () => {
    if (!subject.trim() || !body.trim() || busy) return
    setBusy(true)
    const { data: t } = await supabase.from('support_tickets').insert({ user_id: profile!.id, subject: subject.trim() }).select().single()
    if (t) {
      await supabase.from('ticket_messages').insert({ ticket_id: t.id, sender_id: profile!.id, is_admin: false, body: body.trim() })
      setSubject(''); setBody(''); setCreating(false)
      await loadTickets()
      openTicket(t)
    }
    setBusy(false)
  }

  const sendReply = async () => {
    if (!reply.trim() || busy || !active) return
    setBusy(true)
    await supabase.from('ticket_messages').insert({ ticket_id: active.id, sender_id: profile!.id, is_admin: false, body: reply.trim() })
    await supabase.from('support_tickets').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', active.id)
    setReply('')
    await openTicket(active)
    setBusy(false)
  }

  const statusLabel: Record<string, string> = { open: 'مفتوحة', answered: 'تم الرد', closed: 'مغلقة' }
  const statusColor: Record<string, string> = { open: 'text-yellow-400', answered: 'text-green-400', closed: 'text-gray-500' }

  return (
    <main className="min-h-screen mesh-bg">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><LifeBuoy className="text-primary-400" size={24} /> الدعم والمساعدة</h1>
          {!active && !creating && (
            <button onClick={() => setCreating(true)} className="btn-primary text-sm py-2 flex items-center gap-1.5"><Plus size={16} /> تذكرة جديدة</button>
          )}
        </div>

        {creating ? (
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="الموضوع" className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500" />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="اشرح مشكلتك بالتفصيل..." rows={5} className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500 resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setCreating(false)} className="flex-1 border border-white/10 rounded-xl py-2.5 text-sm hover:bg-white/5">إلغاء</button>
              <button onClick={createTicket} disabled={busy} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50">{busy ? 'جارٍ الإرسال...' : 'إرسال'}</button>
            </div>
          </div>
        ) : active ? (
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-dark-800">
              <button onClick={() => { setActive(null); loadTickets() }} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm"><ArrowRight size={15} /> رجوع</button>
              <span className={`text-xs ${statusColor[active.status]}`}>{statusLabel[active.status]}</span>
            </div>
            <div className="px-5 py-3 border-b border-white/10"><div className="font-semibold text-sm">{active.subject}</div></div>
            <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
              {thread.map((m: any) => (
                <div key={m.id} className={`flex ${m.is_admin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.is_admin ? 'bg-primary-600 text-white' : 'bg-dark-700 border border-white/5'}`}>
                    <div className="text-[10px] opacity-60 mb-1">{m.is_admin ? 'فريق الدعم' : 'أنت'}</div>
                    {m.body}
                  </div>
                </div>
              ))}
            </div>
            {active.status !== 'closed' && (
              <div className="p-4 border-t border-white/10 flex gap-2">
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} placeholder="اكتب ردك..." className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500" />
                <button onClick={sendReply} disabled={busy} className="btn-primary px-3 disabled:opacity-50"><Send size={16} /></button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare size={44} className="mx-auto mb-3 text-gray-600" />
                <p>لا توجد تذاكر بعد. افتح تذكرة جديدة عند أي مشكلة.</p>
              </div>
            ) : tickets.map((t: any) => (
              <button key={t.id} onClick={() => openTicket(t)} className="w-full text-right glass-card rounded-xl p-4 border border-white/5 hover:border-primary-500/30 transition-colors flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{t.subject}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{formatDate(t.created_at)}</div>
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
