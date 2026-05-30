-- ============================================
-- UNIVERA - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_plan AS ENUM ('free', 'pro', 'max');
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'staff');
CREATE TYPE content_status AS ENUM ('pending', 'published', 'rejected', 'draft');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_method AS ENUM ('sham_cash', 'syriatel_cash', 'other');

-- ============================================
-- USERS PROFILE (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  plan user_plan DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATEGORIES (University Faculties)
-- ============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3b5bdb',
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COURSES
-- ============================================
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id),
  price DECIMAL(10,2) DEFAULT 0,
  required_plan user_plan DEFAULT 'pro',
  status content_status DEFAULT 'pending',
  level TEXT DEFAULT 'beginner',
  duration_hours INT DEFAULT 0,
  students_count INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COURSE VIDEOS (Lessons)
-- ============================================
CREATE TABLE course_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  cloudflare_video_id TEXT,
  duration_seconds INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COURSE ENROLLMENTS
-- ============================================
CREATE TABLE enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress_percent INT DEFAULT 0,
  last_video_id UUID REFERENCES course_videos(id),
  completed_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================
-- CERTIFICATES
-- ============================================
CREATE TABLE certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  certificate_number TEXT UNIQUE DEFAULT 'CERT-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8)),
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOBS
-- ============================================
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  location TEXT,
  job_type TEXT DEFAULT 'full_time',
  salary_range TEXT,
  contact_info TEXT,
  apply_url TEXT,
  apply_email TEXT,
  status content_status DEFAULT 'pending',
  required_plan user_plan DEFAULT 'pro',
  expires_at TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINING SERVICES
-- ============================================
CREATE TABLE training_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  provider_name TEXT NOT NULL,
  provider_contact TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10,2),
  duration TEXT,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  required_plan user_plan DEFAULT 'pro',
  status content_status DEFAULT 'pending',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEACHER REQUESTS (Teachers wanting to publish)
-- ============================================
CREATE TABLE teacher_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  specialty TEXT NOT NULL,
  experience_years INT,
  portfolio_url TEXT,
  message TEXT,
  status content_status DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT REQUESTS
-- ============================================
CREATE TABLE payment_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  method payment_method NOT NULL,
  transaction_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  requested_plan user_plan NOT NULL,
  duration_months INT DEFAULT 1,
  status payment_status DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTACT / COMPANY REQUESTS (for jobs)
-- ============================================
CREATE TABLE company_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SITE SETTINGS
-- ============================================
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Courses policies
CREATE POLICY "Published courses viewable" ON courses FOR SELECT USING (status = 'published');

-- Videos: only enrolled users or matching plan
CREATE POLICY "Videos for enrolled users" ON course_videos FOR SELECT USING (
  is_preview = true OR
  EXISTS (SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = course_videos.course_id) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff'))
);

-- Enrollments: own only
CREATE POLICY "Own enrollments" ON enrollments FOR ALL USING (auth.uid() = user_id);

-- Jobs: published or admin
CREATE POLICY "Published jobs viewable" ON jobs FOR SELECT USING (status = 'published');

-- Training: published or admin
CREATE POLICY "Published training viewable" ON training_services FOR SELECT USING (status = 'published');

-- Payment requests: own
CREATE POLICY "Own payment requests" ON payment_requests FOR ALL USING (auth.uid() = user_id);

-- Notifications: own
CREATE POLICY "Own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- DEFAULT DATA
-- ============================================
INSERT INTO categories (name, name_en, icon, color) VALUES
('كلية الهندسة', 'Engineering', '⚙️', '#3b5bdb'),
('كلية الطب', 'Medicine', '🏥', '#e03131'),
('كلية الحقوق', 'Law', '⚖️', '#2f9e44'),
('كلية الاقتصاد', 'Economics', '📊', '#f59f00'),
('كلية العلوم', 'Science', '🔬', '#7048e8'),
('كلية الآداب', 'Arts', '🎭', '#e64980'),
('كلية المعلوماتية', 'IT', '💻', '#0ca678'),
('كلية التربية', 'Education', '📚', '#1971c2');

INSERT INTO site_settings (key, value, description) VALUES
('site_name', 'يونيفيرا', 'اسم الموقع'),
('site_name_en', 'UniVera', 'Site name in English'),
('pro_price_monthly', '1500', 'سعر اشتراك برو الشهري (ليرة سورية)'),
('max_price_monthly', '2500', 'سعر اشتراك ماكس الشهري (ليرة سورية)'),
('sham_cash_number', '09XXXXXXXX', 'رقم شام كاش'),
('syriatel_cash_number', '09XXXXXXXX', 'رقم سيريتل كاش'),
('admin_email', 'admin@univera.sy', 'البريد الإلكتروني للإدارة'),
('welcome_message', 'مرحباً بك في يونيفيرا - منصة التعلم الجامعي', 'رسالة الترحيب');
