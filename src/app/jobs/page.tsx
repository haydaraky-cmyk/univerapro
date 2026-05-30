import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerSupabase } from '@/lib/supabase-server'
import { Briefcase, MapPin, Clock, Building, Lock, ExternalLink, Search } from 'lucide-react'

async function getJobs(search?: string) {
  try {
    const supabase = createServerSupabase()
    let query = supabase.from('jobs').select('*').eq('status', 'published').order('created_at', { ascending: false })
    if (search) query = query.ilike('title', `%${search}%`)
    const { data } = await query.limit(30)
    return data || []
  } catch { return [] }
}

async function getUserProfile() {
  try {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    return data
  } catch { return null }
}

export const revalidate = 60

export default async function JobsPage({ searchParams }: { searchParams: { q?: string } }) {
  const [jobs, profile] = await Promise.all([getJobs(searchParams.q), getUserProfile()])
  const userPlan = profile?.plan || 'free'
  const hierarchy: Record<string, number> = { free: 0, pro: 1, max: 2 }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-3">فرص <span className="gradient-text">العمل</span></h1>
            <p className="text-gray-400">أحدث الوظائف من أفضل الشركات</p>
            {userPlan === 'free' && (
              <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2.5 mt-4 text-sm border border-primary-500/20">
                <Lock size={14} className="text-gold-400" />
                <span>اشترك للوصول إلى تفاصيل التقديم والتواصل</span>
                <Link href="/pricing" className="text-primary-400 font-medium hover:text-primary-300">ترقية ←</Link>
              </div>
            )}
          </div>

          {/* Search */}
          <form className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                name="q"
                defaultValue={searchParams.q}
                placeholder="ابحث عن وظيفة..."
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
              />
            </div>
          </form>

          {jobs.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-300 font-medium mb-1">لا توجد فرص عمل متاحة حالياً</p>
              <p className="text-gray-500 text-sm mb-6">نضيف فرصاً جديدة باستمرار، تابع المنصة لتكون أول المتقدمين.</p>
              <Link href="/contact-company" className="btn-primary inline-block">هل أنت شركة؟ انشر فرصة عمل</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job: any) => {
                const canSeeDetails = hierarchy[userPlan] >= hierarchy[job.required_plan]
                return (
                  <div key={job.id} className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg">{job.title}</h3>
                          {!canSeeDetails && <span className="badge-pro flex items-center gap-1"><Lock size={10} /> برو</span>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3 flex-wrap">
                          <span className="flex items-center gap-1.5"><Building size={13} />{job.company}</span>
                          {job.location && <span className="flex items-center gap-1.5"><MapPin size={13} />{job.location}</span>}
                          {job.job_type && <span className="flex items-center gap-1.5"><Clock size={13} />
                            {job.job_type === 'full_time' ? 'دوام كامل' : job.job_type === 'part_time' ? 'دوام جزئي' : 'عن بُعد'}
                          </span>}
                        </div>
                        {job.description && <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">{job.description}</p>}

                        {canSeeDetails ? (
                          <div className="mt-4 flex items-center gap-3 flex-wrap">
                            {job.apply_url && (
                              <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2 flex items-center gap-1.5">
                                <ExternalLink size={14} /> التقديم المباشر
                              </a>
                            )}
                            {job.apply_email && (
                              <a href={`mailto:${job.apply_email}`} className="glass-card rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition-colors">
                                📧 التواصل بالبريد
                              </a>
                            )}
                            {job.contact_info && <span className="text-sm text-gray-400">📞 {job.contact_info}</span>}
                          </div>
                        ) : (
                          <div className="mt-4 glass-card rounded-xl p-3 border border-primary-500/20 flex items-center justify-between">
                            <span className="text-sm text-gray-400">اشترك لرؤية تفاصيل التقديم والتواصل</span>
                            <Link href="/pricing" className="text-sm text-primary-400 font-medium hover:text-primary-300">اشترك الآن ←</Link>
                          </div>
                        )}
                      </div>
                      {job.salary_range && (
                        <div className="text-right hidden md:block">
                          <div className="text-xs text-gray-500 mb-0.5">الراتب</div>
                          <div className="font-bold text-green-400 text-sm">{job.salary_range}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
