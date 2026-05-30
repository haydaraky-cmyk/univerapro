import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import CourseLessons from '@/components/courses/CourseLessons'
import TelegramButton from '@/components/TelegramButton'
import { createServerSupabase } from '@/lib/supabase-server'
import { canAccess } from '@/lib/utils'
import { Play, Lock, Star, Users, Clock, Award, BookOpen, ArrowRight } from 'lucide-react'

async function getCourse(id: string) {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase
      .from('courses')
      .select('*, category:categories(name, icon), teacher:profiles(full_name, bio, avatar_url), videos:course_videos(*)' )
      .eq('id', id)
      .eq('status', 'published')
      .single()
    return data
  } catch { return null }
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

async function getEnrollment(userId: string, courseId: string) {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('enrollments').select('*').eq('user_id', userId).eq('course_id', courseId).single()
    return data
  } catch { return null }
}

async function getCompletedLessons(userId: string, courseId: string) {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('lesson_progress').select('video_id').eq('user_id', userId).eq('course_id', courseId).eq('completed', true)
    return (data || []).map((r: any) => r.video_id)
  } catch { return [] }
}

export default async function CoursePage({ params }: { params: { id: string } }) {
  const [course, profile] = await Promise.all([getCourse(params.id), getUserProfile()])
  if (!course) notFound()

  const enrollment = profile ? await getEnrollment(profile.id, course.id) : null
  const completedLessons = profile && enrollment ? await getCompletedLessons(profile.id, course.id) : []
  const hasAccess = profile && canAccess(profile.plan, course.required_plan)
  const videos = course.videos?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
  const previewVideos = videos.filter((v: any) => v.is_preview)
  const accessibleVideos = hasAccess ? videos : previewVideos

  const planLabel: Record<string, string> = { free: 'مجاني', pro: 'يحتاج برو', max: 'يحتاج ماكس' }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        {/* Hero */}
        <div className="bg-dark-800 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <Link href="/courses" className="hover:text-white flex items-center gap-1"><ArrowRight size={14} /> الكورسات</Link>
                <span>/</span>
                <span>{course.category?.name}</span>
              </div>
              <h1 className="text-3xl font-black mb-4 leading-tight">{course.title}</h1>
              <p className="text-gray-300 mb-6 leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5"><Star size={14} className="text-gold-400 fill-gold-400" />{course.rating} تقييم</div>
                <div className="flex items-center gap-1.5"><Users size={14} />{course.students_count} طالب</div>
                <div className="flex items-center gap-1.5"><Clock size={14} />{course.duration_hours} ساعة</div>
                <div className="flex items-center gap-1.5"><BookOpen size={14} />{videos.length} درس</div>
              </div>
              <div className="mt-4 text-sm">المدرب: <span className="text-primary-400 font-medium">{course.teacher?.full_name}</span></div>
            </div>

            {/* Enroll card */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 h-fit">
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-36 object-cover rounded-xl mb-4" />
              )}
              <div className="text-center mb-4">
                {course.required_plan === 'free' ? (
                  <span className="text-2xl font-black text-green-400">مجاني</span>
                ) : (
                  <span className="text-sm text-gray-400">{planLabel[course.required_plan]}</span>
                )}
              </div>
              {!profile ? (
                <Link href="/auth/register" className="btn-primary w-full block text-center mb-3">إنشاء حساب مجاناً</Link>
              ) : !hasAccess ? (
                <Link href="/pricing" className="btn-gold w-full block text-center mb-3">ترقية الاشتراك</Link>
              ) : !enrollment ? (
                <EnrollButton courseId={course.id} />
              ) : (
                <div className="text-center text-green-400 text-sm font-medium py-3">✓ مسجل في الكورس</div>
              )}
              <ul className="space-y-2 text-sm text-gray-400 mt-4">
                <li className="flex items-center gap-2"><Award size={14} /> شهادة إتمام</li>
                <li className="flex items-center gap-2"><Play size={14} /> {videos.length} درس فيديو</li>
                <li className="flex items-center gap-2"><Clock size={14} /> {course.duration_hours} ساعات تعليمية</li>
              </ul>
              <div className="mt-4">
                <TelegramButton variant="block" label="قناة الفيديوهات على تلغرام" />
              </div>
            </div>
          </div>
        </div>

        {/* Videos list */}
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">محتوى الكورس</h2>
            <CourseLessons
              courseId={course.id}
              videos={videos}
              hasAccess={!!hasAccess}
              enrolled={!!enrollment}
              initialCompleted={completedLessons}
              initialProgress={enrollment?.progress_percent || 0}
            />
          </div>

          {/* Teacher info */}
          <div>
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold mb-4">عن المدرب</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-lg font-bold">
                  {course.teacher?.full_name?.[0]}
                </div>
                <div>
                  <div className="font-semibold">{course.teacher?.full_name}</div>
                  <div className="text-xs text-gray-400">{course.category?.name}</div>
                </div>
              </div>
              {course.teacher?.bio && <p className="text-sm text-gray-400 leading-relaxed">{course.teacher.bio}</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function EnrollButton({ courseId }: { courseId: string }) {
  return (
    <form action={`/api/courses/enroll`} method="POST">
      <input type="hidden" name="courseId" value={courseId} />
      <button type="submit" className="btn-primary w-full">التسجيل في الكورس</button>
    </form>
  )
}
