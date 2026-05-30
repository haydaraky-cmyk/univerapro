'use client'

import { useEffect } from 'react'

// تهيئة Sentry في المتصفح — لا أثر لها بدون NEXT_PUBLIC_SENTRY_DSN.
export default function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) return
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({ dsn, tracesSampleRate: 0.1, replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0 })
    }).catch(() => {})
  }, [])
  return null
}
