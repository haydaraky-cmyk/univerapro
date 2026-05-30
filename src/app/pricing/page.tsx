import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerSupabase } from '@/lib/supabase-server'

async function getSettings() {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('site_settings').select('*')
    return Object.fromEntries(data?.map((s: any) => [s.key, s.value]) || [])
  } catch { return {} }
}

async function getPaymentMethods() {
  try {
    const supabase = createServerSupabase()
    const { data } = await supabase.from('payment_methods').select('*').eq('is_active', true).order('sort_order')
    return data || []
  } catch { return [] }
}

export const revalidate = 60

export default async function PricingPage() {
  const [settings, paymentMethods] = await Promise.all([getSettings(), getPaymentMethods()])

  const plans = [
    {
      name: 'مجاني', nameEn: 'free', price: '0', period: '',
      color: 'border-gray-600', btnClass: 'block text-center border border-gray-600 rounded-xl py-3 hover:bg-white/5 transition-colors text-sm',
      features: [
        { text: 'تصفح جميع الكورسات', ok: true },
        { text: 'معاينة الدروس المجانية', ok: true },
        { text: 'التسجيل في المنصة', ok: true },
        { text: 'فرص العمل الكاملة', ok: false },
        { text: 'خدمات التدريب', ok: false },
        { text: 'مساعد الدراسة الذكي (AI)', ok: false },
      ],
      cta: 'ابدأ مجاناً', link: '/auth/register'
    },
    {
      name: 'برو', nameEn: 'pro', price: settings.pro_price_monthly || '1500', period: 'شهرياً',
      color: 'border-primary-500', btnClass: 'btn-primary block text-center', badge: 'الأكثر طلباً',
      features: [
        { text: 'كل ما في المجاني', ok: true },
        { text: 'جميع كورسات برو', ok: true },
        { text: 'فرص العمل + التقديم', ok: true },
        { text: 'خدمات التدريب', ok: true },
        { text: 'شهادات إتمام PDF', ok: true },
        { text: 'مساعد الدراسة الذكي (AI)', ok: true },
        { text: 'المحتوى الحصري ماكس', ok: false },
      ],
      cta: 'اشترك في برو', link: '/dashboard/upgrade?plan=pro'
    },
    {
      name: 'ماكس', nameEn: 'max', price: settings.max_price_monthly || '2500', period: 'شهرياً',
      color: 'border-gold-500', btnClass: 'btn-gold block text-center',
      features: [
        { text: 'كل ما في برو', ok: true },
        { text: 'المحتوى الحصري ماكس', ok: true },
        { text: 'مساعد ذكي بقدرات موسّعة', ok: true },
        { text: 'أولوية في التقديم للوظائف', ok: true },
        { text: 'دعم مباشر', ok: true },
        { text: 'وصول مبكر للكورسات الجديدة', ok: true },
        { text: 'جلسة استشارية شهرية', ok: true },
      ],
      cta: 'اشترك في ماكس', link: '/dashboard/upgrade?plan=max'
    },
  ]

  return (
    <main className="min-h-screen mesh-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-black mb-3">خطط <span className="gradient-text">الاشتراك</span></h1>
            <p className="text-gray-400 max-w-xl mx-auto">ابدأ مجاناً، وارقَّ حسب احتياجاتك. الدفع عبر شام كاش أو سيريتل كاش.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <div key={plan.nameEn} className={`glass-card rounded-2xl p-7 border-2 ${plan.color} relative`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs px-4 py-1.5 rounded-full font-medium">
                    {plan.badge}
                  </div>
                )}
                <div className="font-bold text-xl mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{parseInt(plan.price).toLocaleString('ar')}</span>
                  <span className="text-sm text-gray-400">ل.س {plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-center gap-2.5 text-sm ${f.ok ? 'text-gray-200' : 'text-gray-600'}`}>
                      <span className={f.ok ? 'text-green-400 text-base' : 'text-gray-700'}>{f.ok ? '✓' : '✗'}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <Link href={plan.link} className={plan.btnClass}>{plan.cta}</Link>
              </div>
            ))}
          </div>

          {/* Payment instructions */}
          <div className="glass-card rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-center">كيفية الاشتراك</h2>

            {paymentMethods.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((pm: any) => (
                  <div key={pm.id} className="bg-dark-700 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{pm.icon}</span>
                      <span className="font-semibold text-sm">{pm.name}</span>
                    </div>
                    {pm.account_number && <div className="text-primary-300 text-sm font-mono mb-1">{pm.account_number}</div>}
                    {pm.instructions && <div className="text-gray-400 text-xs leading-relaxed">{pm.instructions}</div>}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {[
                { step: '1', text: 'حوّل قيمة الاشتراك عبر إحدى طرق الدفع أعلاه' },
                { step: '2', text: 'احفظ رقم العملية الذي يصلك بعد التحويل' },
                { step: '3', text: 'أدخل رقم العملية في صفحة الترقية من حسابك' },
                { step: '4', text: 'سيتم مراجعة طلبك وتفعيل اشتراكك خلال 24 ساعة' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold flex-shrink-0">{step}</div>
                  <p className="text-sm text-gray-300 pt-1 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
