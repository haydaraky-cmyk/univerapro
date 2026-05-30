import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { rateLimit, clientIp } from '@/lib/rateLimit'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    // حماية من إساءة الاستخدام
    const rl = rateLimit(`setpw:${clientIp(request)}`, 10, 60_000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'محاولات كثيرة، حاول لاحقاً' }, { status: 429 })
    }

    // 1) التحقق من هوية الطالب (من الجلسة، وليس من بيانات يرسلها العميل)
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 })
    }

    // 2) التحقق من أن المستدعي أدمن (الموظف/staff لا يملك هذه الصلاحية)
    const admin = createAdminSupabase()
    const { data: caller } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (!caller || caller.role !== 'admin') {
      return NextResponse.json({ error: 'هذه العملية تتطلّب صلاحية أدمن' }, { status: 403 })
    }

    // 3) قراءة المُدخلات والتحقق منها
    const body = await request.json().catch(() => ({}))
    const { userId, newPassword } = body as { userId?: string; newPassword?: string }
    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })
    }

    // 4) تعيين كلمة المرور عبر Admin API (يُخزَّن الهاش فقط — لا يمكن استرجاع كلمة المرور أبداً)
    const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword })
    if (error) {
      return NextResponse.json({ error: 'تعذّر تحديث كلمة المرور' }, { status: 500 })
    }

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'admin.set_password',
      targetType: 'user',
      targetId: userId,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
