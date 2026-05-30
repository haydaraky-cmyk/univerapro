'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'
import { Bot, X, Send, Sparkles, Lock, Crown } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, max: 2 }

export default function AIAssistant() {
  const { profile } = useAuth()
  const settings = useSettings()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  // يظهر فقط لمستخدم مسجَّل والمساعد مفعّل
  if (!profile || settings.ai_assistant_enabled === 'false') return null

  const minPlan = settings.ai_min_plan || 'pro'
  const allowed = PLAN_RANK[profile.plan] >= PLAN_RANK[minPlan]
  const minPlanLabel = minPlan === 'max' ? 'ماكس' : 'برو'
  const isMax = profile.plan === 'max'

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error === 'upgrade'
          ? `هذه الميزة تتطلّب اشتراك ${data.minPlan === 'max' ? 'ماكس' : 'برو'}. يمكنك الترقية من صفحة الأسعار.`
          : data.error || 'حدث خطأ، حاول مجدداً.'
        setMessages([...next, { role: 'assistant', content: msg }])
      } else {
        setMessages([...next, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setMessages([...next, { role: 'assistant', content: 'تعذّر الاتصال، حاول مجدداً.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* زر عائم */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 left-5 z-40 w-14 h-14 rounded-full btn-primary flex items-center justify-center shadow-2xl"
          title="مساعد الدراسة الذكي"
        >
          <Bot size={24} />
        </button>
      )}

      {/* نافذة الدردشة */}
      {open && (
        <div className="fixed bottom-5 left-5 z-40 w-[92vw] max-w-sm h-[70vh] max-h-[560px] glass-card rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-dark-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center"><Sparkles size={16} /></div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  مساعد الدراسة
                  {isMax && <span className="badge-max flex items-center gap-0.5"><Crown size={10} /> ماكس</span>}
                </div>
                <div className="text-[10px] text-gray-400">مدعوم بالذكاء الاصطناعي</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
          </div>

          {!allowed ? (
            // لوحة مقفلة للمجاني — تشجيع على الترقية
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center mb-4">
                <Lock size={28} className="text-gold-400" />
              </div>
              <h3 className="font-bold mb-2">ميزة حصرية لمشتركي {minPlanLabel}</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                مساعد الدراسة الذكي متاح لمشتركي {minPlanLabel} فأعلى. اشترك للحصول على شرح فوري للدروس وحل التمارين ومساعدة دراسية على مدار الساعة.
              </p>
              <Link href="/pricing" className="btn-gold w-full">ترقية الاشتراك</Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm mt-10">
                    <Bot size={36} className="mx-auto mb-3 text-primary-400" />
                    <p>اسألني عن أي درس أو مفهوم تريد فهمه 👋</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-100 border border-white/5'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-end">
                    <div className="bg-dark-700 rounded-2xl px-4 py-3 border border-white/5">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="p-3 border-t border-white/10 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="اكتب سؤالك..."
                  className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                />
                <button onClick={send} disabled={loading} className="btn-primary px-3 py-2 disabled:opacity-50"><Send size={16} /></button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
