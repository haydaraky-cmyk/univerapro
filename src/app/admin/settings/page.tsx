'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Settings, Save, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const SETTINGS_FIELDS = [
  { key: 'site_name', label: 'اسم الموقع (عربي)', type: 'text' },
  { key: 'site_name_en', label: 'اسم الموقع (إنجليزي)', type: 'text' },
  { key: 'pro_price_monthly', label: 'سعر برو الشهري (ل.س)', type: 'number' },
  { key: 'max_price_monthly', label: 'سعر ماكس الشهري (ل.س)', type: 'number' },
  { key: 'sham_cash_number', label: 'رقم شام كاش', type: 'text' },
  { key: 'syriatel_cash_number', label: 'رقم سيريتل كاش', type: 'text' },
  { key: 'telegram_url', label: 'رابط قناة تلغرام (للفيديوهات/التواصل)', type: 'text' },
  { key: 'telegram_admin', label: 'حساب الأدمن على تلغرام (مثال: @username)', type: 'text' },
  { key: 'ai_assistant_enabled', label: 'تفعيل مساعد الذكاء (true / false)', type: 'text' },
  { key: 'ai_min_plan', label: 'أدنى خطة للمساعد (free / pro / max)', type: 'text' },
  { key: 'admin_email', label: 'البريد الإلكتروني للإدارة', type: 'email' },
  { key: 'welcome_message', label: 'رسالة الترحيب', type: 'text' },
]

export default function AdminSettingsPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'admin')) router.push('/')
  }, [loading, profile])

  useEffect(() => {
    if (!profile) return
    const supabase = createClient()
    supabase.from('site_settings').select('*').then(({ data }) => {
      const s: Record<string, string> = {}
      data?.forEach((d: any) => { s[d.key] = d.value })
      setSettings(s)
    })
  }, [profile])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
      )
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
          <span className="text-gray-600">/</span>
          <span className="font-bold">الإعدادات</span>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 flex items-center gap-1.5 disabled:opacity-50">
          {saved ? <><CheckCircle size={16} /> تم الحفظ</> : saving ? 'جارٍ الحفظ...' : <><Save size={16} /> حفظ الإعدادات</>}
        </button>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Settings className="text-gray-400" size={24} /> إعدادات الموقع
        </h1>

        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
          {SETTINGS_FIELDS.map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-sm text-gray-300 mb-1.5 block">{label}</label>
              <input
                type={type}
                value={settings[key] || ''}
                onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
