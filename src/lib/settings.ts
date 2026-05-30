import { cache } from 'react'
import { createServerSupabase } from './supabase-server'

export type SiteSettings = Record<string, string>

export const DEFAULT_SITE_NAME = 'يونيفيرا'
export const DEFAULT_SITE_NAME_EN = 'UniVera'

// React cache: يُنفَّذ مرة واحدة لكل طلب ويُشارك بين layout والصفحات
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('site_settings').select('key, value')
    return Object.fromEntries(data?.map((s: any) => [s.key, s.value]) || [])
  } catch {
    return {}
  }
})
