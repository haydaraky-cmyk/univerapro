export type UserPlan = 'free' | 'pro' | 'max'
export type UserRole = 'student' | 'teacher' | 'admin' | 'staff'
export type ContentStatus = 'pending' | 'published' | 'rejected' | 'draft'
export type PaymentStatus = 'pending' | 'approved' | 'rejected'
export type PaymentMethod = 'sham_cash' | 'syriatel_cash' | 'other'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  role: UserRole
  plan: UserPlan
  plan_expires_at?: string
  is_active: boolean
  bio?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  name_en?: string
  description?: string
  icon?: string
  color?: string
  parent_id?: string
  sort_order: number
  is_active: boolean
}

export interface Course {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  teacher_id?: string
  category_id?: string
  price: number
  required_plan: UserPlan
  status: ContentStatus
  level: string
  duration_hours: number
  students_count: number
  rating: number
  is_featured: boolean
  tags?: string[]
  created_at: string
  teacher?: Profile
  category?: Category
  videos?: CourseVideo[]
}

export interface CourseVideo {
  id: string
  course_id: string
  title: string
  description?: string
  video_url?: string
  cloudflare_video_id?: string
  duration_seconds: number
  sort_order: number
  is_preview: boolean
}

export interface Job {
  id: string
  title: string
  company: string
  description?: string
  requirements?: string
  location?: string
  job_type: string
  salary_range?: string
  contact_info?: string
  apply_url?: string
  apply_email?: string
  status: ContentStatus
  required_plan: UserPlan
  expires_at?: string
  views_count: number
  created_at: string
}

export interface TrainingService {
  id: string
  title: string
  description?: string
  provider_name: string
  provider_contact?: string
  thumbnail_url?: string
  price?: number
  duration?: string
  location?: string
  is_online: boolean
  required_plan: UserPlan
  status: ContentStatus
  created_at: string
}

export interface PaymentRequest {
  id: string
  user_id: string
  method: PaymentMethod
  transaction_number: string
  amount: number
  requested_plan: UserPlan
  duration_months: number
  status: PaymentStatus
  admin_note?: string
  screenshot_url?: string
  created_at: string
  user?: Profile
}

export interface TeacherRequest {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  specialty: string
  experience_years?: number
  message?: string
  status: ContentStatus
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  link?: string
  created_at: string
}

export interface SiteSettings {
  [key: string]: string
}
