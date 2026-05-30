# دليل التشغيل — يونيفيرا (النسخة 4)

## 1) قاعدة البيانات (Supabase) — بداية نظيفة
نفّذ ملفات الـ migrations بالترتيب في SQL Editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_increment_students.sql`
3. `supabase/migrations/003_features.sql`

ثم عيّن نفسك أدمن:
```sql
update profiles set role = 'admin' where email = 'your@email.com';
```

## 2) إعدادات Supabase Auth
- Authentication → URL Configuration → Redirect URLs: أضف
  `https://نطاقك/auth/reset-password`
- لتفعيل استعادة كلمة المرور: فعّل SMTP (Authentication → Emails).

## 3) متغيّرات البيئة على Vercel
| المتغيّر | مطلوب | الوصف |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | نعم | رابط مشروع Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | نعم | مفتاح anon |
| `SUPABASE_SERVICE_ROLE_KEY` | نعم | مفتاح service role (للأدمن وتعيين كلمات المرور) |
| `NEXT_PUBLIC_SITE_URL` | نعم | رابط الموقع (للـ sitemap) |
| `DEEPSEEK_API_KEY` | للمساعد | مفتاح DeepSeek لتشغيل مساعد الذكاء |
| `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` | اختياري | تتبّع الأخطاء (اتركهما فارغين للتعطيل) |

## 4) من لوحة الإدارة بعد التشغيل
- الإعدادات: اسم الموقع، الأسعار، `telegram_url` (قناة الفيديوهات)، `ai_min_plan` (افتراضياً `pro`).
- طرق الدفع: أضف/عدّل طرق الدفع المتاحة.

## مساعد الذكاء (حسب الخطة)
- **مجاني:** غير متاح (يظهر تشجيع على الترقية).
- **برو:** متاح — ردود حتى 1000 رمز، سياق 10 رسائل.
- **ماكس:** موسّع — ردود حتى 2000 رمز، سياق 20 رسالة، شروح أعمق وخطط دراسية.
يمكن تغيير أدنى خطة عبر `ai_min_plan` في الإعدادات.

## ملاحظة أمان
يُنصح بترقية Next.js إلى أحدث إصدار مُصحّح: `npm i next@^14.2`
