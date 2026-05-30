// Service Worker بسيط لتفعيل تثبيت التطبيق (PWA) ودعم أساسي للعمل دون اتصال
const CACHE = 'univera-v1'
const ASSETS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  // فقط طلبات GET ومن نفس الأصل؛ نتجنّب اعتراض طلبات Supabase وواجهات API
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  if (request.url.includes('/api/')) return

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(request).then((r) => r || caches.match('/')))
  )
})
