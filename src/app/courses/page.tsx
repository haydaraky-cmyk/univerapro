import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerSupabase } from '@/lib/supabase-server'
import { BookOpen, Star, Users, Search, Filter, Play, Lock } from 'lucide-react'

async function getCourses(opts: { categoryId?: string; search?: string; level?: string; plan?: string; sort?: string }) {
  try {
    const supabase = createServerSupabase()
    let query = supabase
      .from('courses')
      .select('*, category:categories(name, icon, color), teacher:profiles(full_name)')
      .eq('status', 'published')
    if (opts.categoryId) query = query.eq('category_id', opts.categoryId)
    if (opts.search) query = query.ilike('title', `%${opts.search}%`)
    if (opts.level) query = query.eq('level', opts.level)
    if (opts.plan) query = query.eq('required_plan', opts.plan)

    if (opts.sort === 'rating') query = query.order('rating', { ascending: false })
    else if (opts.sort === 'students') query = query.order('students_count', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    const { data } = await query.limit(40)
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

export const revalidate = 60

export default async function CoursesPage({ searchParams }: { searchParams: { category?: string; q?: string; level?: string; plan?: string; sort?: string } }) {
  const [courses, categories] = await Promise.all([
    getCourses({ categoryId: searchParams.category, search: searchParams.q, level: searchParams.level, plan: searchParams.plan, sort: searchParams.sort }),
    getCategories()
  ])

  const planBadge: Record<string, string> = { free: 'badge-free', pro: 'badge-pro', max: 'badge-max' }
  const planLabel: Record<string, string> = { free: 'مجاني', pro: 'برو', max: 'ماكس' }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black mb-3">الكورسات <span className="gradient-text">الجامعية</span></h1>
            <p className="text-gray-400">تعلم من أفضل الأساتذة والمتخصصين</p>
          </div>

          {/* Search & Filters */}
          <div className="mb-8">
            <form className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  name="q"
                  defaultValue={searchParams.q}
                  placeholder="ابحث عن كورس..."
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                />
              </div>
              {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
              <select name="level" defaultValue={searchParams.level || ''} className="bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white">
                <option value="">كل المستويات</option>
                <option value="beginner">مبتدئ</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
              <select name="plan" defaultValue={searchParams.plan || ''} className="bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white">
                <option value="">كل الخطط</option>
                <option value="free">مجاني</option>
                <option value="pro">برو</option>
                <option value="max">ماكس</option>
              </select>
              <select name="sort" defaultValue={searchParams.sort || ''} className="bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white">
                <option value="">الأحدث</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="students">الأكثر طلاباً</option>
              </select>
              <button type="submit" className="btn-primary text-sm py-3 px-5 flex items-center gap-1.5"><Filter size={15} /> تصفية</button>
            </form>
          </div>

          {/* Category Filter */}
          <div className="flex gap-3 flex-wrap mb-8">
            <Link href="/courses" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!searchParams.category ? 'bg-primary-500 text-white' : 'glass-card text-gray-300 hover:text-white'}`}>
              الكل
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.id}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${searchParams.category === cat.id ? 'bg-primary-500 text-white' : 'glass-card text-gray-300 hover:text-white'}`}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>

          {/* Results */}
          {courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-300 font-medium mb-1">
                {searchParams.q || searchParams.category ? 'لا توجد نتائج مطابقة' : 'لا توجد كورسات متاحة حالياً'}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {searchParams.q || searchParams.category
                  ? 'جرّب تعديل البحث أو تصفّح كل الكورسات'
                  : 'نعمل على إضافة كورسات جديدة قريباً، تابعنا!'}
              </p>
              {(searchParams.q || searchParams.category) ? (
                <Link href="/courses" className="btn-primary inline-block">عرض كل الكورسات</Link>
              ) : (
                <Link href="/become-teacher" className="btn-primary inline-block">كن أول معلّم على المنصة</Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {courses.map((course: any) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all group">
                  <div className="h-36 bg-dark-700 relative">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {course.category?.icon || '📚'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 to-transparent"></div>
                    <div className="absolute bottom-2 right-2">
                      <span className={planBadge[course.required_plan]}>{planLabel[course.required_plan]}</span>
                    </div>
                    <div className="absolute top-2 left-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                      {course.required_plan === 'free' ? <Play size={14} /> : <Lock size={12} />}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-primary-400 mb-1">{course.category?.name}</div>
                    <h3 className="font-bold text-sm mb-2 line-clamp-2 leading-relaxed">{course.title}</h3>
                    <div className="text-xs text-gray-400 mb-2">{course.teacher?.full_name}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users size={11} />
                        <span>{course.students_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-gold-400 fill-gold-400" />
                        <span>{course.rating || '0'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
