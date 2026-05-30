import { createAdminSupabase } from './supabase-server'

type AuditInput = {
  actorId?: string | null
  actorEmail?: string | null
  action: string
  targetType?: string
  targetId?: string
  details?: Record<string, any>
}

// تسجيل إجراء حسّاس في سجل التدقيق. لا يرمي خطأً أبداً حتى لا يُعطّل العملية الأصلية.
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    const admin = createAdminSupabase()
    await admin.from('audit_logs').insert({
      actor_id: input.actorId ?? null,
      actor_email: input.actorEmail ?? null,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      details: input.details ?? null,
    })
  } catch {
    // تجاهل أخطاء التسجيل
  }
}
