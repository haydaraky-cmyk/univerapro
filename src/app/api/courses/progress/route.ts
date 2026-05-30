import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { rateLimit, clientIp } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`progress:${clientIp(request)}`, 60, 60_000)
    if (!rl.ok) return NextResponse.json({ error: 'محاولات كثيرة' }, { status: 429 })

    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 })

    const { courseId, videoId, completed } = await request.json().catch(() => ({}))
    if (!courseId || !videoId) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

    // تأكّد أن الطالب مسجَّل في الكورس
    const { data: enrollment } = await supabase.from('enrollments').select('id').eq('user_id', user.id).eq('course_id', courseId).maybeSingle()
    if (!enrollment) return NextResponse.json({ error: 'لست مسجّلاً في هذا الكورس' }, { status: 403 })

    if (completed === false) {
      await supabase.from('lesson_progress').delete().eq('user_id', user.id).eq('video_id', videoId)
    } else {
      await supabase.from('lesson_progress').upsert(
        { user_id: user.id, course_id: courseId, video_id: videoId, completed: true },
        { onConflict: 'user_id,video_id' }
      )
    }

    // إعادة حساب النسبة (وإصدار شهادة عند 100%)
    await supabase.rpc('recalc_course_progress', { p_user: user.id, p_course: courseId })

    const { data: enr } = await supabase.from('enrollments').select('progress_percent').eq('user_id', user.id).eq('course_id', courseId).single()
    return NextResponse.json({ ok: true, progress: enr?.progress_percent ?? 0 })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
