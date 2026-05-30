-- ============================================
-- 003: إصلاح البروفايل + ميزات جديدة
-- (طرق دفع ديناميكية، تذاكر دعم، تتبّع تقدّم، سجل تدقيق)
-- ============================================

-- ─────────────────────────────────────────────
-- 1) إصلاح إنشاء البروفايل (المشكلة الأساسية)
-- ─────────────────────────────────────────────
-- السماح بإنشاء مستخدمين من Authenticator/الموقع دون أن يفشل بسبب قيود
ALTER TABLE profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN full_name SET DEFAULT 'مستخدم جديد';

-- تريغر مرن لا يُفشل إنشاء المستخدم مهما حدث
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'مستخدم جديد'
    ),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- لا نوقف إنشاء المستخدم إطلاقاً حتى لو تعذّر إنشاء البروفايل
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إعادة إنشاء التريغر للتأكد من وجوده
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill: إنشاء بروفايل لأي مستخدم موجود في auth.users بلا بروفايل
INSERT INTO profiles (id, full_name, email)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'full_name', NULLIF(split_part(COALESCE(u.email,''),'@',1),''), 'مستخدم جديد'),
       u.email
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- دالة مساعدة للتحقق من صلاحية الأدمن (SECURITY DEFINER لتفادي تكرار RLS)
CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','staff'));
$$;

-- سياسات تسمح للأدمن بتعديل/إضافة بروفايلات (كانت ناقصة → تعديلات الأدمن تفشل صامتة)
DROP POLICY IF EXISTS "Admins update any profile" ON profiles;
CREATE POLICY "Admins update any profile" ON profiles
  FOR UPDATE USING (is_admin_or_staff());

DROP POLICY IF EXISTS "Admins insert profiles" ON profiles;
CREATE POLICY "Admins insert profiles" ON profiles
  FOR INSERT WITH CHECK (is_admin_or_staff() OR auth.uid() = id);

-- ─────────────────────────────────────────────
-- 2) طرق الدفع الديناميكية (يديرها الأدمن)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  account_number TEXT,
  instructions TEXT,
  icon TEXT DEFAULT '💳',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active payment methods viewable" ON payment_methods;
CREATE POLICY "Active payment methods viewable" ON payment_methods
  FOR SELECT USING (is_active = true OR is_admin_or_staff());
DROP POLICY IF EXISTS "Admins manage payment methods" ON payment_methods;
CREATE POLICY "Admins manage payment methods" ON payment_methods
  FOR ALL USING (is_admin_or_staff());

INSERT INTO payment_methods (name, account_number, instructions, icon, sort_order) VALUES
('شام كاش', '09XXXXXXXX', 'حوّل المبلغ ثم احفظ رقم العملية', '📱', 1),
('سيريتل كاش', '09XXXXXXXX', 'حوّل المبلغ ثم احفظ رقم العملية', '📱', 2)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 3) نظام تذاكر الدعم
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open',          -- open | answered | closed
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT false,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own or admin tickets" ON support_tickets;
CREATE POLICY "Own or admin tickets" ON support_tickets
  FOR ALL USING (auth.uid() = user_id OR is_admin_or_staff());

DROP POLICY IF EXISTS "Own or admin ticket messages" ON ticket_messages;
CREATE POLICY "Own or admin ticket messages" ON ticket_messages
  FOR ALL USING (
    is_admin_or_staff()
    OR EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );

-- ─────────────────────────────────────────────
-- 4) تتبّع تقدّم الطالب (لكل درس)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  video_id UUID REFERENCES course_videos(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own lesson progress" ON lesson_progress;
CREATE POLICY "Own lesson progress" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id);

-- إعادة حساب نسبة التقدّم في enrollments بعد كل تغيير
CREATE OR REPLACE FUNCTION recalc_course_progress(p_user UUID, p_course UUID)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  total INT;
  done INT;
  pct INT;
BEGIN
  SELECT COUNT(*) INTO total FROM course_videos WHERE course_id = p_course;
  SELECT COUNT(*) INTO done FROM lesson_progress
    WHERE user_id = p_user AND course_id = p_course AND completed = true;
  IF total = 0 THEN pct := 0; ELSE pct := ROUND((done::DECIMAL / total) * 100); END IF;

  UPDATE enrollments
    SET progress_percent = pct,
        completed_at = CASE WHEN pct >= 100 THEN NOW() ELSE NULL END
    WHERE user_id = p_user AND course_id = p_course;

  -- إصدار شهادة تلقائياً عند الإكمال الكامل
  IF pct >= 100 THEN
    INSERT INTO certificates (user_id, course_id)
    SELECT p_user, p_course
    WHERE NOT EXISTS (
      SELECT 1 FROM certificates WHERE user_id = p_user AND course_id = p_course
    );
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION recalc_course_progress(UUID, UUID) TO authenticated, service_role;

-- ─────────────────────────────────────────────
-- 5) سجل التدقيق (Audit Log)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read audit logs" ON audit_logs;
CREATE POLICY "Admins read audit logs" ON audit_logs
  FOR SELECT USING (is_admin_or_staff());
-- الكتابة تتم عبر service_role فقط (من الخادم) فلا حاجة لسياسة insert عامة

-- ─────────────────────────────────────────────
-- 6) إعدادات جديدة (تلغرام + مساعد الذكاء)
-- ─────────────────────────────────────────────
INSERT INTO site_settings (key, value, description) VALUES
('telegram_url', '', 'رابط قناة/حساب تلغرام للتواصل والفيديوهات'),
('telegram_admin', '', 'حساب الأدمن على تلغرام للتواصل المباشر'),
('ai_assistant_enabled', 'true', 'تفعيل مساعد الذكاء الاصطناعي للطلاب'),
('ai_min_plan', 'pro', 'أدنى خطة لاستخدام المساعد: free | pro | max')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course ON lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
