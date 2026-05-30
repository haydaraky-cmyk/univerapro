// محدِّد معدّل بسيط في الذاكرة (نافذة منزلقة) لحماية المسارات الحسّاسة من إساءة الاستخدام.
// ملاحظة: على Vercel السيرفرلس قد تتعدّد النسخ؛ هذا يكفي كحماية أساسية.
// للحماية الموزّعة الكاملة يُنصح لاحقاً بـ Upstash Redis.

type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { ok: true, retryAfter: 0 }
}

// تنظيف دوري خفيف لتفادي تضخّم الذاكرة
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    store.forEach((v, k) => { if (now > v.resetAt) store.delete(k) })
  }, 60_000).unref?.()
}

export function clientIp(req: Request): string {
  const h = req.headers
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  )
}
