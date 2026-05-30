'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Briefcase, Plus, ArrowRight, Edit, Trash, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function AdminJobsPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    title: '', company: '', description: '', requirements: '',
    location: '', job_type: 'full_time', salary_range: '',
    apply_email: '', apply_url: '', contact_info: '', required_plan: 'pro'
  })

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  const fetchJobs = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(50)
    setJobs(data || [])
    setFetching(false)
  }

  useEffect(() => { if (profile) fetchJobs() }, [profile])

  const handleSave = async () => {
    if (!form.title || !form.company) return alert('العنوان والشركة مطلوبان')
    const supabase = createClient()
    if (editing) {
      await supabase.from('jobs').update({ ...form, status: 'published' }).eq('id', editing.id)
    } else {
      await supabase.from('jobs').insert({ ...form, status: 'published', created_by: profile!.id })
    }
    setShowForm(false); setEditing(null)
    setForm({ title: '', company: '', description: '', requirements: '', location: '', job_type: 'full_time', salary_range: '', apply_email: '', apply_url: '', contact_info: '', required_plan: 'pro' })
    fetchJobs()
  }

  const togglePublish = async (job: any) => {
    const supabase = createClient()
    await supabase.from('jobs').update({ status: job.status === 'published' ? 'draft' : 'published' }).eq('id', job.id)
    fetchJobs()
  }

  const deleteJob = async (id: string) => {
    if (!confirm('حذف الوظيفة؟')) return
    const supabase = createClient()
    await supabase.from('jobs').delete().eq('id', id)
    fetchJobs()
  }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
          <span className="text-gray-600">/</span>
          <span className="font-bold">فرص العمل</span>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary text-sm py-2 flex items-center gap-1.5">
          <Plus size={16} /> وظيفة جديدة
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {showForm && (
          <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-lg mb-5">{editing ? 'تعديل الوظيفة' : 'إضافة وظيفة'}</h2>
              <div className="space-y-4">
                {[
                  { label: 'المسمى الوظيفي *', key: 'title' }, { label: 'الشركة *', key: 'company' },
                  { label: 'الموقع', key: 'location' }, { label: 'الراتب', key: 'salary_range' },
                  { label: 'رابط التقديم', key: 'apply_url' }, { label: 'البريد للتقديم', key: 'apply_email' },
                  { label: 'معلومات التواصل', key: 'contact_info' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-sm text-gray-300 mb-1.5 block">{label}</label>
                    <input value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white" />
                  </div>
                ))}
                <div>
                  <label className="text-sm text-gray-300 mb-1.5 block">الوصف</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-300 mb-1.5 block">نوع الدوام</label>
                    <select value={form.job_type} onChange={e => setForm(f => ({ ...f, job_type: e.target.value }))}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                      <option value="full_time">دوام كامل</option>
                      <option value="part_time">دوام جزئي</option>
                      <option value="remote">عن بُعد</option>
                      <option value="freelance">فريلانس</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1.5 block">مطلوب خطة</label>
                    <select value={form.required_plan} onChange={e => setForm(f => ({ ...f, required_plan: e.target.value }))}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                      <option value="free">مجاني</option>
                      <option value="pro">برو</option>
                      <option value="max">ماكس</option>
                    </select>
                  </div>
                </div>
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
            {jobs.map((job: any) => (
              <div key={job.id} className="glass-card rounded-2xl p-5 flex items-center gap-4 border border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{job.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{job.company} {job.location && `· ${job.location}`}</div>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`badge-${job.required_plan}`}>{job.required_plan}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${job.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {job.status === 'published' ? 'منشور' : 'مسودة'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditing(job); setForm({ title: job.title, company: job.company, description: job.description || '', requirements: job.requirements || '', location: job.location || '', job_type: job.job_type, salary_range: job.salary_range || '', apply_email: job.apply_email || '', apply_url: job.apply_url || '', contact_info: job.contact_info || '', required_plan: job.required_plan }); setShowForm(true) }}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Edit size={15} /></button>
                  <button onClick={() => togglePublish(job)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                    {job.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => deleteJob(job.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400"><Trash size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
