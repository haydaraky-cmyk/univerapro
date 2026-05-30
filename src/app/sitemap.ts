import type { MetadataRoute } from 'next'
import { createServerSupabase } from '@/lib/supabase-server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://univera.vercel.app'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/courses', '/jobs', '/training', '/pricing', '/become-teacher', '/contact-company']
    .map((path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }))

  let courseRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('courses')
      .select('id, updated_at')
      .eq('status', 'published')
      .limit(1000)
    courseRoutes = (data || []).map((c: any) => ({
      url: `${BASE_URL}/courses/${c.id}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {
    courseRoutes = []
  }

  return [...staticRoutes, ...courseRoutes]
}
