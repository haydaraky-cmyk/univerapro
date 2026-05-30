'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSiteName } from '@/hooks/useSettings'
import { PLAN_LABELS } from '@/lib/utils'
import InstallButton from '@/components/InstallButton'
import { Menu, X, Bell, User, LogOut, BookOpen, Briefcase, Dumbbell, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const siteName = useSiteName()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center font-bold text-sm">{siteName[0]}</div>
          <span className="text-xl font-bold gradient-text">{siteName}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/courses" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
            <BookOpen size={16} /> الكورسات
          </Link>
          <Link href="/jobs" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
            <Briefcase size={16} /> فرص العمل
          </Link>
          <Link href="/training" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
            <Dumbbell size={16} /> التدريب
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">الأسعار</Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <InstallButton />
          {profile ? (
            <>
              <Link href="/dashboard/notifications" className="relative p-2 text-gray-400 hover:text-white">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 glass-card rounded-xl px-3 py-2 hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
                    {profile.full_name[0]}
                  </div>
                  <span className="text-sm hidden md:block">{profile.full_name}</span>
                  <span className={`badge-${profile.plan}`}>{PLAN_LABELS[profile.plan]}</span>
                  <ChevronDown size={14} />
                </button>
                {profileOpen && (
                  <div className="absolute left-0 top-12 w-48 glass-card rounded-xl border border-white/10 shadow-2xl py-2 z-50">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 text-sm" onClick={() => setProfileOpen(false)}>
                      <User size={15} /> لوحة التحكم
                    </Link>
                    <Link href="/dashboard/support" className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 text-sm" onClick={() => setProfileOpen(false)}>
                      🛟 الدعم والمساعدة
                    </Link>
                    {(profile.role === 'admin' || profile.role === 'staff') && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 text-sm text-gold-400" onClick={() => setProfileOpen(false)}>
                        ⚙️ الإدارة
                      </Link>
                    )}
                    <hr className="border-white/10 my-1" />
                    <button onClick={signOut} className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 text-sm text-red-400 w-full">
                      <LogOut size={15} /> تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white px-3 py-2">دخول</Link>
              <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">إنشاء حساب</Link>
            </div>
          )}
          {/* Mobile menu */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-card border-t border-white/10 p-4 flex flex-col gap-3">
          <Link href="/courses" className="flex items-center gap-2 py-2" onClick={() => setOpen(false)}><BookOpen size={16} /> الكورسات</Link>
          <Link href="/jobs" className="flex items-center gap-2 py-2" onClick={() => setOpen(false)}><Briefcase size={16} /> فرص العمل</Link>
          <Link href="/training" className="flex items-center gap-2 py-2" onClick={() => setOpen(false)}><Dumbbell size={16} /> التدريب</Link>
          <Link href="/pricing" className="py-2" onClick={() => setOpen(false)}>الأسعار</Link>
          <div className="pt-2"><InstallButton fullWidth /></div>
        </div>
      )}
    </nav>
  )
}
