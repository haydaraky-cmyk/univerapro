import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerSupabase } from '@/lib/supabase-server'
import { BookOpen, Briefcase, Dumbbell, Star, Users, Award, ArrowLeft, Shield, Play } from 'lucide-react'

async function getStats() {
  try {
    const supabase = createServerSupabase()
    const [courses, jobs, training] = await Promise.all([
      supabase.from('courses').select('id', { count: 'exact' }).eq('status', 'published'),
      supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'published'),
      supabase.from('training_services').select('id', { count: 'exact' }).eq('status', 'published'),
    ])
    return {
      courses: courses.count || 0,
      jobs: jobs.count || 0,
      training: training.count || 0,
    }
  } catch { return { courses: 0, jobs: 0, training: 0 } }
}

async function getFeaturedCourses() {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('courses')
      .select('*, category:categories(name, icon), teacher:profiles(full_name)')
      .eq('status', 'published')
      .eq('is_featured', true)
      .limit(6)
    return data || []
  } catch { return [] }
}

async function getCategories() {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
    return data || []
  } catch { return [] }
}

async function getSettings() {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('site_settings').select('key, value')
    return Object.fromEntries(data?.map((s: any) => [s.key, s.value]) || [])
  } catch { return {} }
}

// تحديث الصفحة الرئيسية كل 60 ثانية حتى تنعكس تغييرات الأسعار من لوحة الإدارة
export const revalidate = 60

export default async function HomePage() {
  const [stats, featured, categories, settings] = await Promise.all([
    getStats(), getFeaturedCourses(), getCategories(), getSettings()
  ])

  const proPrice = parseInt(settings.pro_price_monthly || '1500').toLocaleString('ar')
  const maxPrice = parseInt(settings.max_price_monthly || '2500').toLocaleString('ar')

  return (
    <main className="min-h-screen mesh-bg">
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}}></div>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 text-sm text-primary-300 mb-6 border border-primary-500/20">
            <Star size={14} className="text-gold-400" />
            <span>منصة التعلم الجامعي رقم 1</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            تعلّم، وظِّف، <span className="gradient-text">وتطوّر</span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            كورسات جامعية متخصصة، فرص عمل حصرية، وخدمات تدريب مهني — كل ما تحتاجه في مكان واحد
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/courses" className="btn-primary flex items-center gap-2">
              <BookOpen size={18} /> استعرض الكورسات
            </Link>
            <Link href="/pricing" className="btn-gold flex items-center gap-2">
              <Star size={18} /> اشترك الآن
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: 'كورس', value: stats.courses, icon: BookOpen },
              { label: 'فرصة عمل', value: stats.jobs, icon: Briefcase },
              { label: 'خدمة تدريب', value: stats.training, icon: Dumbbell },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass-card rounded-2xl p-4 text-center">
                <Icon size={20} className="text-primary-400 mx-auto mb-2" />
                <div className="text-2xl font-black text-white">{value}+</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-center">الكليات والتخصصات</h2>
            <p className="text-gray-400 text-center mb-10">اختر تخصصك وابدأ التعلم</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.id}`}
                  className="glass-card rounded-2xl p-5 text-center hover:scale-105 transition-all duration-200 group border border-white/5 hover:border-primary-500/30"
                >
                  <div className="text-3xl mb-3">{cat.icon || '📚'}</div>
                  <div className="font-semibold text-sm group-hover:text-primary-300 transition-colors">{cat.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED COURSES */}
      {featured.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-1">كورسات مميزة</h2>
                <p className="text-gray-400">اختارها فريقنا لك</p>
              </div>
              <Link href="/courses" className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm">
                عرض الكل <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((course: any) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-200 group">
                  <div className="h-40 bg-dark-700 relative">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {course.category?.icon || '📚'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent"></div>
                    <div className="absolute bottom-3 right-3">
                      <span className={`badge-${course.required_plan}`}>
                        {course.required_plan === 'free' ? 'مجاني' : course.required_plan === 'pro' ? 'برو' : 'ماكس'}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                      <Play size={16} />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-primary-400 mb-1">{course.category?.name}</div>
                    <h3 className="font-bold text-base mb-2 line-clamp-2">{course.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{course.teacher?.full_name || 'مجهول'}</span>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-gold-400 fill-gold-400" />
                        <span>{course.rating || '0'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Users size={12} />
                      <span>{course.students_count} طالب</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PLANS PREVIEW */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">خطط الاشتراك</h2>
          <p className="text-gray-400 mb-12">ابدأ مجاناً وارقَّ حسب احتياجاتك</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                plan: 'مجاني', price: '0', period: 'دائماً', color: 'border-gray-600',
                features: ['تصفح الكورسات', 'معاينة المحتوى', 'التسجيل في المنصة'],
                cta: 'ابدأ مجاناً', link: '/auth/register', style: 'border border-gray-600 rounded-2xl p-6'
              },
              {
                plan: 'برو', price: proPrice, period: 'شهرياً', color: 'border-primary-500',
                features: ['كل الكورسات المجانية', 'فرص العمل كاملة', 'خدمات التدريب', 'مساعد الدراسة الذكي'],
                cta: 'اشترك برو', link: '/pricing', style: 'border-2 border-primary-500 rounded-2xl p-6 relative', badge: 'الأكثر طلباً'
              },
              {
                plan: 'ماكس', price: maxPrice, period: 'شهرياً', color: 'border-gold-500',
                features: ['كل مزايا برو', 'مساعد ذكي موسّع', 'أولوية في التقديم', 'محتوى حصري'],
                cta: 'اشترك ماكس', link: '/pricing', style: 'border-2 border-gold-500 rounded-2xl p-6'
              },
            ].map((item) => (
              <div key={item.plan} className={`glass-card ${item.style} text-right`}>
                {item.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                    {item.badge}
                  </div>
                )}
                <div className="font-bold text-lg mb-1">{item.plan}</div>
                <div className="text-3xl font-black mb-0.5">{item.price} <span className="text-sm font-normal text-gray-400">ل.س</span></div>
                <div className="text-xs text-gray-500 mb-6">{item.period}</div>
                <ul className="space-y-2 mb-6">
                  {item.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={item.link} className={item.plan === 'برو' ? 'btn-primary w-full block text-center' : item.plan === 'ماكس' ? 'btn-gold w-full block text-center' : 'block text-center border border-gray-600 rounded-xl py-3 hover:bg-white/5 transition-colors text-sm'}>
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'محتوى محمي', desc: 'فيديوهات محمية بـ DRM، لا يمكن تحميلها أو تسجيلها', color: 'text-blue-400' },
              { icon: Award, title: 'شهادات معتمدة', desc: 'احصل على شهادة إتمام رقمية قابلة للتحقق', color: 'text-gold-400' },
              { icon: Users, title: 'مجتمع نشط', desc: 'تواصل مع الطلاب والمعلمين والشركات', color: 'text-green-400' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card rounded-2xl p-6 text-center">
                <Icon size={32} className={`${color} mx-auto mb-4`} />
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto glass-card rounded-3xl p-10 text-center border border-primary-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-gold-500/5"></div>
          <div className="relative">
            <h2 className="text-3xl font-black mb-4">هل أنت معلم؟</h2>
            <p className="text-gray-300 mb-8">انضم إلينا وانشر كورساتك لآلاف الطلاب. نوفر لك المنصة وأنت تركز على المحتوى.</p>
            <Link href="/become-teacher" className="btn-primary inline-flex items-center gap-2">
              <BookOpen size={18} /> انضم كمعلم
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
