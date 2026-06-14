import { useEffect, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { authAPI, UserProfile } from '../services/api'
import { getApiBaseUrl } from '../utils/api'
import { getImageUrl } from '../utils/image'
import { useToast } from '../components/Toast'
import Loading from '../components/Loading'
import ErrorAlert from '../components/ErrorAlert'

/* ── 类型 ── */
interface CreditRecord {
  id: string;
  score: number;
  change: number;
  reason: string;
  createdAt: string;
}

interface CreditInfo {
  creditScore: number;
  isBanned: boolean;
  records: CreditRecord[];
}

/* ── 图标 ── */
const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.587 1.587m0 0l-13.228 13.228a2.25 2.25 0 01-.688.511l-2.518.845a.75.75 0 01-.911-.811l.193-1.855a2.25 2.25 0 01.512-.689l13.228-13.228zm1.587 1.587L18.448 6.06M4.135 19.435a2.25 2.25 0 01-.512-.689l-.193-1.855a.75.75 0 01.911-.811l2.518.845a2.25 2.25 0 01.688.511l1.023 1.023m-5.472 5.472l1.587 1.587m0 0l1.085-1.085m-1.085 1.085l-1.085-1.085" />
  </svg>
)

const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
)

/* ── 主组件 ── */
export default function Profile() {
  const navigate = useNavigate()
  const { dark } = useTheme()
const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNameModal, setShowNameModal] = useState(false)
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [pwdOld, setPwdOld] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) { navigate('/login'); return }
    try { 
      const parsed = JSON.parse(userStr)
      setUser(parsed) 
      if (parsed?.role === 'ADMIN') { navigate('/admin'); return }
    } catch { 
      localStorage.removeItem('user'); navigate('/login'); return 
    }
    fetchUser()
    fetchCredit()
  }, [])

  const fetchCredit = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${getApiBaseUrl()}/api/users/me/credit`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCreditInfo(data)
      }
    } catch { /* ignore */ }
  }

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await authAPI.getProfile(token!)
      setUser(res.user)
      localStorage.setItem('user', JSON.stringify(res.user))
    } catch (e: unknown) {
      const errObj = e as { response?: { data?: { error?: string } } };
      setFetchError(errObj.response?.data?.error || '获取用户信息失败')
    } finally { setLoading(false) }
  }

  const handleChangeName = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      await authAPI.updateProfile(token!, { name: newName.trim() })
      await fetchUser()
      setShowNameModal(false); setNewName('')
      showToast('用户名修改成功', 'success')
    } catch (e: unknown) {
      const errObj = e as { response?: { data?: { error?: string } } };
      showToast(errObj.response?.data?.error || '修改失败', 'error')
    } finally { setSaving(false) }
  }

  const handleChangePwd = async () => {
    if (!pwdOld || !pwdNew || pwdNew !== pwdConfirm) return
    if (pwdNew.length < 6) { showToast('新密码至少6位', 'error'); return }
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      await authAPI.changePassword(token!, { oldPassword: pwdOld, newPassword: pwdNew })
      setShowPwdModal(false)
      setPwdOld(''); setPwdNew(''); setPwdConfirm('')
      showToast('密码修改成功', 'success')
    } catch (e: unknown) {
      const errObj = e as { response?: { data?: { error?: string } } };
      showToast(errObj.response?.data?.error || '修改失败', 'error')
    } finally { setSaving(false) }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const token = localStorage.getItem('token')
      await authAPI.uploadAvatar(token!, formData)
      await fetchUser()
      showToast('头像更新成功', 'success')
    } catch (e: unknown) {
      const errObj = e as { response?: { data?: { error?: string } } };
      showToast(errObj.response?.data?.error || '上传失败', 'error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 顶部导航 */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">简历面试AI助手</span>
          </button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            返回首页
          </button>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">个人设置</h1>

        {/* 错误提示 */}
        {fetchError && (
          <div className="mb-6">
            <ErrorAlert
              message={fetchError}
              onRetry={() => { setFetchError(''); setLoading(true); fetchUser(); }}
            />
          </div>
        )}

        {/* 加载中 */}
        {loading && !fetchError && (
          <Loading text="正在加载用户信息..." />
        )}

        {/* 头像 + 用户名卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm p-8 mb-6 transition-colors relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-100/40 dark:from-brand-900/20 to-transparent rounded-full -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-brand-100/30 dark:from-brand-900/15 to-transparent rounded-full -ml-6 -mb-6 pointer-events-none" />
          <div className="flex items-center gap-6 relative">
            {/* 头像 */}
            <div className="relative flex-shrink-0">
              {/* 头像主体 */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden ring-4 ring-white dark:ring-gray-900">
                {user?.avatar ? (
                  <img
                    src={user.avatar?.startsWith('data:') ? user.avatar : `${getImageUrl(user.avatar)}?t=${Date.now()}`}
                    alt=""
                    className="w-24 h-24 rounded-full object-cover"
                    key={user.avatar}
                  />
                ) : (
                  <span className="select-none">{(user?.name || user?.email || '?')[0].toUpperCase()}</span>
                )}
              </div>
              {/* 编辑按钮 */}
              <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border-2 border-brand-100 dark:border-gray-700 shadow-lg cursor-pointer flex items-center justify-center hover:bg-brand-50 dark:hover:bg-gray-700 hover:border-brand-300 dark:hover:border-brand-500 transition-all group">
                <PencilIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            {/* 用户名 + 邮箱 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{user?.name || '未设置用户名'}</h2>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5">注册于 {loading ? '...' : formatDate(user?.createdAt || '')}</p>
            </div>
          </div>
        </div>

        {/* 信用分展示 */}
        {creditInfo && !creditInfo.isBanned && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm p-6 mb-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">信用分</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                creditInfo.creditScore >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                creditInfo.creditScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {creditInfo.creditScore >= 80 ? '优秀' : creditInfo.creditScore >= 60 ? '良好' : '较差'}
              </span>
            </div>
            <div className="flex items-end gap-4 mb-1">
              <span className={`text-4xl font-bold ${
                creditInfo.creditScore >= 80 ? 'text-green-600 dark:text-green-400' :
                creditInfo.creditScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>{creditInfo.creditScore}</span>
              <span className="text-sm text-gray-400 dark:text-gray-500 mb-1">/ 100 分</span>
            </div>
            {/* 进度条 */}
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  creditInfo.creditScore >= 80 ? 'bg-green-500' :
                  creditInfo.creditScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.max(creditInfo.creditScore, 2)}%` }}
              />
            </div>
          </div>
        )}

        {/* 已封禁提示 */}
        {creditInfo?.isBanned && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6 mb-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-semibold">⚠️ 您的账号已被封禁</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-1">信用分为0，请联系管理员</p>
          </div>
        )}

        {/* 信用记录 */}
        {creditInfo && creditInfo.records.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden mb-6 transition-colors">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">信用记录</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto">
              {creditInfo.records.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{r.reason}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <span className={`ml-3 text-sm font-semibold ${r.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {r.change > 0 ? `+${r.change}` : r.change}分
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 设置列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden transition-colors">

          {/* 深色模式 */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              {dark ? <MoonIcon className="w-5 h-5 text-brand-400" /> : <SunIcon className="w-5 h-5 text-amber-500" />}
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">{dark ? '深色模式' : '浅色模式'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">切换应用外观主题</div>
              </div>
            </div>
<ThemeToggle />

          </div>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* 修改用户名 */}
          <button
            onClick={() => { setNewName(user?.name || ''); setShowNameModal(true) }}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          >
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white text-sm">修改用户名</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">当前：{user?.name || '未设置'}</div>
            </div>
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* 修改密码 */}
          <button
            onClick={() => setShowPwdModal(true)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          >
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white text-sm">修改密码</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">更改登录密码</div>
            </div>
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* 退出登录 */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="text-left">
              <div className="font-medium text-red-600 dark:text-red-400 text-sm">退出登录</div>
              <div className="text-xs text-red-400 dark:text-red-500 mt-0.5">退出当前账号，返回登录页</div>
            </div>
            <svg className="w-4 h-4 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>
      </div>

      {/* 修改用户名弹窗 */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50" onClick={() => setShowNameModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4 border border-gray-200/60 dark:border-gray-700/60" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">修改用户名</h3>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="请输入新用户名"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 dark:focus:border-brand-400 transition-colors"
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNameModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">取消</button>
              <button onClick={handleChangeName} disabled={saving || !newName.trim()} className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm hover:bg-brand-700 disabled:opacity-40 transition-colors">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50" onClick={() => setShowPwdModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md mx-4 border border-gray-200/60 dark:border-gray-700/60" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">修改密码</h3>
            <div className="space-y-3">
              <input
                type="password"
                value={pwdOld}
                onChange={e => setPwdOld(e.target.value)}
                placeholder="当前密码"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 dark:focus:border-brand-400 transition-colors"
              />
              <input
                type="password"
                value={pwdNew}
                onChange={e => setPwdNew(e.target.value)}
                placeholder="新密码（至少6位）"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 dark:focus:border-brand-400 transition-colors"
              />
              <input
                type="password"
                value={pwdConfirm}
                onChange={e => setPwdConfirm(e.target.value)}
                placeholder="确认新密码"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 dark:focus:border-brand-400 transition-colors"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPwdModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">取消</button>
              <button onClick={handleChangePwd} disabled={saving || !pwdOld || !pwdNew || pwdNew !== pwdConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm hover:bg-brand-700 disabled:opacity-40 transition-colors">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
