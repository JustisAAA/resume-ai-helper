import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'
import { resumeAPI } from '../services/api'


interface Resume {
  id: string;
  title: string;
  fileUrl: string;
  score: number | null;
  analyzedAt: string | null;
  createdAt: string;
}

interface ScoreResult {
  overall_score: number;
  dimension_scores: {
    content_quality: number;
    structure_norm: number;
    keyword_match: number;
    readability: number;
  };
  dimension_explanation?: {
    content_quality: string;
    structure_norm: string;
    keyword_match: string;
    readability: string;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  benchmark: string;
  next_steps: string;
}

export default function ToolsScore() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const { dark, toggleTheme } = useTheme();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    resumeAPI.list(token!).then(r => setResumes(r as unknown as Resume[]))
      .catch(() => setError('获取简历列表失败'));
  }, [token, navigate]);

  const handleScore = async () => {
    if (!selectedId) { setError('请先选择一份简历'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const r = await resumeAPI.score(token!, selectedId) as unknown as { score: ScoreResult }
      setResult(r.score);
    } catch (e: unknown) {
      setError('评分失败')
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (s: number) => s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : 'text-red-600';
  const getScoreBg = (s: number) => s >= 80 ? 'from-emerald-500 to-teal-500' : s >= 60 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-pink-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 顶部导航 */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="返回">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">AI 简历评分</span>
          </div>
          <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title={dark ? '浅色模式' : '深色模式'}>
            {dark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 17.657l-.707-.707m12.728 0l-.707.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.001 9.001 0 0012 21a9.001 9.001 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!result ? (
          /* 评分表单 */
          <div className="space-y-8">
            {/* 标题区 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI 简历评分</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">上传简历后，AI 将从内容质量、结构规范性、关键词匹配度、可读性四个维度进行评分，并给出改进建议</p>
            </div>

            {/* 简历选择 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">选择要评分的简历</label>
              {resumes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">你还没有上传简历</p>
                  <button onClick={() => navigate('/resumes/upload')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">去上传简历</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resumes.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedId === r.id ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{r.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()} · {r.score ? `上次评分: ${r.score}` : '未评分'}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 错误提示 */}
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            {/* 开始评分按钮 */}
            <div className="text-center">
              <button
                onClick={handleScore}
                disabled={loading || !selectedId}
                className="inline-flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    AI 评分中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    开始评分
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* 评分结果 */
          <div className="space-y-8">
            {/* 总分卡片 */}
            <div className={`relative overflow-hidden bg-gradient-to-br ${getScoreBg(result.overall_score)} rounded-3xl p-8 text-white text-center`}>
              <div className="relative z-10">
                <div className="text-6xl font-bold mb-2">{result.overall_score}</div>
                <div className="text-lg opacity-90">综合评分</div>
                <div className="mt-4 text-sm opacity-75 max-w-md mx-auto">{result.benchmark}</div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-10 -mb-10" />
            </div>

            {/* 四维评分 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">维度评分</h3>
              <div className="space-y-5">
                {[
                  { key: 'content_quality', label: '内容质量', v: result.dimension_scores.content_quality },
                  { key: 'structure_norm', label: '结构规范性', v: result.dimension_scores.structure_norm },
                  { key: 'keyword_match', label: '关键词匹配度', v: result.dimension_scores.keyword_match },
                  { key: 'readability', label: '可读性', v: result.dimension_scores.readability },
                ].map(d => (
                  <div key={d.key}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600 dark:text-gray-400">{d.label}</span>
                      <span className={`font-semibold ${getScoreColor(d.v)}`}>{d.v}分</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${getScoreBg(d.v)} transition-all duration-1000`} style={{ width: `${d.v}%` }} />
                    </div>
                    {result.dimension_explanation?.[d.key as keyof typeof result.dimension_explanation] && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{result.dimension_explanation[d.key as keyof typeof result.dimension_explanation]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 优势 & 不足 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4">优势亮点</h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">待改进点</h3>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 改进建议 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">改进建议</h3>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">下一步：{result.next_steps}</p>
              </div>
            </div>

            {/* 重新评分 */}
            <div className="text-center">
              <button onClick={() => { setResult(null); setSelectedId(''); }} className="px-8 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">重新评分</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
