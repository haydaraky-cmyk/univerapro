'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // تتبّع الأخطاء عبر Sentry إن كان مفعّلاً
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import('@sentry/nextjs').then((Sentry) => Sentry.captureException(error)).catch(() => {})
    }
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-3">حدث خطأ غير متوقع</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          نعتذر عن الإزعاج، حدث خطأ أثناء تحميل هذا المحتوى. يمكنك إعادة المحاولة.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => reset()} className="btn-primary inline-flex items-center justify-center gap-2">
            <RotateCcw size={18} /> إعادة المحاولة
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 glass-card rounded-xl px-5 py-3 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <Home size={18} /> الرئيسية
          </Link>
        </div>
      </div>
    </main>
  )
}
