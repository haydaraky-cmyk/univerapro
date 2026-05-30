import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rateLimit'

const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, max: 2 }

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 })

    const { data: settingsRows } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['ai_assistant_enabled', 'ai_min_plan'])
    const settings = Object.fromEntries((settingsRows || []).map((s: any) => [s.key, s.value]))
    if (settings.ai_assistant_enabled === 'false') {
      return NextResponse.json({ error: 'المساعد غير مفعّل حالياً' }, { status: 403 })
    }

    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    const plan = profile?.plan || 'free'
    const minPlan = settings.ai_min_plan || 'pro'

    if (PLAN_RANK[plan] < PLAN_RANK[minPlan]) {
      return NextResponse.json({ error: 'upgrade', minPlan }, { status: 402 })
    }

    const isMax = plan === 'max'
    const perMinuteLimit = isMax ? 40 : 20
    const rl = rateLimit(ai:${user.id}, perMinuteLimit, 60_000)
    if (!rl.ok) return NextResponse.json({ error: محاولات كثيرة، انتظر ${rl.retryAfter} ثانية }, { status: 429 })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'المساعد غير مهيّأ بعد' }, { status: 503 })

    const body = await request.json().catch(() => ({}))
    const historyLen = isMax ? 20 : 10
    const messages = Array.isArray(body.messages) ? body.messages.slice(-historyLen) : []

    const basePrompt =
      'أنت مساعد تعليمي ودود على منصة "يونيفيرا" للتعلم الجامعي. أجب بالعربية بأسلوب واضح ومرتّب. ساعد الطلاب في فهم الدروس وشرح المفاهيم وحل التمارين.'
    const maxExtra =
      ' بما أن المستخدم مشترك في خطة "ماكس"، قدّم شروحاً أعمق وأمثلة عملية، وخطط دراسة مفصّلة، وخطوات حل مرتبة عند الحاجة.'
    const closing =
      ' إذا كان السؤال خارج نطاق التعليم أو يتعلّق بمشكلة فنية في الموقع، اعتذر بلطف ووجّه الطالب لفتح تذكرة دعم.'

    const system = {
      role: 'system',
      content: basePrompt + (isMax ? maxExtra : '') + closing,
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: Bearer ${apiKey} },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [system, ...messages],
        max_tokens: isMax ? 2000 : 1000,
        temperature: 0.6,
      }),
    })

    if (!res.ok) return NextResponse.json({ error: 'تعذّر الاتصال بالمساعد' }, { status: 502 })
    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content || 'عذراً، لم أتمكّن من الإجابة.'
    return NextResponse.json({ reply, tier: plan })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
