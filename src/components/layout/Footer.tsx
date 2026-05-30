'use client'

import Link from 'next/link'
import { useSiteName } from '@/hooks/useSettings'

export default function Footer() {
  const siteName = useSiteName()
  return (
    <footer className="border-t border-white/10 mt-20 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center font-bold text-sm">{siteName[0]}</div>
              <span className="text-xl font-bold gradient-text">{siteName}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">منصة تعليمية متكاملة للكورسات الجامعية، فرص العمل، والتدريب المهني.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white">المنصة</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/courses" className="hover:text-white transition-colors">الكورسات</Link>
              <Link href="/jobs" className="hover:text-white transition-colors">فرص العمل</Link>
              <Link href="/training" className="hover:text-white transition-colors">خدمات التدريب</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">الأسعار</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white">للمعلمين والشركات</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <Link href="/become-teacher" className="hover:text-white transition-colors">انضم كمعلم</Link>
              <Link href="/contact-company" className="hover:text-white transition-colors">نشر فرصة عمل</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-white">الدفع</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <span>📱 شام كاش</span>
              <span>📱 سيريتل كاش</span>
              <Link href="/pricing" className="text-primary-400 hover:text-primary-300">عرض الأسعار ←</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} {siteName} - جميع الحقوق محفوظة</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300">الخصوصية</Link>
            <Link href="/terms" className="hover:text-gray-300">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
