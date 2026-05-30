'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

export default function InstallButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // إن كان التطبيق مثبَّتاً مسبقاً (يعمل بوضع standalone) نخفي الزر
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    if (isStandalone) setInstalled(true)

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // لا نعرض الزر إن كان مثبتاً أو إن لم يتح المتصفح إمكانية التثبيت بعد
  if (installed || !deferredPrompt) return null

  const handleInstall = async () => {
    deferredPrompt.prompt()
    try {
      await deferredPrompt.userChoice
    } catch {}
    setDeferredPrompt(null)
  }

  if (fullWidth) {
    return (
      <button onClick={handleInstall} className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5">
        <Download size={16} /> تثبيت التطبيق
      </button>
    )
  }

  return (
    <button
      onClick={handleInstall}
      className="hidden sm:flex items-center gap-1.5 glass-card rounded-xl px-3 py-2 text-xs text-primary-300 hover:text-white hover:bg-white/10 transition-colors border border-primary-500/20"
      title="تثبيت التطبيق على جهازك"
    >
      <Download size={15} /> تثبيت التطبيق
    </button>
  )
}
