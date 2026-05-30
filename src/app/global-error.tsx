'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ background: '#0f1629', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>حدث خطأ في النظام</h1>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>نعتذر، حدث خطأ غير متوقع. الرجاء إعادة المحاولة.</p>
            <button
              onClick={() => reset()}
              style={{ background: '#6366f1', color: '#fff', border: 0, borderRadius: 12, padding: '0.75rem 1.5rem', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
