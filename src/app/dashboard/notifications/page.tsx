'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { Bell, ArrowRight, CheckCheck } from 'lucide-react'
import Link from 'next/link'

export default function NotificationsPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !profile) router.push('/auth/login')
  }, [loading, profile])

  const fetchNotifications = async () => {
    if (!profile) return
    const supabase = createClient()
    const { data } = await supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
    setNotifications(data || [])
    setFetching(false)
  }

  useEffect(() => { fetchNotifications() }, [profile])

  const markAllRead = async () => {
    if (!profile) return
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile.id)
    setNotifications(n => n.map(x => ({ ...x, is_read: true })))
  }

  const typeColors: Record<string, string> = {
    success: 'border-green-500/30 bg-green-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    info: 'border-primary-500/20 bg-primary-500/5',
  }
  const typeIcons: Record<string, string> = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }

  if (loading || !profile) return null

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> لوحة التحكم</Link>
              <span className="text-gray-600">/</span>
              <span className="font-bold flex items-center gap-1.5"><Bell size={16} /> الإشعارات</span>
            </div>
            {notifications.some(n => !n.is_read) && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                <CheckCheck size={16} /> تعليم الكل كمقروء
              </button>
            )}
          </div>

          {fetching ? (
            <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Bell size={40} className="mx-auto mb-3 opacity-30" />
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n: any) => (
                <div key={n.id} className={`rounded-2xl p-5 border transition-colors ${typeColors[n.type] || typeColors.info} ${!n.is_read ? 'ring-1 ring-primary-500/20' : 'opacity-70'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{typeIcons[n.type] || 'ℹ️'}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm">{n.title}</div>
                      <div className="text-gray-300 text-sm mt-1 leading-relaxed">{n.message}</div>
                      <div className="text-xs text-gray-500 mt-2">{new Date(n.created_at).toLocaleString('ar-SY')}</div>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
