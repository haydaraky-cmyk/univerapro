import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { SettingsProvider } from '@/hooks/useSettings'
import PWARegister from '@/components/PWARegister'
import SentryInit from '@/components/SentryInit'
import AIAssistant from '@/components/AIAssistant'
import TelegramButton from '@/components/TelegramButton'
import { getSiteSettings, DEFAULT_SITE_NAME, DEFAULT_SITE_NAME_EN } from '@/lib/settings'

// العنوان والوصف يُولّدان ديناميكياً من إعدادات الموقع
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const name = settings.site_name || DEFAULT_SITE_NAME
  const nameEn = settings.site_name_en || DEFAULT_SITE_NAME_EN
  const description = settings.welcome_message || 'منصة تعليمية متكاملة للكورسات الجامعية وفرص العمل والتدريب'

  return {
    title: { default: `${name} | ${nameEn} - منصة التعلم الجامعي`, template: `%s | ${name}` },
    description,
    manifest: '/manifest.json',
    icons: { icon: '/icon-192.png', apple: '/apple-icon.png' },
    keywords: ['كورسات جامعية', 'تعلم', 'فرص عمل', 'تدريب', 'جامعة'],
    authors: [{ name: `${nameEn} Team` }],
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: name },
    openGraph: {
      title: `${name} - منصة التعلم الجامعي`,
      description: 'كورسات جامعية، فرص عمل، وخدمات تدريبية في مكان واحد',
      locale: 'ar_SY',
      type: 'website',
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#080c1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-arabic bg-dark-900 text-white antialiased">
        <SettingsProvider value={settings}>
          <AuthProvider>
            {children}
            <AIAssistant />
            <TelegramButton variant="floating" />
          </AuthProvider>
        </SettingsProvider>
        <PWARegister />
        <SentryInit />
      </body>
    </html>
  )
}
