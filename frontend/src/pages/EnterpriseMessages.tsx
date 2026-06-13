import { useState, useEffect, useRef } from 'react';
import ThemeToggle from '../components/ThemeToggle'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { messageAPI, Conversation, Message } from '../services/messageAPI';
import { getApiBaseUrl } from '../utils/api';
import { getImageUrl } from '../utils/image';
import Loading, { ButtonSpinner } from '../components/Loading';
import { useToast } from '../components/Toast';
import EmptyState from '../components/EmptyState';
import ErrorAlert from '../components/ErrorAlert';
import { ChatBubbleLeftEllipsisIcon, ArrowLeftIcon, PaperAirplaneIcon, UserCircleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function EnterpriseMessages() {
  return <EnterpriseMessageRouter />;
}

/** 外层路由：根据URL参数决定显示列表还是对话 */
function EnterpriseMessageRouter() {
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams] = useSearchParams();
  if (userId) {
    const nameHint = searchParams.get('name') || undefined;
    const jobId = searchParams.get('jobId') || undefined;
    const jobTitle = searchParams.get('jobTitle') || undefined;
    return <EnterpriseMessageWindow partnerId={userId} nameHint={nameHint} jobId={jobId} jobTitle={jobTitle} />;
  }
  return <EnterpriseConversationList />;
}

/** 会话列表页面 */
function EnterpriseConversationList() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hrAccounts, setHrAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [convRes, hrRes] = await Promise.all([
        messageAPI.getConversations(),
        fetch(`${getApiBaseUrl()}/api/hr/by-enterprise`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.ok ? r.json() : { hrs: [] })
      ]);
      setConversations(convRes.data.conversations || []);
      setHrAccounts(hrRes.hrs || []);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * oneDay) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  const truncateText = (text: string, maxLen: number) => {
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="sm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/enterprise/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              aria-label="返回企业控制台"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-purple-600" />
              HR消息
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="刷新"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
<ThemeToggle />

          </div>
        </div>
      </nav>

      {/* 内容区 */}
      <div className="max-w-3xl mx-auto py-4 px-4">
        {error && <ErrorAlert message={error} />}

        {/* ========== HR 子账号列表 ========== */}
        {hrAccounts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              HR 子账号
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hrAccounts.map((hr: any) => (
                <button
                  key={hr.id}
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (hr.job?.id) params.set('jobId', hr.job.id);
                    params.set('name', hr.name);
                    if (hr.job?.title) params.set('jobTitle', hr.job.title);
                    navigate(`/enterprise/messages/${hr.userId}?${params.toString()}`);
                  }}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-sm transition-all text-left"
                >
                  {getImageUrl(hr.user?.avatar) ? (
                    <img src={getImageUrl(hr.user.avatar)} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{hr.name}</span>
                      {!hr.isActive && (
                        <span className="shrink-0 px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">停用</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {hr.job?.title || '未分配岗位'} · {hr.user?.email}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========== 会话列表 ========== */}
        {conversations.length > 0 && (
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            最近消息
          </h3>
        )}

        {conversations.length === 0 && hrAccounts.length === 0 ? (
          <EmptyState title="暂无消息" description="当有新的消息时会在这里显示" />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {conversations.map((conv) => (
              <button
                key={`${conv.partnerId}_${conv.jobId || ''}`}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (conv.jobId) params.set('jobId', conv.jobId);
                  if (conv.partner?.name) params.set('name', conv.partner.name);
                  if (conv.jobTitle) params.set('jobTitle', conv.jobTitle);
                  const qs = params.toString();
                  const url = qs ? `/enterprise/messages/${conv.partnerId}?${qs}` : `/enterprise/messages/${conv.partnerId}`;
                  navigate(url);
                }}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-left"
              >
                {/* 头像 */}
                <div className="relative shrink-0">
                  {conv.partner.avatar ? (
                    <img
                      src={getImageUrl(conv.partner.avatar)}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        const fallback = parent?.querySelector('.avatar-fallback');
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center avatar-fallback" style={{ display: conv.partner.avatar ? 'none' : 'flex' }}>
                    <UserCircleIcon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                    </span>
                  )}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {conv.partner.name || '求职者'}
                      </span>
                      {conv.jobTitle && (
                        <span className="shrink-0 px-2 py-0.5 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full font-medium truncate max-w-[160px]" title={conv.jobTitle}>
                          {conv.jobTitle}
                        </span>
                      )}
                      {conv.jobDeleted && (
                        <span className="shrink-0 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-semibold whitespace-nowrap">
                          已删除
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                      {formatTime(conv.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                    {truncateText(conv.lastMessage.content, 40)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 聊天窗口页面 */
function EnterpriseMessageWindow({ partnerId, nameHint, jobId: _propJobId, jobTitle: _propJobTitle }: { partnerId: string; nameHint?: string; jobId?: string; jobTitle?: string }) {
  const [searchParams] = useSearchParams();
  const jobId = _propJobId || searchParams.get('jobId') || undefined;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<{ id: string; name?: string; avatar?: string; role?: string } | null>(
    nameHint ? { id: partnerId, name: nameHint } : null
  );
  const [partnerCredit, setPartnerCredit] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState<string>(_propJobTitle || searchParams.get('jobTitle') || '');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [selfAvatar, setSelfAvatar] = useState('');

  // 加载企业logo作为自己的头像
  useEffect(() => {
    const loadSelfAvatar = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${getApiBaseUrl()}/api/enterprise/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.enterprise?.logo) {
          setSelfAvatar(getImageUrl(data.enterprise.logo));
        }
      } catch { /* ignore */ }
    };
    loadSelfAvatar();
  }, []);

  useEffect(() => {
    loadMessages();
    // 定时轮询新消息
    pollRef.current = setInterval(loadMessages, 3000);
    // 从会话列表获取完整partner信息和职位信息
    loadPartnerInfo();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [partnerId]);

  const loadPartnerInfo = async () => {
    try {
      const res = await messageAPI.getConversations();
      const convs = res.data.conversations || [];
      const match = convs.find((c: Conversation) =>
        c.partnerId === partnerId && (c.jobId || null) === (jobId || null)
      );
      if (match) {
        setPartner({
          id: partnerId,
          name: match.partner.name || undefined,
          avatar: match.partner.avatar || undefined,
        });
        if (match.jobTitle) {
          setJobTitle(match.jobTitle);
        }
        // 获取求职者信用分
        try {
          const token = localStorage.getItem('token');
          const cr = await fetch(`${getApiBaseUrl()}/api/users/${partnerId}/credit`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (cr.ok) {
            const cd = await cr.json();
            setPartnerCredit(cd.creditScore);
          }
        } catch { /* ignore */ }
      }
    } catch {
      // 忽略，不影响主要功能
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const res = await messageAPI.getMessages(partnerId, jobId);
      const msgs = res.data.messages || [];
      setMessages(msgs);
      // 从第一条消息获取partner信息
      if (msgs.length > 0 && !partner) {
        const userId = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')!).id
          : '';
        const otherMsg = msgs.find((m: Message) => m.senderId !== userId) || msgs[0];
        setPartner({
          id: partnerId,
          name: otherMsg.sender.name,
          avatar: otherMsg.sender.avatar,
        });
      }
      if (msgs.length > 0) {
        await messageAPI.markAsRead(partnerId, jobId).catch(() => {});
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || '加载消息失败');
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    try {
      setSending(true);
      const res = await messageAPI.sendMessage(partnerId, text, jobId);
      setMessages(prev => [...prev, res.data.data]);
      setInputText('');
      scrollToBottom();
    } catch (err: any) {
      showToast(err.response?.data?.error || '发送失败', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="sm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* 顶部栏 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/enterprise/messages')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        {partner?.avatar && !avatarFailed ? (
          <img
            src={getImageUrl(partner.avatar)}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <UserCircleIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <div>
          <h2 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            {partner?.name || '求职者'}
            {partnerCredit !== null && (
              <span className={`shrink-0 px-1.5 py-0.5 text-xs rounded-full font-medium ${
                partnerCredit >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                partnerCredit >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {partnerCredit}分
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {jobTitle ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                咨询岗位：{jobTitle}
              </span>
            ) : (
              '在线聊天'
            )}
          </p>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && <ErrorAlert message={error} />}
        {messages.length === 0 ? (
          <EmptyState size="sm" title="暂无消息" description="发送第一条消息开始沟通吧" />
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const userId = localStorage.getItem('user')
                ? JSON.parse(localStorage.getItem('user')!).id
                : '';
              const isOwn = msg.senderId === userId;
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  {/* 对方消息头像（左侧） */}
                  {!isOwn && (
                    <div className="shrink-0 mr-2">
                      {msg.sender.avatar ? (
                        <img src={getImageUrl(msg.sender.avatar)} alt="" className="w-8 h-8 rounded-full" onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          const parent = img.parentElement;
                          img.style.display = 'none';
                          const fb = parent?.querySelector('.msg-avatar-fb');
                          if (fb) (fb as HTMLElement).style.display = 'flex';
                        }} />
                      ) : null}
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center msg-avatar-fb" style={{ display: msg.sender.avatar ? 'none' : 'flex' }}>
                        <UserCircleIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  )}
                  <div className={`max-w-[70%]`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isOwn
                          ? 'bg-purple-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {/* 自己消息头像（右侧） */}
                  {isOwn && (
                    <div className="shrink-0 ml-2">
                      {selfAvatar ? (
                        <img src={selfAvatar} alt="" className="w-8 h-8 rounded-full object-cover" onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const fb = (e.target as HTMLImageElement).parentElement?.querySelector('.self-avatar-fb');
                          if (fb) (fb as HTMLElement).style.display = 'flex';
                        }} />
                      ) : null}
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center self-avatar-fb" style={{ display: selfAvatar ? 'none' : 'flex' }}>
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full transition-colors shrink-0"
          >
            {sending ? (
              <ButtonSpinner />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
