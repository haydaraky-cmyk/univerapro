import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { rateLimit, clientIp } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(`enroll:${clientIp(request)}`, 20, 60_000)
    if (!rl.ok) return NextResponse.redirect(new URL('/courses', request.url))

    const formData = await request.formData()
    const courseId = formData.get('courseId') as string

    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))

    const adminSupabase = createAdminSupabase()
    const { data: profile } = await adminSupabase.from('profiles').select('plan').eq('id', user.id).single()
    const { data: course } = await adminSupabase.from('courses').select('required_plan').eq('id', courseId).single()

    if (!profile || !course) return NextResponse.redirect(new URL('/courses', request.url))

    const hierarchy: Record<string, number> = { free: 0, pro: 1, max: 2 }
    if (hierarchy[profile.plan] < hierarchy[course.required_plan]) {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }

    // upsert يمنع التسجيل المكرر؛ نزيد العداد فقط عند تسجيل جديد فعلي
    const { data: existing } = await adminSupabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()

    await adminSupabase.from('enrollments').upsert(
      { user_id: user.id, course_id: courseId },
      { onConflict: 'user_id,course_id' }
    )

    if (!existing) {
      // زيادة ذرّية عبر RPC (الصياغة القديمة { increment: 1 } كانت تفسد القيمة)
      await adminSupabase.rpc('increment_students_count', { course_id_input: courseId })
    }

    return NextResponse.redirect(new URL(`/courses/${courseId}`, request.url))
  } catch (error) {
    return NextResponse.redirect(new URL('/courses', request.url))
  }
}
