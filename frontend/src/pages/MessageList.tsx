import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageAPI } from '../services/messageAPI';
import { getImageUrl } from '../utils/image';
import { ChatBubbleLeftEllipsisIcon, ArrowLeftIcon, UserCircleIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

export default function MessageList() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await messageAPI.getConversations();
      setConversations(res.data.conversations || []);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="返回仪表盘"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-brand-600" />
            消息
          </h1>
        </div>
      </div>

      {/* 会话列表 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && <ErrorAlert message={error} />}

        {conversations.length === 0 ? (
          <EmptyState title="暂无消息" description="快去联系企业或求职者吧" />
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <button
                key={`${conv.partnerId}_${conv.jobId || ''}`}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (conv.jobId) params.set('jobId', conv.jobId);
                  if (conv.partner?.name) params.set('name', conv.partner.name);
                  if (conv.jobTitle) params.set('jobTitle', conv.jobTitle);
                  const qs = params.toString();
                  const url = qs ? `/messages/${conv.partnerId}?${qs}` : `/messages/${conv.partnerId}`;
                  navigate(url);
                }}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {getImageUrl(conv.partnerAvatar || conv.partner.avatar) ? (
                      <img
                        src={getImageUrl(conv.partnerAvatar || conv.partner.avatar)}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getImageUrl(conv.partnerAvatar || conv.partner.avatar) ? 'hidden' : ''}`}>
                      {conv.partner.role === 'ENTERPRISE' || conv.partner.role === 'HR' ? (
                        <BuildingOffice2Icon className="w-6 h-6 text-brand-500" />
                      ) : (
                        <UserCircleIcon className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {conv.partner.name || conv.partner.email}
                        </h3>
                        {conv.jobTitle && (
                          <span className="shrink-0 px-2 py-0.5 text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full font-medium truncate max-w-[160px]" title={conv.jobTitle}>
                            {conv.jobTitle}
                          </span>
                        )}
                        {conv.jobDeleted && (
                          <span className="shrink-0 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-semibold whitespace-nowrap">
                            已删除
                          </span>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
