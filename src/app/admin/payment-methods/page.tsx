'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Wallet, ArrowRight, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'

type PM = { id?: string; name: string; account_number: string; instructions: string; icon: string; is_active: boolean; sort_order: number }

export default function AdminPaymentMethodsPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [methods, setMethods] = useState<PM[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  const load = async () => {
    const { data } = await supabase.from('payment_methods').select('*').order('sort_order')
    setMethods(data || [])
  }
  useEffect(() => { if (profile) load() }, [profile])

  const addNew = () => setMethods([...methods, { name: '', account_number: '', instructions: '', icon: '💳', is_active: true, sort_order: methods.length + 1 }])

  const update = (i: number, patch: Partial<PM>) => setMethods(methods.map((m, idx) => idx === i ? { ...m, ...patch } : m))

  const save = async (i: number) => {
    const m = methods[i]
    if (!m.name.trim()) return
    setBusy(true)
    await supabase.from('payment_methods').upsert({
      ...(m.id ? { id: m.id } : {}),
      name: m.name, account_number: m.account_number, instructions: m.instructions,
      icon: m.icon, is_active: m.is_active, sort_order: m.sort_order,
    })
    await load()
    setBusy(false)
  }

  const remove = async (i: number) => {
    const m = methods[i]
    if (!m.id) { setMethods(methods.filter((_, idx) => idx !== i)); return }
    if (!confirm('حذف طريقة الدفع؟')) return
    await supabase.from('payment_methods').delete().eq('id', m.id)
    load()
  }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
          <span className="text-gray-600">/</span>
          <span className="font-bold">طرق الدفع</span>
        </div>
        <button onClick={addNew} className="btn-primary text-sm py-2 flex items-center gap-1.5"><Plus size={16} /> إضافة</button>
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Wallet className="text-emerald-400" size={24} /> طرق الدفع</h1>

        <div className="space-y-4">
          {methods.map((m, i) => (
            <div key={m.id || i} className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex gap-3">
                <input value={m.icon} onChange={e => update(i, { icon: e.target.value })} className="w-14 text-center bg-dark-700 border border-white/10 rounded-xl py-2.5 text-lg" />
                <input value={m.name} onChange={e => update(i, { name: e.target.value })} placeholder="اسم الطريقة (مثل: شام كاش)" className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white" />
              </div>
              <input value={m.account_number} onChange={e => update(i, { account_number: e.target.value })} placeholder="رقم الحساب / المحفظة" className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white" />
              <input value={m.instructions} onChange={e => update(i, { instructions: e.target.value })} placeholder="تعليمات الدفع" className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white" />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={m.is_active} onChange={e => update(i, { is_active: e.target.checked })} className="accent-primary-500" /> مفعّلة
                </label>
                <div className="flex gap-2">
                  <button onClick={() => remove(i)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
                  <button onClick={() => save(i)} disabled={busy} className="btn-primary text-sm py-2 flex items-center gap-1.5 disabled:opacity-50"><Save size={15} /> حفظ</button>
                </div>
              </div>
            </div>
          ))}
          {methods.length === 0 && <div className="text-center py-12 text-gray-500">لا توجد طرق دفع. أضف واحدة.</div>}
        </div>
      </div>
    </main>
  )
}
