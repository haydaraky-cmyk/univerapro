# 🎓 يونيفيرا (UniVera) — منصة التعلم الجامعي المتكاملة

> منصة تعليمية عربية RTL كاملة تشمل: كورسات جامعية، فرص عمل، وخدمات تدريب — مبنية بـ Next.js 14 + Supabase

---

## 📋 جدول المحتويات

1. [نظرة عامة على المشروع](#نظرة-عامة)
2. [هيكل المشروع](#هيكل-المشروع)
3. [المتطلبات المسبقة](#المتطلبات-المسبقة)
4. [الإعداد المحلي خطوة بخطوة](#الإعداد-المحلي)
5. [إعداد Supabase بالتفصيل](#إعداد-supabase)
6. [الرفع على Vercel](#الرفع-على-vercel)
7. [البيانات الافتراضية](#البيانات-الافتراضية)
8. [إنشاء حساب الأدمن الأول](#إنشاء-حساب-الأدمن)
9. [صلاحيات المستخدمين](#صلاحيات-المستخدمين)
10. [نظام الدفع اليدوي](#نظام-الدفع)
11. [تحديث المشروع](#تحديث-المشروع)
12. [إضافة محتوى جديد](#إضافة-محتوى)
13. [حل المشاكل الشائعة](#حل-المشاكل)
14. [معلومات تقنية](#معلومات-تقنية)

---

## نظرة عامة

### ما هو يونيفيرا؟
منصة تعليمية جامعية تجمع في مكان واحد:
- **📚 كورسات جامعية** — مقاطع فيديو محمية مصنّفة حسب الكلية
- **💼 فرص العمل** — وظائف من شركات حقيقية مع معلومات التقديم
- **🏋️ خدمات التدريب** — دورات ومراكز تدريب مهني
- **👤 لوحة تحكم المستخدم** — متابعة التقدم والاشتراكات والشهادات
- **⚙️ لوحة الإدارة** — تحكم كامل بالمحتوى والمستخدمين والدفع

### خطط الاشتراك
| الخطة | السعر | الصلاحيات |
|-------|-------|-----------|
| مجاني | 0 | تصفح + معاينة الكورسات المجانية |
| برو | 1,500 ل.س/شهر | كورسات برو + فرص العمل + التدريب + شهادات |
| ماكس | 2,500 ل.س/شهر | كل شيء + محتوى حصري + أولوية + دعم مباشر |

### طرق الدفع
- **شام كاش** — تحويل يدوي + إدخال رقم العملية
- **سيريتل كاش** — تحويل يدوي + إدخال رقم العملية
- الإدارة تراجع يدوياً وتفعّل الاشتراك خلال 24 ساعة

---

## هيكل المشروع

```
univera/
├── 📁 src/
│   ├── 📁 app/                         # Next.js App Router
│   │   ├── layout.tsx                  # Root layout (RTL + fonts)
│   │   ├── globals.css                 # Design system
│   │   ├── page.tsx                    # الصفحة الرئيسية
│   │   ├── 📁 auth/
│   │   │   ├── login/page.tsx          # تسجيل الدخول
│   │   │   └── register/page.tsx       # إنشاء حساب
│   │   ├── 📁 courses/
│   │   │   ├── page.tsx                # قائمة الكورسات
│   │   │   └── [id]/page.tsx           # تفاصيل الكورس
│   │   ├── jobs/page.tsx               # فرص العمل
│   │   ├── training/page.tsx           # خدمات التدريب
│   │   ├── pricing/page.tsx            # الأسعار وطريقة الدفع
│   │   ├── become-teacher/page.tsx     # طلب الانضمام كمعلم
│   │   ├── contact-company/page.tsx    # تواصل لنشر وظيفة
│   │   ├── 📁 dashboard/               # لوحة تحكم المستخدم
│   │   │   ├── page.tsx                # الرئيسية
│   │   │   ├── upgrade/page.tsx        # ترقية الاشتراك + دفع
│   │   │   ├── profile/page.tsx        # تعديل الملف الشخصي
│   │   │   ├── certificates/page.tsx   # شهاداتي
│   │   │   └── notifications/page.tsx  # إشعاراتي
│   │   ├── 📁 admin/                   # لوحة الإدارة (admin/staff فقط)
│   │   │   ├── page.tsx                # Dashboard + إحصائيات
│   │   │   ├── payments/page.tsx       # ✅ مراجعة طلبات الدفع
│   │   │   ├── users/page.tsx          # إدارة المستخدمين
│   │   │   ├── courses/page.tsx        # إدارة الكورسات
│   │   │   ├── jobs/page.tsx           # إدارة الوظائف
│   │   │   ├── training/page.tsx       # إدارة خدمات التدريب
│   │   │   ├── teachers/page.tsx       # طلبات المعلمين
│   │   │   ├── notifications/page.tsx  # إرسال إشعارات
│   │   │   └── settings/page.tsx       # إعدادات الموقع
│   │   └── 📁 api/
│   │       └── courses/enroll/route.ts # API التسجيل في الكورس
│   ├── 📁 components/
│   │   └── layout/
│   │       ├── Navbar.tsx              # شريط التنقل
│   │       └── Footer.tsx              # التذييل
│   ├── 📁 hooks/
│   │   └── useAuth.tsx                 # Auth context + hook
│   ├── 📁 lib/
│   │   ├── supabase.ts                 # Client-side Supabase
│   │   ├── supabase-server.ts          # Server-side Supabase
│   │   └── utils.ts                    # مساعدات: canAccess, formatDate...
│   └── 📁 types/
│       └── index.ts                    # TypeScript types
├── 📁 public/
│   └── manifest.json                   # PWA manifest
├── 📁 supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # قاعدة البيانات الكاملة
├── .env.local.example                  # نموذج متغيرات البيئة
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## المتطلبات المسبقة

قبل البدء تأكد من تثبيت:

```bash
# Node.js 18 أو أحدث
node --version   # يجب ≥ 18.0.0

# npm أو yarn
npm --version

# git
git --version
```

حسابات مطلوبة (مجانية):
- [Supabase](https://supabase.com) — قاعدة البيانات والمصادقة
- [Vercel](https://vercel.com) — استضافة Next.js
- [GitHub](https://github.com) — مستودع الكود

---

## الإعداد المحلي

### 1. استنساخ المشروع

```bash
git clone https://github.com/YOUR_USERNAME/univera.git
cd univera
```

### 2. تثبيت الحزم

```bash
npm install
```

### 3. إعداد متغيرات البيئة

```bash
cp .env.local.example .env.local
```

ثم افتح `.env.local` وأضف القيم (انظر قسم إعداد Supabase أدناه).

### 4. تشغيل المشروع محلياً

```bash
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## إعداد Supabase

### الخطوة 1: إنشاء مشروع جديد

1. سجّل دخولك على [supabase.com](https://supabase.com)
2. اضغط **New Project**
3. أدخل اسم المشروع: `univera`
4. اختر منطقة قريبة (مثلاً: Frankfurt أو Singapore)
5. أنشئ كلمة مرور قوية لقاعدة البيانات واحتفظ بها
6. انتظر دقيقتين حتى يتم إنشاء المشروع

### الخطوة 2: تشغيل SQL Schema

1. في لوحة Supabase، اضغط على **SQL Editor** في الشريط الجانبي
2. اضغط **New Query**
3. افتح ملف `supabase/migrations/001_initial_schema.sql` من المشروع
4. انسخ المحتوى كاملاً
5. الصقه في SQL Editor
6. اضغط **Run** (أو Ctrl+Enter)
7. يجب أن ترى رسالة: `Success. No rows returned`

**ملاحظة مهمة:** هذا الملف ينشئ:
- 12 جدولاً كاملاً
- جميع سياسات RLS (الأمان)
- Triggers تلقائية (إنشاء profile، تحديث التواريخ)
- 8 كليات جامعية كبيانات أولية
- إعدادات الموقع الافتراضية

### الخطوة 3: نسخ المفاتيح

1. في Supabase: **Settings → API**
2. انسخ:
   - `Project URL` → ضعه في `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → ضعه في `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → ضعه في `SUPABASE_SERVICE_ROLE_KEY`

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### الخطوة 4: إعدادات المصادقة

1. في Supabase: **Authentication → Settings**
2. قسم **Email**: ضع `Confirm email` على **OFF** خلال التطوير (يمكن تشغيله لاحقاً)
3. قسم **Site URL**: أضف `http://localhost:3000`
4. قسم **Redirect URLs**: أضف:
   - `http://localhost:3000/**`
   - `https://your-domain.vercel.app/**`

### الخطوة 5: إعداد Storage (للصور - اختياري الآن)

1. في Supabase: **Storage → New Bucket**
2. اسم البucket: `thumbnails`
3. اجعله Public
4. كرّر للـ bucket: `avatars`

---

## إنشاء حساب الأدمن

بعد تشغيل المشروع، عليك جعل أول حساب أدمناً يدوياً:

### الطريقة السريعة (SQL)

1. أنشئ حساباً عادياً من صفحة `/auth/register`
2. في Supabase SQL Editor، شغّل:

```sql
-- غيّر البريد الإلكتروني لبريدك
UPDATE profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

3. حدّث الصفحة — ستظهر لك رابط "الإدارة" في القائمة

### إنشاء حساب Supabase مباشرة كأدمن

```sql
-- إنشاء مستخدم مباشرة في قاعدة البيانات
-- استخدم هذا فقط إذا أردت حساباً بدون التحقق من البريد
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@univera.sy',
  crypt('YOUR_SECURE_PASSWORD', gen_salt('bf')),
  NOW(), NOW(), NOW()
);

-- ثم اجعله أدمن (سيتم إنشاء الـ profile تلقائياً بواسطة التريغر)
-- انتظر ثانية ثم شغّل:
UPDATE profiles SET role = 'admin', full_name = 'مدير النظام' WHERE email = 'admin@univera.sy';
```

---

## البيانات الافتراضية

عند تشغيل الـ SQL Schema، تُنشأ البيانات التالية تلقائياً:

### الكليات الجامعية (8 كليات)
| الاسم | الأيقونة | اللون |
|-------|---------|-------|
| كلية الهندسة | ⚙️ | أزرق |
| كلية الطب | 🏥 | أحمر |
| كلية الحقوق | ⚖️ | أخضر |
| كلية الاقتصاد | 📊 | ذهبي |
| كلية العلوم | 🔬 | بنفسجي |
| كلية الآداب | 🎭 | وردي |
| كلية المعلوماتية | 💻 | أخضر فاتح |
| كلية التربية | 📚 | أزرق |

### إعدادات الموقع الافتراضية
| المفتاح | القيمة |
|---------|--------|
| site_name | يونيفيرا |
| pro_price_monthly | 1500 |
| max_price_monthly | 2500 |
| sham_cash_number | 09XXXXXXXX |
| syriatel_cash_number | 09XXXXXXXX |

**⚠️ مهم:** اذهب فوراً لـ `/admin/settings` وحدّث أرقام الدفع الحقيقية!

### إضافة بيانات تجريبية

```sql
-- إضافة كورس تجريبي
INSERT INTO courses (title, description, required_plan, status, is_featured, level)
VALUES (
  'مقدمة في البرمجة بلغة Python',
  'كورس شامل للمبتدئين في البرمجة',
  'free',
  'published',
  true,
  'beginner'
);

-- إضافة وظيفة تجريبية
INSERT INTO jobs (title, company, description, location, job_type, required_plan, status)
VALUES (
  'مطوّر Full Stack',
  'شركة التقنية المتطورة',
  'نبحث عن مطوّر خبرة 2+ سنوات',
  'دمشق',
  'full_time',
  'pro',
  'published'
);
```

---

## الرفع على Vercel

### الطريقة 1: عبر GitHub (الموصى بها)

**1. رفع الكود على GitHub**
```bash
git init
git add .
git commit -m "Initial commit: UniVera platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/univera.git
git push -u origin main
```

**2. ربط Vercel بـ GitHub**
1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط **New Project**
3. اختر المستودع `univera`
4. Framework: **Next.js** (يُكتشف تلقائياً)

**3. إضافة متغيرات البيئة في Vercel**
في صفحة الـ deployment → **Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL       = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...
SUPABASE_SERVICE_ROLE_KEY      = eyJ...
NEXT_PUBLIC_APP_URL            = https://your-app.vercel.app
```

**4. اضغط Deploy** — سيتم الرفع خلال 2-3 دقائق!

### الطريقة 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
# اتبع التعليمات وأضف متغيرات البيئة
```

### بعد الرفع

1. في Supabase **Authentication → Settings** أضف رابط Vercel:
   - `https://your-app.vercel.app/**`

2. حدّث `NEXT_PUBLIC_APP_URL` في Vercel لرابط موقعك الحقيقي

---

## تحديث المشروع

### تحديث الكود

```bash
# تعديل الملفات...
git add .
git commit -m "وصف التحديث"
git push origin main
# Vercel يُحدّث تلقائياً!
```

### تحديث قاعدة البيانات

لإضافة جدول أو عمود جديد:

```sql
-- مثال: إضافة عمود جديد
ALTER TABLE courses ADD COLUMN video_count INT DEFAULT 0;

-- مثال: إضافة جدول جديد
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**⚠️ قاعدة ذهبية:** لا تحذف جداول أو أعمدة بدون نسخة احتياطية!

### النسخ الاحتياطي

في Supabase: **Settings → Database → Database Backups**
- Supabase يحتفظ تلقائياً بنسخ يومية (في الخطة المدفوعة)
- للخطة المجانية: خذ نسخة يدوية دورياً:

```bash
# من Supabase CLI
supabase db dump > backup_$(date +%Y%m%d).sql
```

---

## إضافة محتوى

### إضافة كورس جديد (من لوحة الإدارة)

1. اذهب إلى `/admin/courses`
2. اضغط **كورس جديد**
3. أدخل: العنوان، الوصف، الكلية، الخطة المطلوبة
4. اضغط **حفظ** — يُنشر فوراً

### إضافة دروس فيديو لكورس (SQL مؤقتاً)

```sql
-- أضف درساً للكورس
INSERT INTO course_videos (course_id, title, video_url, duration_seconds, sort_order, is_preview)
VALUES (
  'COURSE_UUID_HERE',
  'الدرس الأول: المقدمة',
  'https://example.com/video1.mp4',  -- أو Cloudflare Stream ID
  1800,  -- 30 دقيقة
  1,
  true  -- معاينة مجانية
);
```

### ربط Cloudflare Stream للفيديو المحمي

```sql
UPDATE course_videos
SET cloudflare_video_id = 'your-cloudflare-video-id'
WHERE id = 'VIDEO_UUID';
```

في ملف `utils.ts`:
```typescript
export function getVideoEmbedUrl(cloudflareId: string): string {
  return `https://iframe.videodelivery.net/${cloudflareId}?preload=true`
}
```

---

## صلاحيات المستخدمين

### الأدوار (Roles)

| الدور | الصلاحيات |
|-------|-----------|
| `student` | تصفح المحتوى حسب خطته، لوحة تحكم شخصية |
| `teacher` | كل ما سبق + إضافة كورسات (قيد التطوير) |
| `staff` | إدارة المحتوى، مراجعة الطلبات (بدون إعدادات) |
| `admin` | صلاحيات كاملة: مستخدمون، إعدادات، كل شيء |

### تغيير دور مستخدم (SQL)

```sql
UPDATE profiles SET role = 'staff' WHERE email = 'employee@company.com';
UPDATE profiles SET role = 'admin' WHERE email = 'admin@company.com';
UPDATE profiles SET role = 'teacher' WHERE email = 'teacher@company.com';
```

### تغيير خطة مستخدم يدوياً (SQL)

```sql
-- ترقية مستخدم لـ Pro لمدة شهر
UPDATE profiles
SET plan = 'pro',
    plan_expires_at = NOW() + INTERVAL '1 month'
WHERE email = 'user@email.com';

-- إعادة تعيين لمجاني
UPDATE profiles
SET plan = 'free', plan_expires_at = NULL
WHERE email = 'user@email.com';
```

---

## نظام الدفع

### آلية العمل الكاملة

```
المستخدم يريد ترقية خطته
         ↓
يذهب إلى /dashboard/upgrade
         ↓
يختار الخطة (برو/ماكس) والمدة
         ↓
يحوّل المبلغ عبر شام كاش / سيريتل كاش
         ↓
يدخل رقم العملية في النموذج
         ↓
يُحفظ في جدول payment_requests بحالة "pending"
         ↓
الأدمن يرى الطلب في /admin/payments
         ↓
الأدمن يتحقق يدوياً من العملية
         ↓
      قبول ← ← ← ← ← ← رفض
         ↓                  ↓
ترقية الخطة تلقائياً   إشعار للمستخدم
         ↓
إشعار للمستخدم "تم التفعيل ✅"
```

### إدارة طلبات الدفع

- الصفحة: `/admin/payments`
- الفلاتر: قيد المراجعة / مقبولة / مرفوضة / الكل
- عند القبول يتم تلقائياً:
  1. تحديث `profiles.plan` و `plan_expires_at`
  2. إرسال إشعار للمستخدم
  3. تسجيل reviewer و reviewed_at

---

## حل المشاكل

### خطأ: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### خطأ: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- تأكد من وجود ملف `.env.local`
- تأكد من عدم وجود مسافات حول `=`
- أعد تشغيل `npm run dev`

### الصفحة تُعاد توجيه دائماً لـ /auth/login
- تحقق من إعدادات الـ Redirect URLs في Supabase
- تأكد من تطابق `NEXT_PUBLIC_APP_URL` مع رابط موقعك

### RLS Error: "new row violates row-level security policy"
```sql
-- تحقق من سياسات RLS للجدول
SELECT * FROM pg_policies WHERE tablename = 'YOUR_TABLE';

-- إذا كنت تريد تعطيل RLS مؤقتاً لاختبارات التطوير:
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
-- ⚠️ لا تفعل هذا في الإنتاج!
```

### Vercel Build Error
```bash
# تحقق محلياً أولاً
npm run build
# إذا نجح محلياً، المشكلة في متغيرات Vercel
```

### المستخدم لا يرى صلاحيات الأدمن بعد التحديث
```javascript
// في أي صفحة، نفّذ refreshProfile() من useAuth
const { refreshProfile } = useAuth()
await refreshProfile()
```

---

## معلومات تقنية

### Stack المستخدم

| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| Next.js | 14.2 | Framework + SSR |
| React | 18 | UI |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| Supabase | 2.x | Database + Auth + RLS |
| Lucide React | 0.38 | Icons |

### أمان النظام

- **RLS على كل الجداول** — المستخدم لا يصل إلا لبياناته
- **خطوط الصلاحية** — `canAccess(userPlan, requiredPlan)` تحمي المحتوى
- **Service Role Key** — تُستخدم فقط Server-side، لا تُشاركها أبداً
- **انتهاء الاشتراك** — `plan_expires_at` يُعالج في كل طلب

### اعتبارات الأداء

- Server Components لصفحات عرض المحتوى (أسرع)
- Client Components فقط للصفحات التفاعلية
- Tailwind CSS purging للـ bundle الأصغر

### توسيع المشروع مستقبلاً

- **دفع إلكتروني** — إضافة Stripe أو PayTabs
- **فيديو محمي** — Cloudflare Stream مع Signed URLs
- **تطبيق موبايل** — PWA متاح الآن، أو React Native
- **تقييمات وتعليقات** — إضافة جدول reviews
- **محادثة مباشرة** — Supabase Realtime
- **إحصائيات متقدمة** — Supabase Analytics

---

## ملاحظات النشر

### قبل الإنتاج (Checklist)

- [ ] تحديث أرقام الدفع في `/admin/settings`
- [ ] تفعيل تأكيد البريد الإلكتروني في Supabase
- [ ] إضافة رابط Vercel في Supabase Redirect URLs
- [ ] اختبار دورة الدفع الكاملة
- [ ] إنشاء حساب الأدمن
- [ ] إضافة أيقونات PWA (`/public/icon-192.png` و `icon-512.png`)
- [ ] مراجعة إعدادات RLS في Supabase

---

## 📞 الدعم

لأي مشاكل أو استفسارات، تحقق من:
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [GitHub Issues](https://github.com/YOUR_USERNAME/univera/issues)

---

**بُني بـ ❤️ لدعم التعليم الجامعي العربي**
