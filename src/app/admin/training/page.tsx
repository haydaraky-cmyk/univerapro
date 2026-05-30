'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Dumbbell, Plus, ArrowRight, Edit, Trash, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function AdminTrainingPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    title: '', description: '', provider_name: '', provider_contact: '',
    thumbnail_url: '', price: '', duration: '', location: '',
    is_online: false, required_plan: 'pro'
  })

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  const fetchServices = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('training_services').select('*').order('created_at', { ascending: false })
    setServices(data || [])
    setFetching(false)
  }

  useEffect(() => { if (profile) fetchServices() }, [profile])

  const handleSave = async () => {
    if (!form.title || !form.provider_name) return alert('العنوان والمزود مطلوبان')
    const supabase = createClient()
    const data = { ...form, price: form.price ? parseFloat(form.price) : null, status: 'published', created_by: profile!.id }
    if (editing) {
      await supabase.from('training_services').update(data).eq('id', editing.id)
    } else {
      await supabase.from('training_services').insert(data)
    }
    setShowForm(false); setEditing(null)
    setForm({ title: '', description: '', provider_name: '', provider_contact: '', thumbnail_url: '', price: '', duration: '', location: '', is_online: false, required_plan: 'pro' })
    fetchServices()
  }

  const togglePublish = async (s: any) => {
    const supabase = createClient()
    await supabase.from('training_services').update({ status: s.status === 'published' ? 'draft' : 'published' }).eq('id', s.id)
    fetchServices()
  }

  const deleteService = async (id: string) => {
    if (!confirm('حذف الخدمة؟')) return
    const supabase = createClient()
    await supabase.from('training_services').delete().eq('id', id)
    fetchServices()
  }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
          <span className="text-gray-600">/</span>
          <span className="font-bold">خدمات التدريب</span>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary text-sm py-2 flex items-center gap-1.5">
          <Plus size={16} /> خدمة جديدة
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {showForm && (
          <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-lg mb-5">{editing ? 'تعديل خدمة' : 'إضافة خدمة تدريب'}</h2>
              <div className="space-y-4">
                {[
                  { label: 'عنوان الخدمة *', key: 'title', type: 'text' },
                  { label: 'مزود الخدمة / المركز *', key: 'provider_name', type: 'text' },
                  { label: 'معلومات التواصل', key: 'provider_contact', type: 'text' },
                  { label: 'السعر (ل.س)', key: 'price', type: 'number' },
                  { label: 'المدة (مثال: 3 أشهر)', key: 'duration', type: 'text' },
                  { label: 'الموقع', key: 'location', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-sm text-gray-300 mb-1.5 block">{label}</label>
                    <input type={type} value={form[key as keyof typeof form] as string}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 text-white" />
                  </div>
                ))}
                <div>
                  <label className="text-sm text-gray-300 mb-1.5 block">الوصف</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer p-3 rounded-xl bg-dark-700">
                    <input type="checkbox" checked={form.is_online} onChange={e => setForm(f => ({ ...f, is_online: e.target.checked }))} className="w-4 h-4" />
                    <span>أونلاين</span>
                  </label>
                  <div>
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
                <button onClick={() => setShowForm(false)} className="glass-card rounded-xl px-4 py-2 flex-1 hover:bg-white/10 text-sm">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {fetching ? (
          <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="space-y-3">
            {services.map((s: any) => (
              <div key={s.id} className="glass-card rounded-2xl p-5 flex items-center gap-4 border border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{s.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.provider_name} {s.is_online ? '· 🌐 أونلاين' : s.location ? `· ${s.location}` : ''}</div>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`badge-${s.required_plan}`}>{s.required_plan}</span>
                    {s.price && <span className="text-xs text-gold-400">{parseInt(s.price).toLocaleString('ar')} ل.س</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {s.status === 'published' ? 'منشور' : 'مسودة'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => {
                    setEditing(s)
                    setForm({ title: s.title, description: s.description || '', provider_name: s.provider_name, provider_contact: s.provider_contact || '', thumbnail_url: s.thumbnail_url || '', price: s.price?.toString() || '', duration: s.duration || '', location: s.location || '', is_online: s.is_online, required_plan: s.required_plan })
                    setShowForm(true)
                  }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Edit size={15} /></button>
                  <button onClick={() => togglePublish(s)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                    {s.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => deleteService(s.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400"><Trash size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
