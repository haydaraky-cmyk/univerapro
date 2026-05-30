'use client'

import { useSettings } from '@/hooks/useSettings'
import { Send } from 'lucide-react'

// زر التواصل عبر تلغرام (قناة الفيديوهات/الدعم). يظهر فقط عند ضبط الرابط من لوحة الإدارة.
export default function TelegramButton({
  variant = 'inline',
  label = 'تواصل عبر تلغرام',
}: {
  variant?: 'inline' | 'block' | 'floating'
  label?: string
}) {
  const settings = useSettings()
  const url = settings.telegram_url || settings.telegram_admin
  if (!url) return null

  const href = url.startsWith('http') ? url : `https://t.me/${url.replace('@', '')}`

  if (variant === 'floating') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl text-white"
        style={{ background: 'linear-gradient(135deg,#2AABEE,#229ED9)' }}
        title="تواصل عبر تلغرام"
      >
        <Send size={22} />
      </a>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-white transition-transform hover:-translate-y-0.5 ${variant === 'block' ? 'w-full px-5 py-3' : 'px-4 py-2.5 text-sm'}`}
      style={{ background: 'linear-gradient(135deg,#2AABEE,#229ED9)' }}
    >
      <Send size={18} /> {label}
    </a>
  )
}
