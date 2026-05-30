import Link from 'next/link'
import { Home, Search, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-black gradient-text mb-2">404</div>
        <h1 className="text-2xl font-bold mb-3">الصفحة غير موجودة</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير متوفرة أو ربما تم نقلها أو حذفها.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <Home size={18} /> الصفحة الرئيسية
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 glass-card rounded-xl px-5 py-3 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <Search size={18} /> تصفّح الكورسات
          </Link>
        </div>
        <Link href="/" className="mt-8 inline-flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
          العودة للخلف <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  )
}
