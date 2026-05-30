// تهيئة Sentry على الخادم — تعمل فقط عند ضبط SENTRY_DSN، وإلا فهي بلا أثر.
export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return

  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs')
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      enabled: true,
    })
  }
}
