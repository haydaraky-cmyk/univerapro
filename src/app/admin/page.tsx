'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Users, BookOpen, Briefcase, CreditCard, Bell, Settings, BarChart2, ChevronRight, AlertCircle, Dumbbell, GraduationCap, LifeBuoy, ScrollText, Wallet } from 'lucide-react'

export default function AdminDashboard() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ users: 0, courses: 0, jobs: 0, pendingPayments: 0, pendingTeachers: 0 })

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) {
      router.push('/')
    }
  }, [loading, profile])

  useEffect(() => {
    if (!profile) return
    const supabase = createClient()
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('courses').select('id', { count: 'exact' }),
      supabase.from('jobs').select('id', { count: 'exact' }),
      supabase.from('payment_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('teacher_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
    ]).then(([u, c, j, pp, pt]) => {
      setStats({
        users: u.count || 0,
        courses: c.count || 0,
        jobs: j.count || 0,
        pendingPayments: pp.count || 0,
        pendingTeachers: pt.count || 0,
      })
    })
  }, [profile])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>
  if (!profile) return null

  const cards = [
    { label: 'المستخدمون', value: stats.users, icon: Users, color: 'text-blue-400', link: '/admin/users' },
    { label: 'الكورسات', value: stats.courses, icon: BookOpen, color: 'text-primary-400', link: '/admin/courses' },
    { label: 'فرص العمل', value: stats.jobs, icon: Briefcase, color: 'text-green-400', link: '/admin/jobs' },
    { label: 'طلبات دفع', value: stats.pendingPayments, icon: CreditCard, color: 'text-gold-400', link: '/admin/payments', badge: stats.pendingPayments > 0 },
    { label: 'طلبات معلمين', value: stats.pendingTeachers, icon: GraduationCap, color: 'text-purple-400', link: '/admin/teachers', badge: stats.pendingTeachers > 0 },
  ]

  const sections = [
    { href: '/admin/users', icon: Users, label: 'إدارة المستخدمين', desc: 'عرض وتعديل وتغيير خطط المستخدمين', color: 'text-blue-400' },
    { href: '/admin/courses', icon: BookOpen, label: 'إدارة الكورسات', desc: 'إضافة وتعديل ونشر الكورسات', color: 'text-primary-400' },
    { href: '/admin/jobs', icon: Briefcase, label: 'إدارة فرص العمل', desc: 'نشر ومراجعة فرص العمل', color: 'text-green-400' },
    { href: '/admin/training', icon: Dumbbell, label: 'خدمات التدريب', desc: 'إدارة خدمات التدريب', color: 'text-yellow-400' },
    { href: '/admin/payments', icon: CreditCard, label: 'طلبات الدفع', desc: 'مراجعة وتفعيل اشتراكات المستخدمين', color: 'text-gold-400', alert: stats.pendingPayments },
    { href: '/admin/teachers', icon: GraduationCap, label: 'طلبات المعلمين', desc: 'مراجعة طلبات الانضمام كمعلم', color: 'text-purple-400', alert: stats.pendingTeachers },
    { href: '/admin/notifications', icon: Bell, label: 'إرسال إشعار', desc: 'إرسال إشعارات للمستخدمين', color: 'text-red-400' },
    { href: '/admin/tickets', icon: LifeBuoy, label: 'تذاكر الدعم', desc: 'الرد على رسائل المستخدمين', color: 'text-cyan-400' },
    { href: '/admin/payment-methods', icon: Wallet, label: 'طرق الدفع', desc: 'إضافة وتعديل طرق الدفع المتاحة', color: 'text-emerald-400' },
    { href: '/admin/audit', icon: ScrollText, label: 'سجل التدقيق', desc: 'مراجعة الإجراءات الحسّاسة', color: 'text-orange-400' },
    { href: '/admin/settings', icon: Settings, label: 'إعدادات الموقع', desc: 'تعديل الأسعار والمعلومات العامة', color: 'text-gray-400' },
  ]

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center font-bold text-sm">U</div>
          </Link>
          <span className="text-gray-600">|</span>
          <span className="font-bold text-gold-400">لوحة الإدارة</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{profile.full_name}</span>
          <Link href="/dashboard" className="text-sm text-primary-400 hover:text-primary-300">لوحة المستخدم</Link>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">مرحباً، {profile.full_name} ⚙️</h1>
          <p className="text-gray-400 text-sm">لوحة تحكم الإدارة الكاملة</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {cards.map(({ label, value, icon: Icon, color, link, badge }) => (
            <Link key={label} href={link} className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all relative group">
              {badge && value > 0 && (
                <div className="absolute top-3 left-3 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">{value}</div>
              )}
              <Icon size={22} className={`${color} mb-3`} />
              <div className="text-2xl font-black mb-0.5">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </Link>
          ))}
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map(({ href, icon: Icon, label, desc, color, alert }) => (
            <Link key={href} href={href} className="glass-card rounded-2xl p-5 hover:bg-white/5 transition-colors flex items-center gap-4 group">
              <div className={`w-12 h-12 rounded-2xl bg-dark-700 flex items-center justify-center ${color} flex-shrink-0`}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <div className="font-bold flex items-center gap-2">
                  {label}
                  {alert && alert > 0 && (
                    <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">{alert}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
