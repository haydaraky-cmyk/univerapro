'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { Award, ArrowRight, Download } from 'lucide-react'
import Link from 'next/link'

export default function CertificatesPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [certs, setCerts] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !profile) router.push('/auth/login')
  }, [loading, profile])

  useEffect(() => {
    if (!profile) return
    const supabase = createClient()
    supabase.from('certificates')
      .select('*, course:courses(title, category:categories(name, icon), teacher:profiles(full_name))')
      .eq('user_id', profile.id)
      .order('issued_at', { ascending: false })
      .then(({ data }) => { setCerts(data || []); setFetching(false) })
  }, [profile])

  if (loading || !profile) return null

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> لوحة التحكم</Link>
            <span className="text-gray-600">/</span>
            <span className="font-bold flex items-center gap-1.5"><Award size={16} /> شهاداتي</span>
          </div>

          {fetching ? (
            <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>
          ) : certs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Award size={40} className="mx-auto mb-3 opacity-30" />
              <p className="mb-2">لا توجد شهادات بعد</p>
              <p className="text-xs text-gray-600">أتمم كورساً للحصول على شهادتك</p>
              <Link href="/courses" className="btn-primary text-sm py-2 mt-4 inline-block">ابدأ التعلم</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {certs.map((cert: any) => (
                <div key={cert.id} className="glass-card rounded-2xl overflow-hidden border border-gold-500/20">
                  <div className="bg-gradient-to-br from-dark-700 to-dark-800 p-6 text-center">
                    <Award size={40} className="text-gold-400 mx-auto mb-3" />
                    <div className="text-xs text-gray-400 mb-1">شهادة إتمام</div>
                    <h3 className="font-bold text-lg mb-1">{cert.course?.title}</h3>
                    <div className="text-sm text-gray-400">{cert.course?.category?.name}</div>
                    <div className="text-xs text-gray-500 mt-2">بإشراف: {cert.course?.teacher?.full_name}</div>
                  </div>
                  <div className="p-4 flex items-center justify-between border-t border-white/5">
                    <div>
                      <div className="text-xs text-gray-500">رقم الشهادة</div>
                      <div className="font-mono text-sm text-gold-400">{cert.certificate_number}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500">تاريخ الإصدار</div>
                      <div className="text-xs text-gray-300">{new Date(cert.issued_at).toLocaleDateString('ar-SY')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
