import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobAPI } from '../services/api';
import { useToast } from '../components/Toast';
import { getApiBaseUrl } from '../utils/api';
import { getImageUrl } from '../utils/image';
import { ButtonSpinner } from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';

const API_BASE = getApiBaseUrl();

export default function EnterpriseJobEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    salaryRange: '',
    location: '',
    type: '',
    status: 'ACTIVE' as 'ACTIVE' | 'CLOSED' | 'DRAFT',
    images: [] as string[],
  });
  const [hrName, setHrName] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrPassword, setHrPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/enterprise/login');
        return;
      }

      const res = await jobAPI.getDetail(id!);
      const job = res.job;
      setForm({
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        salaryRange: job.salaryRange || '',
        location: job.location || '',
        type: job.type || '',
        status: job.status || 'ACTIVE',
        images: (job as any).images || [],
      });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      const msg = errObj.response?.data?.error || '加载失败';
      setError(msg);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/api/upload/job-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
      } else {
        showToast(data.error || '上传失败', 'error');
      }
    } catch (err) {
      showToast('上传失败', 'error');
    } finally {
      setUploading(false);
      // 清空input，允许重复选择同一文件
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/enterprise/login');
        return;
      }

      if (isEdit) {
        await jobAPI.update(token, id!, form);
        showToast('职位更新成功', 'success');
      } else {
        // HR信息为必填
        if (!hrEmail || !hrPassword || !hrName) {
          setError('请填写完整的HR账号信息（姓名、邮箱、密码）');
          setLoading(false);
          return;
        }
        const data: any = { ...form };
        data.hrName = hrName;
        data.hrEmail = hrEmail;
        data.hrPassword = hrPassword;
        const result = await jobAPI.create(token, data);
        if ((result as any).hr) {
          showToast(`职位创建成功！HR 账号「${(result as any).hr.loginEmail}」已创建，请妥善保管密码。`, 'success');
        } else {
          showToast('职位创建成功', 'success');
        }
      }

      navigate('/enterprise/jobs');
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      const msg = errObj.response?.data?.error || '操作失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/enterprise/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEdit ? '编辑职位' : '发布新职位'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                职位标题 *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="如：高级前端工程师"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                职位描述 *
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                placeholder="详细描述这个职位..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                任职要求
              </label>
              <textarea
                value={form.requirements}
                onChange={e => setForm({ ...form, requirements: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                placeholder="列出任职要求..."
              />
            </div>

            {/* 职位图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                职位图片（最多6张）
              </label>
              <div className="flex flex-wrap gap-3 mb-3">
                {form.images.map((url, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {form.images.length < 6 && (
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-brand-500 dark:hover:border-brand-400 text-gray-400">
                    {uploading ? (
                      <ButtonSpinner />
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">支持 JPG/PNG/WebP 格式，单张最大 5MB</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  薪资范围
                </label>
                <input
                  type="text"
                  value={form.salaryRange}
                  onChange={e => setForm({ ...form, salaryRange: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="如：15k-25k"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  工作地点
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="如：北京、上海、远程"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  职位类型
                </label>
                <input
                  type="text"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="如：全职、兼职、实习"
                />
              </div>

              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    状态
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'CLOSED' | 'DRAFT' })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">活跃</option>
                    <option value="CLOSED">已关闭</option>
                    <option value="DRAFT">草稿</option>
                  </select>
                </div>
              )}
            </div>

            {!isEdit && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                HR账号设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HR姓名</label>
                  <input type="text" placeholder="如：Python岗HR-小王" value={hrName} onChange={e => setHrName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HR邮箱 <span className="text-red-500">*</span></label>
                  <input type="email" placeholder="hr_python@company.com" value={hrEmail} onChange={e => setHrEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HR密码 <span className="text-red-500">*</span></label>
                  <input type="password" placeholder="至少6位" value={hrPassword} onChange={e => setHrPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">发布岗位将自动创建HR子账号，登录信息请在提交后妥善保管。</p>
            </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/enterprise/jobs')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (isEdit ? '更新中...' : '发布中...') : (isEdit ? '更新职位' : '发布职位')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
