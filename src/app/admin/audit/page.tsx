'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ScrollText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

const ACTION_LABEL: Record<string, string> = {
  'admin.set_password': 'تعيين كلمة مرور',
  'admin.create_user': 'إنشاء مستخدم',
  'admin.update_plan': 'تغيير الخطة',
  'admin.update_role': 'تغيير الدور',
}

export default function AdminAuditPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [logs, setLogs] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  useEffect(() => {
    if (!profile) return
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      setLogs(data || [])
      setFetching(false)
    })
  }, [profile])

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
        <span className="text-gray-600">/</span>
        <span className="font-bold">سجل التدقيق</span>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2"><ScrollText className="text-primary-400" size={24} /> سجل التدقيق</h1>
        <p className="text-gray-400 text-sm mb-6">آخر 100 إجراء حسّاس على المنصة.</p>

        {fetching ? (
          <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">لا توجد سجلات بعد</div>
        ) : (
          <div className="glass-card rounded-2xl border border-white/5 divide-y divide-white/5">
            {logs.map((l: any) => (
              <div key={l.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{ACTION_LABEL[l.action] || l.action}</span>
                  {l.target_type && <span className="text-gray-500 text-xs"> · {l.target_type}</span>}
                  <div className="text-xs text-gray-500 mt-0.5">{l.actor_email || 'نظام'}</div>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(l.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
