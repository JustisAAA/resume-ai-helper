import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate } from 'react-router-dom';
import { enterpriseAPI } from '../services/api';
import { getApiBaseUrl } from '../utils/api';
import { getImageUrl } from '../utils/image';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';

/* ── 图标组件 ── */

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

const CameraIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-1.5 0a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

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

export default function EnterpriseProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    loadProfile();
    fetchCredit();
  }, []);

  const fetchCredit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiBaseUrl()}/api/users/me/credit`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCreditInfo(data);
      }
    } catch { /* ignore */ }
  };

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/enterprise/login'); return; }
      const res = await enterpriseAPI.getProfile(token);
      const e = res.enterprise;
      setForm({
        name: e.name || '',
        description: e.description || '',
        website: e.website || '',
        industry: e.industry || '',
        size: e.size || '',
        location: e.location || '',
        contactEmail: e.contactEmail || '',
        contactPhone: e.contactPhone || '',
      });
      if (e.logo) setLogoPreview(getImageUrl(e.logo));
    } catch (err: any) {
      setError(err.response?.data?.error || '加载企业信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo图片不能超过2MB');
      return;
    }

    // 立即显示本地预览
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError('');
    setSuccess('');

    // 自动上传 Logo
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch(`${getApiBaseUrl()}/api/enterprise/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Logo上传失败');

      // 上传成功后，用服务器返回的 logo 更新预览（支持 base64 data URL）
      if (data.enterprise?.logo) {
        setLogoPreview(data.enterprise.logo);
      }
      setSuccess('Logo更新成功！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Logo上传失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('企业名称不能为空');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/enterprise/login'); return; }

      const formData = new FormData();
      formData.append('name', form.name.trim());
      if (form.description) formData.append('description', form.description);
      if (form.website) formData.append('website', form.website);
      if (form.industry) formData.append('industry', form.industry);
      if (form.size) formData.append('size', form.size);
      if (form.location) formData.append('location', form.location);
      if (form.contactEmail) formData.append('contactEmail', form.contactEmail);
      if (form.contactPhone) formData.append('contactPhone', form.contactPhone);
      if (logoFile) formData.append('logo', logoFile);

      const res = await fetch(`${getApiBaseUrl()}/api/enterprise/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '保存失败');

      setSuccess('企业资料更新成功！');
      setShowEditModal(false);
      await loadProfile();
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword) { setPasswordMsg('请输入当前密码'); return; }
    if (!newPassword) { setPasswordMsg('请输入新密码'); return; }
    if (newPassword.length < 6) { setPasswordMsg('新密码至少6位'); return; }

    setChangingPassword(true);
    setPasswordMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiBaseUrl()}/api/auth/me/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '修改失败');
      setPasswordMsg('密码修改成功');
      setTimeout(() => { setShowPwdModal(false); setPasswordMsg(''); setOldPassword(''); setNewPassword(''); }, 1000);
    } catch (err: any) {
      setPasswordMsg(err.message || '修改失败');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="sm" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 dark:focus:border-brand-500 transition-colors text-sm";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* 顶部导航 */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <button onClick={() => navigate('/enterprise/dashboard')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <BuildingIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">简历面试AI助手企业端</span>
          </button>
          <div className="flex items-center gap-2">
<ThemeToggle />

            <button onClick={() => navigate('/enterprise/dashboard')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              返回首页
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">企业设置</h1>

        {/* 错误/成功提示 */}
        {error && <ErrorAlert message={error} />}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">{success}</div>
        )}

        {/* 企业信息卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm p-8 mb-6 transition-colors relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-100/40 dark:from-brand-900/20 to-transparent rounded-full -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-100/30 dark:from-pink-900/15 to-transparent rounded-full -ml-6 -mb-6 pointer-events-none" />
          <div className="flex items-center gap-6 relative">
            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden ring-4 ring-white dark:ring-gray-900">
                {logoPreview ? (
                  <img src={logoPreview} alt={form.name} className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  <BuildingIcon className="w-10 h-10 text-white/80" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-gray-700 shadow-lg cursor-pointer flex items-center justify-center hover:bg-purple-50 dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all group">
                <CameraIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>
            {/* 企业信息 */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{form.name || '未设置企业名称'}</h2>
              {form.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{form.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {form.industry && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full">
                    {form.industry}
                  </span>
                )}
                {form.size && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                    {form.size}
                  </span>
                )}
                {form.location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                    {form.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 信用分卡片 */}
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

        {/* 设置列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden transition-colors">

          {/* 编辑企业资料 */}
          <button
            onClick={() => { setShowEditModal(true); setError(''); setSuccess(''); }}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          >
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white text-sm">编辑企业资料</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">修改企业名称、描述、联系方式等信息</div>
            </div>
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* 修改密码 */}
          <button
            onClick={() => { setShowPwdModal(true); setPasswordMsg(''); setOldPassword(''); setNewPassword(''); }}
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

      {/* 编辑企业资料弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto mx-4 border border-gray-200/60 dark:border-gray-700/60" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">编辑企业资料</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <ErrorAlert message={error} />}

              {/* 企业名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">企业名称</label>
                <input name="name" value={form.name} onChange={handleChange} className={inputClass} required />
              </div>

              {/* 企业描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">企业描述</label>
                <textarea
                  name="description" value={form.description} onChange={handleChange} rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="简要描述你的企业..."
                />
              </div>

              {/* 行业 + 规模 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">行业</label>
                  <input name="industry" value={form.industry} onChange={handleChange} className={inputClass} placeholder="如：互联网" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">规模</label>
                  <input name="size" value={form.size} onChange={handleChange} className={inputClass} placeholder="如：50-150人" />
                </div>
              </div>

              {/* 所在地 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">所在地</label>
                <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="如：山东省济南市" />
              </div>

              {/* 官网 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">官网</label>
                <input name="website" value={form.website} onChange={handleChange} className={inputClass} placeholder="https://www.example.com" />
              </div>

              {/* 联系邮箱 + 电话 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">联系邮箱</label>
                  <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} className={inputClass} placeholder="hr@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">联系电话</label>
                  <input name="contactPhone" value={form.contactPhone} onChange={handleChange} className={inputClass} placeholder="0531-xxxxxxxx" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-40 transition-colors"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
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
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="当前密码"
                className={inputClass}
              />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="新密码（至少6位）"
                className={inputClass}
              />
            </div>
            {passwordMsg && (
              <p className={`mt-3 text-xs ${passwordMsg.includes('成功') ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{passwordMsg}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPwdModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">取消</button>
              <button onClick={handleChangePassword} disabled={changingPassword} className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-40 transition-colors">
                {changingPassword ? '修改中...' : '确认修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
