'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Users, Search, ArrowRight, Shield, ChevronDown, KeyRound, Info } from 'lucide-react'
import Link from 'next/link'
import { PLAN_LABELS, formatDate } from '@/lib/utils'
import { UserPlan, UserRole } from '@/types'

export default function AdminUsersPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [fetching, setFetching] = useState(true)
  const [pwUser, setPwUser] = useState<any>(null)
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'staff'))) router.push('/')
  }, [loading, profile])

  const fetchUsers = async () => {
    setFetching(true)
    const supabase = createClient()
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50)
    if (search) query = query.ilike('full_name', `%${search}%`)
    const { data } = await query
    setUsers(data || [])
    setFetching(false)
  }

  useEffect(() => { if (profile) fetchUsers() }, [profile, search])

  const updateUserPlan = async (userId: string, newPlan: UserPlan, months: number = 1) => {
    const supabase = createClient()
    const expires = new Date()
    expires.setMonth(expires.getMonth() + months)
    await supabase.from('profiles').update({
      plan: newPlan,
      plan_expires_at: newPlan === 'free' ? null : expires.toISOString()
    }).eq('id', userId)
    fetchUsers()
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (newRole === 'admin' && !confirm('تأكيد منح صلاحيات الأدمين؟')) return
    const supabase = createClient()
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    fetchUsers()
  }

  const toggleActive = async (userId: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('profiles').update({ is_active: !current }).eq('id', userId)
    fetchUsers()
  }

  const submitPassword = async () => {
    if (newPw.length < 8) { setPwMsg('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    setPwSaving(true); setPwMsg('')
    const res = await fetch('/api/admin/users/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: pwUser.id, newPassword: newPw }),
    })
    setPwSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setPwMsg(d.error || 'تعذّر تحديث كلمة المرور')
      return
    }
    setPwMsg('done')
    setNewPw('')
    setTimeout(() => { setPwUser(null); setPwMsg('') }, 1500)
  }

  return (
    <main className="min-h-screen">
      <div className="bg-dark-800 border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm"><ArrowRight size={16} /> الإدارة</Link>
        <span className="text-gray-600">/</span>
        <span className="font-bold">المستخدمون</span>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="text-blue-400" size={24} /> إدارة المستخدمين
        </h1>

        {profile?.role === 'admin' && (
          <div className="flex items-start gap-2 bg-primary-500/5 border border-primary-500/20 rounded-xl p-3 mb-5 text-xs text-gray-300">
            <Info size={15} className="text-primary-400 flex-shrink-0 mt-0.5" />
            <span>
              لأسباب أمنية، كلمات المرور مُشفّرة ولا يمكن عرضها لأي أحد. يمكنك بدلاً من ذلك
              <span className="text-primary-300"> تعيين كلمة مرور جديدة </span>
              للمستخدم عند الحاجة (مثلاً إذا فقد الوصول لحسابه).
            </span>
          </div>
        )}

        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم..."
            className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
          />
        </div>

        {fetching ? (
          <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-dark-700 text-gray-400 text-xs">
                  <tr>
                    <th className="text-right px-4 py-3 font-medium">المستخدم</th>
                    <th className="text-right px-4 py-3 font-medium">الدور</th>
                    <th className="text-right px-4 py-3 font-medium">الخطة</th>
                    <th className="text-right px-4 py-3 font-medium">الانتهاء</th>
                    <th className="text-right px-4 py-3 font-medium">الحالة</th>
                    <th className="text-right px-4 py-3 font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="border-t border-white/5 hover:bg-white/2">
                      <td className="px-4 py-3">
                        <div className="font-medium">{u.full_name}</div>
                        <div className="text-gray-500 text-xs">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        {profile?.role === 'admin' ? (
                          <select
                            value={u.role}
                            onChange={e => updateUserRole(u.id, e.target.value as UserRole)}
                            className="bg-dark-700 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="student">طالب</option>
                            <option value="teacher">معلم</option>
                            <option value="staff">موظف</option>
                            <option value="admin">أدمن</option>
                          </select>
                        ) : (
                          <span className="text-gray-400 text-xs">{u.role}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.plan}
                          onChange={e => updateUserPlan(u.id, e.target.value as UserPlan)}
                          className={`rounded-lg px-2 py-1 text-xs font-medium focus:outline-none border ${u.plan === 'free' ? 'bg-gray-700 border-gray-600 text-gray-200' : u.plan === 'pro' ? 'bg-primary-900 border-primary-600 text-primary-300' : 'bg-yellow-900 border-yellow-600 text-yellow-300'}`}
                        >
                          <option value="free">مجاني</option>
                          <option value="pro">برو</option>
                          <option value="max">ماكس</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {u.plan_expires_at ? formatDate(u.plan_expires_at) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          className={`text-xs px-2 py-1 rounded-full border transition-colors ${u.is_active ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'}`}
                        >
                          {u.is_active ? 'نشط' : 'موقوف'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          {profile?.role === 'admin' && (
                            <button
                              onClick={() => { setPwUser(u); setNewPw(''); setPwMsg('') }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-primary-500/40 transition-colors"
                              title="تعيين كلمة مرور جديدة"
                            >
                              <KeyRound size={13} /> كلمة المرور
                            </button>
                          )}
                          <span className="whitespace-nowrap">{formatDate(u.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: تعيين كلمة مرور جديدة */}
      {pwUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => !pwSaving && setPwUser(null)}>
          <div className="glass-card rounded-2xl border border-white/10 p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-1">
              <KeyRound size={18} className="text-primary-400" />
              <h3 className="font-bold">تعيين كلمة مرور جديدة</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">للمستخدم: <span className="text-gray-200">{pwUser.full_name}</span> ({pwUser.email})</p>

            {pwMsg === 'done' ? (
              <div className="text-green-400 text-sm py-3 text-center">✓ تم تعيين كلمة المرور بنجاح</div>
            ) : (
              <>
                {pwMsg && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 text-red-400 text-xs mb-3">{pwMsg}</div>}
                <input
                  type="text"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="كلمة المرور الجديدة (8 أحرف على الأقل)"
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 text-white placeholder-gray-500 mb-2"
                />
                <p className="text-xs text-gray-500 mb-4">انسخ كلمة المرور وأرسلها للمستخدم بأمان. لا يمكن استرجاعها لاحقاً.</p>
                <div className="flex gap-2">
                  <button onClick={() => setPwUser(null)} disabled={pwSaving} className="flex-1 border border-white/10 rounded-xl py-2.5 text-sm hover:bg-white/5 disabled:opacity-50">إلغاء</button>
                  <button onClick={submitPassword} disabled={pwSaving} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50">
                    {pwSaving ? 'جارٍ الحفظ...' : 'تعيين'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
