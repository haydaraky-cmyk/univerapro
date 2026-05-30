import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerSupabase } from '@/lib/supabase-server'
import { Dumbbell, MapPin, Clock, Lock, Phone, Wifi } from 'lucide-react'

async function getTraining() {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('training_services').select('*').eq('status', 'published').order('created_at', { ascending: false })
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

export default async function TrainingPage() {
  const [services, profile] = await Promise.all([getTraining(), getUserProfile()])
  const userPlan = profile?.plan || 'free'
  const hierarchy: Record<string, number> = { free: 0, pro: 1, max: 2 }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black mb-3">خدمات <span className="gradient-text">التدريب</span></h1>
            <p className="text-gray-400">دورات ومراكز تدريب مختارة بعناية</p>
            {userPlan === 'free' && (
              <div className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2.5 mt-4 text-sm border border-primary-500/20">
                <Lock size={14} className="text-gold-400" />
                <span>اشترك للوصول لمعلومات التواصل والتفاصيل</span>
                <Link href="/pricing" className="text-primary-400 font-medium">ترقية ←</Link>
              </div>
            )}
          </div>

          {services.length === 0 ? (
            <div className="text-center py-20">
              <Dumbbell size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-300 font-medium mb-1">لا توجد خدمات تدريبية متاحة حالياً</p>
              <p className="text-gray-500 text-sm mb-6">سيتم إضافة خدمات تدريب مهني قريباً، ترقّب الجديد.</p>
              <Link href="/courses" className="btn-primary inline-block">تصفّح الكورسات بدلاً من ذلك</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service: any) => {
                const canSeeDetails = hierarchy[userPlan] >= hierarchy[service.required_plan]
                return (
                  <div key={service.id} className="glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                    {service.thumbnail_url && (
                      <img src={service.thumbnail_url} alt={service.title} className="w-full h-36 object-cover" />
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{service.title}</h3>
                        {!canSeeDetails && <span className="badge-pro flex items-center gap-1 flex-shrink-0"><Lock size={10} /> برو</span>}
                      </div>
                      <div className="font-medium text-primary-400 text-sm mb-3">{service.provider_name}</div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                        {service.is_online ? (
                          <span className="flex items-center gap-1 text-green-400"><Wifi size={11} /> أونلاين</span>
                        ) : service.location && (
                          <span className="flex items-center gap-1"><MapPin size={11} />{service.location}</span>
                        )}
                        {service.duration && <span className="flex items-center gap-1"><Clock size={11} />{service.duration}</span>}
                        {service.price && <span className="text-gold-400 font-medium">{service.price} ل.س</span>}
                      </div>

                      {service.description && <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">{service.description}</p>}

                      {canSeeDetails ? (
                        service.provider_contact && (
                          <div className="glass-card rounded-xl p-3 text-sm">
                            <span className="text-gray-400">التواصل: </span>
                            <span className="text-white font-medium">{service.provider_contact}</span>
                          </div>
                        )
                      ) : (
                        <div className="glass-card rounded-xl p-3 border border-primary-500/20 flex items-center justify-between">
                          <span className="text-xs text-gray-400">اشترك لرؤية معلومات التواصل</span>
                          <Link href="/pricing" className="text-xs text-primary-400 font-medium">اشترك ←</Link>
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
