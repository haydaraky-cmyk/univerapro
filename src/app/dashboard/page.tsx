'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { PLAN_LABELS, formatDate } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import { BookOpen, Briefcase, Award, Bell, CreditCard, User, Clock, Star } from 'lucide-react'

export default function DashboardPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !profile) router.push('/auth/login')
  }, [loading, profile])

  useEffect(() => {
    if (!profile) return
    const supabase = createClient()
    Promise.all([
      supabase.from('enrollments').select('*, course:courses(title, thumbnail_url, category:categories(name, icon))').eq('user_id', profile.id).limit(5),
      supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('payment_requests').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(3),
    ]).then(([e, n, p]) => {
      setEnrollments(e.data || [])
      setNotifications(n.data || [])
      setPayments(p.data || [])
    })
  }, [profile])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>
  if (!profile) return null

  const planExpired = profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome */}
          <div className="glass-card rounded-2xl p-6 mb-6 border border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-gray-400 text-sm mb-1">مرحباً بك</div>
              <h1 className="text-2xl font-bold">{profile.full_name} 👋</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge-${profile.plan} text-sm px-3 py-1`}>{PLAN_LABELS[profile.plan]}</span>
                {profile.plan !== 'free' && profile.plan_expires_at && (
                  <span className={`text-xs ${planExpired ? 'text-red-400' : 'text-gray-400'}`}>
                    {planExpired ? '⚠️ الاشتراك منتهٍ' : `ينتهي: ${formatDate(profile.plan_expires_at)}`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {profile.plan !== 'max' && (
                <Link href="/dashboard/upgrade" className="btn-gold text-sm py-2">ترقية الخطة ⭐</Link>
              )}
              <Link href="/dashboard/profile" className="glass-card rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition-colors flex items-center gap-1.5">
                <User size={14} /> الملف
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* My Courses */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold flex items-center gap-2"><BookOpen size={18} className="text-primary-400" /> كورساتي</h2>
                  <Link href="/courses" className="text-sm text-primary-400 hover:text-primary-300">استكشف المزيد</Link>
                </div>
                {enrollments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">لم تسجل في أي كورس بعد</p>
                    <Link href="/courses" className="btn-primary text-sm py-2 mt-3 inline-block">ابدأ التعلم</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((e: any) => (
                      <Link key={e.id} href={`/courses/${e.course_id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                        <div className="w-14 h-14 rounded-xl bg-dark-700 flex items-center justify-center text-2xl flex-shrink-0">
                          {e.course?.category?.icon || '📚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{e.course?.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{e.course?.category?.name}</div>
                          <div className="w-full bg-dark-700 rounded-full h-1.5 mt-2">
                            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${e.progress_percent}%` }}></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{e.progress_percent}% مكتمل</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment requests */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold flex items-center gap-2"><CreditCard size={18} className="text-gold-400" /> طلبات الدفع</h2>
                  <Link href="/dashboard/upgrade" className="text-sm text-primary-400 hover:text-primary-300">طلب جديد</Link>
                </div>
                {payments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">لا توجد طلبات دفع</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-700">
                        <div>
                          <div className="text-sm font-medium">
                            {p.method === 'sham_cash' ? 'شام كاش' : 'سيريتل كاش'} — خطة {p.requested_plan === 'pro' ? 'برو' : 'ماكس'}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5"># {p.transaction_number}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          p.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          p.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {p.status === 'approved' ? 'مقبول' : p.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Quick links */}
              <div className="glass-card rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold mb-4 text-sm text-gray-300">روابط سريعة</h3>
                <div className="space-y-2">
                  {[
                    { href: '/courses', icon: BookOpen, label: 'الكورسات', color: 'text-primary-400' },
                    { href: '/jobs', icon: Briefcase, label: 'فرص العمل', color: 'text-green-400' },
                    { href: '/training', icon: Star, label: 'التدريب', color: 'text-gold-400' },
                    { href: '/dashboard/certificates', icon: Award, label: 'شهاداتي', color: 'text-purple-400' },
                    { href: '/dashboard/upgrade', icon: CreditCard, label: 'ترقية الخطة', color: 'text-gold-400' },
                  ].map(({ href, icon: Icon, label, color }) => (
                    <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-sm">
                      <Icon size={16} className={color} />
                      {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="glass-card rounded-2xl p-5 border border-white/10">
                <h3 className="font-bold mb-4 text-sm text-gray-300 flex items-center gap-2">
                  <Bell size={14} /> الإشعارات
                </h3>
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-3">لا توجد إشعارات</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n: any) => (
                      <div key={n.id} className={`p-3 rounded-xl text-sm ${n.is_read ? 'opacity-60' : 'bg-primary-500/10 border border-primary-500/20'}`}>
                        <div className="font-medium text-xs">{n.title}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{n.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
