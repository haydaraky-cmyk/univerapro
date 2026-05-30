'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { BookOpen, Plus, ArrowRight, Edit, Trash, Eye, EyeOff, Star } from 'lucide-react'
import Link from 'next/link'

export default function AdminCoursesPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', required_plan: 'free',
    level: 'beginner', thumbnail_url: '', is_featured: false, teacher_id: ''
  })

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  const fetchData = async () => {
    const supabase = createClient()
    const [c, cats] = await Promise.all([
      supabase.from('courses').select('*, category:categories(name, icon), teacher:profiles(full_name)').order('created_at', { ascending: false }).limit(50),
      supabase.from('categories').select('*').eq('is_active', true)
    ])
    setCourses(c.data || [])
    setCategories(cats.data || [])
    setFetching(false)
  }

  useEffect(() => { if (profile) fetchData() }, [profile])

  const handleSave = async () => {
    if (!form.title) return alert('العنوان مطلوب')
    const supabase = createClient()
    const data = { ...form, status: 'published' }
    if (editing) {
      await supabase.from('courses').update(data).eq('id', editing.id)
    } else {
      await supabase.from('courses').insert(data)
    }
    setShowForm(false)
    setEditing(null)
    setForm({ title: '', description: '', category_id: '', required_plan: 'free', level: 'beginner', thumbnail_url: '', is_featured: false, teacher_id: '' })
    fetchData()
  }

  const togglePublish = async (course: any) => {
    const supabase = createClient()
    await supabase.from('courses').update({ status: course.status === 'published' ? 'draft' : 'published' }).eq('id', course.id)
    fetchData()
  }

  const toggleFeatured = async (course: any) => {
    const supabase = createClient()
    await supabase.from('courses').update({ is_featured: !course.is_featured }).eq('id', course.id)
    fetchData()
  }

  const deleteCourse = async (id: string) => {
    if (!confirm('حذف الكورس نهائياً؟')) return
    const supabase = createClient()
    await supabase.from('courses').delete().eq('id', id)
    fetchData()
  }

  const startEdit = (course: any) => {
    setEditing(course)
    setForm({ title: course.title, description: course.description || '', category_id: course.category_id || '', required_plan: course.required_plan, level: course.level, thumbnail_url: course.thumbnail_url || '', is_featured: course.is_featured, teacher_id: course.teacher_id || '' })
    setShowForm(true)
  }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
          <span className="text-gray-600">/</span>
          <span className="font-bold">الكورسات</span>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary text-sm py-2 flex items-center gap-1.5">
          <Plus size={16} /> كورس جديد
        </button>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-lg mb-5">{editing ? 'تعديل الكورس' : 'إضافة كورس جديد'}</h2>
              <div className="space-y-4">
                {[
                  { label: 'عنوان الكورس *', key: 'title', type: 'text', placeholder: '' },
                  { label: 'صورة مصغرة (URL)', key: 'thumbnail_url', type: 'url', placeholder: 'https://...' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-sm text-gray-300 mb-1.5 block">{label}</label>
                    <input type={type} value={form[key as keyof typeof form] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500" />
                  </div>
                ))}
                <div>
                  <label className="text-sm text-gray-300 mb-1.5 block">الوصف</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-300 mb-1.5 block">الكلية</label>
                    <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                      <option value="">اختر...</option>
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1.5 block">الخطة المطلوبة</label>
                    <select value={form.required_plan} onChange={e => setForm(f => ({ ...f, required_plan: e.target.value }))}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                      <option value="free">مجاني</option>
                      <option value="pro">برو</option>
                      <option value="max">ماكس</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 rounded" />
                  <span>عرض في الصفحة الرئيسية (مميز)</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} className="btn-primary flex-1">حفظ</button>
                <button onClick={() => setShowForm(false)} className="glass-card rounded-xl px-4 py-2 flex-1 hover:bg-white/10 transition-colors text-sm">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {fetching ? (
          <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="space-y-3">
            {courses.map((course: any) => (
              <div key={course.id} className="glass-card rounded-2xl p-5 flex items-center gap-4 border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-2xl flex-shrink-0">
                  {course.category?.icon || '📚'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{course.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{course.category?.name} · {course.teacher?.full_name || 'بلا معلم'}</div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`badge-${course.required_plan}`}>{course.required_plan === 'free' ? 'مجاني' : course.required_plan}</span>
                    {course.is_featured && <span className="text-xs text-gold-400">⭐ مميز</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${course.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {course.status === 'published' ? 'منشور' : 'مسودة'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(course)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white" title="تعديل"><Edit size={15} /></button>
                  <button onClick={() => togglePublish(course)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white" title="نشر/إخفاء">
                    {course.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => toggleFeatured(course)} className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${course.is_featured ? 'text-gold-400' : 'text-gray-500'}`} title="مميز"><Star size={15} /></button>
                  <button onClick={() => deleteCourse(course.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-500 hover:text-red-400" title="حذف"><Trash size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
