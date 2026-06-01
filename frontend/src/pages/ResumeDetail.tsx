import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { exportTextToPdf } from '../utils/exportPdf';
import { useTheme } from '../context/ThemeContext';
import { resumeAPI } from '../services/api';

interface Resume {
  id: string;
  title: string;
  status: string;
  score: number | null;
  analysis?: {
    scores?: Record<string, number>;
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
    keyword_recommendations?: string[];
  };
  rawText: string;
  createdAt: string;
  updatedAt: string;
}

function ResumeDetail() {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { dark, toggleTheme } = useTheme();
  const { showToast } = useToast();

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await resumeAPI.getDetail(token!, id!) as unknown as Resume
      setResume(response);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      setError(errObj.response?.data?.error || '获取简历详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!confirm('确定要分析这份简历吗？分析需要30-60秒。')) return;
    
    setAnalyzing(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await resumeAPI.analyze(token!, id!) as unknown as { resume: Resume; analysis: Resume['analysis'] }
      setResume(response.resume);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      setError(errObj.response?.data?.error || '分析失败');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这份简历吗？')) return;
    
    try {
      const token = localStorage.getItem('token');
      await resumeAPI.delete(token!, id!);
      
      showToast('删除成功', 'success');
      navigate('/resumes');
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } };
      showToast(errObj.response?.data?.error || '删除失败', 'error');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '中等';
    if (score >= 60) return '及格';
    return '需改进';
  };

  if (loading) return <div className="p-5 text-center text-gray-600 dark:text-gray-300">加载中...</div>;
  if (error) return <div className="p-5 text-center text-red-500">{error}</div>;
  if (!resume) return <div className="p-5 text-center text-gray-600 dark:text-gray-300">简历不存在</div>;

  const scores = resume!.analysis?.scores || {};
  const hasAnalysis = resume!.status === 'ANALYZED' && resume!.analysis;
  const currentResume = resume!;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto p-5">
      {/* 顶部导航栏 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm">
            ← 首页
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white m-0">{currentResume.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
            title={dark ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {dark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          <button onClick={() => navigate('/resumes')} className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">返回列表</button>
          <button onClick={handleDelete} className="px-3 py-2 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400">删除</button>
          <button
            onClick={() => {
              try {
                exportTextToPdf(currentResume.title || '简历', currentResume.rawText || '', currentResume.title || '简历');
                showToast('PDF导出成功', 'success');
              } catch (err: unknown) {
                const errObj = err as Error;
                showToast('PDF导出失败：' + errObj.message, 'error');
              }
            }}
            className="px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            📄 导出PDF
          </button>
        </div>
      </div>

      {/* 基本信息和操作 */}
      <div className="mb-8 p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="mb-1 text-gray-700 dark:text-gray-200">
              <strong>状态:</strong> 
              <span className={`font-bold ml-1 ${currentResume.status === 'ANALYZED' ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {currentResume.status === 'ANALYZED' ? '已分析' : '未分析'}
              </span>
            </p>
            <p className="mb-1 text-gray-700 dark:text-gray-200">
              <strong>评分:</strong> 
              <span className={`font-bold text-lg ml-1 ${getScoreColor(currentResume.score || 0)}`}>
                {currentResume.score || '-'}
              </span>
              {currentResume.score && (
                <span className="ml-1 text-gray-500 dark:text-gray-400 text-sm">
                  ({getScoreLabel(currentResume.score)})
                </span>
              )}
            </p>
            <p className="m-0 text-xs text-gray-400 dark:text-gray-500">
              更新于: {new Date(currentResume.updatedAt).toLocaleString()}
            </p>
          </div>
          <button 
            onClick={handleAnalyze} 
            disabled={analyzing}
            className={`px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-colors ${
              analyzing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
            }`}
          >
            {analyzing ? '分析中，请稍候...' : (hasAnalysis ? '重新分析' : '开始分析')}
          </button>
        </div>
      </div>

      {/* 详细分析结果 */}
      {hasAnalysis && (
        <div className="mb-8">
          {/* 总体评价 */}
          <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl mb-5 bg-white dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">总体评价</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{currentResume.analysis?.summary || '暂无评价'}</p>
          </div>

          {/* 维度得分 */}
          <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl mb-5 bg-white dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">维度得分</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { key: 'content_completeness', label: '内容完整性' },
                { key: 'structure_clarity', label: '结构清晰度' },
                { key: 'keyword_match', label: '关键词匹配' },
                { key: 'language_expression', label: '语言表达' },
                { key: 'data_support', label: '数据支撑' }
              ].map(({ key, label }) => {
                const score = scores[key] || 0;
                return (
                  <div key={key} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className={`text-2xl font-bold mb-1 ${getScoreColor(score)}`}>
                      {score}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 优点 */}
          {currentResume.analysis?.strengths && currentResume.analysis.strengths.length > 0 && (
            <div className="p-5 border border-green-200 dark:border-green-800 rounded-xl mb-5 bg-green-50 dark:bg-green-900/30">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">亮点</h3>
              <ul className="m-0 pl-5">
                {currentResume.analysis?.strengths?.map((s: string, i: number) => (
                  <li key={i} className="mb-2 text-green-700 dark:text-green-300 leading-relaxed">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 问题 */}
          {currentResume.analysis?.weaknesses && currentResume.analysis.weaknesses.length > 0 && (
            <div className="p-5 border border-red-200 dark:border-red-800 rounded-xl mb-5 bg-red-50 dark:bg-red-900/30">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3">问题</h3>
              <ul className="m-0 pl-5">
                {currentResume.analysis?.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="mb-2 text-red-700 dark:text-red-300 leading-relaxed">{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 具体建议 */}
          {currentResume.analysis?.suggestions && currentResume.analysis.suggestions.length > 0 && (
            <div className="p-5 border border-blue-200 dark:border-blue-800 rounded-xl mb-5 bg-blue-50 dark:bg-blue-900/30">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">改进建议</h3>
              <ol className="m-0 pl-5">
                {currentResume.analysis?.suggestions?.map((s: string, i: number) => (
                  <li key={i} className="mb-2 text-blue-700 dark:text-blue-300 leading-relaxed">{s}</li>
                ))}
              </ol>
            </div>
          )}

          {/* 推荐关键词 */}
          {currentResume.analysis?.keyword_recommendations && currentResume.analysis.keyword_recommendations.length > 0 && (
            <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl mb-5 bg-white dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">推荐关键词</h3>
              <div className="flex flex-wrap gap-2">
                {currentResume.analysis?.keyword_recommendations?.map((k: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 简历原文 */}
      <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">简历原文</h3>
        <pre className="whitespace-pre-wrap text-sm max-h-96 overflow-auto bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          {currentResume.rawText}
        </pre>
      </div>
    </div>
    </div>
  );
}

export default ResumeDetail;
