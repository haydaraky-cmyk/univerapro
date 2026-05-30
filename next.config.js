/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  // ملاحظة: serverActions أصبحت مستقرة في Next 14.2 ولا تحتاج تفعيلاً يدوياً
  images: {
    remotePatterns: [
      // يغطّي أي مشروع Supabase (storage public buckets)
      { protocol: 'https', hostname: '*.supabase.co' },
      // فيديوهات Cloudflare Stream
      { protocol: 'https', hostname: 'videodelivery.net' },
      { protocol: 'https', hostname: 'imagedelivery.net' },
    ],
  },
}

module.exports = nextConfig
