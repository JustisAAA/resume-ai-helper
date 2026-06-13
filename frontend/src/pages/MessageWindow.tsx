import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { messageAPI } from '../services/messageAPI';
import { getApiBaseUrl } from '../utils/api';
import { getImageUrl } from '../utils/image';
import { useToast } from '../components/Toast';
import MessageBubble from '../components/MessageBubble';
import ReportModal from '../components/ReportModal';
import { PaperAirplaneIcon, ArrowLeftIcon, FlagIcon, BuildingOffice2Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';

const API_BASE = getApiBaseUrl();

export default function MessageWindow() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId') || undefined;
  const partnerNameHint = searchParams.get('name') || undefined;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [partner, setPartner] = useState<any>(
    partnerNameHint ? { id: partnerId, name: partnerNameHint, avatar: null, role: 'HR' } : null
  );
  const [partnerCredit, setPartnerCredit] = useState<number | null>(null);
  const [jobTitle, setJobTitle] = useState<string>(searchParams.get('jobTitle') || '');
  const [showReport, setShowReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 从会话列表加载完整partner信息（含企业logo）
  const loadPartnerInfo = async () => {
    try {
      const res = await messageAPI.getConversations();
      const convs = res.data.conversations || [];
      const match = convs.find((c: any) => c.partnerId === partnerId && (c.jobId || null) === (jobId || null));
      if (match) {
        setPartner({
          id: partnerId,
          name: match.partner.name || '',
          avatar: (match as any).partnerAvatar || match.partner.avatar,
          role: match.partner.role,
        });
        if (match.jobTitle) {
          setJobTitle(match.jobTitle);
        }
        // 获取对方信用分
        try {
          const token = localStorage.getItem('token');
          const cr = await fetch(`${API_BASE}/api/users/${partnerId}/credit`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (cr.ok) {
            const cd = await cr.json();
            setPartnerCredit(cd.creditScore);
          }
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
  };

  const loadMessages = async (isPolling = false) => {
    try {
      const res = await messageAPI.getMessages(partnerId!, jobId, isPolling ? messages[messages.length - 1]?.id : undefined);
      const newMessages = res.data.messages;
      setMessages(newMessages);

      // 标记已读
      await messageAPI.markAsRead(partnerId!, jobId);

      // 获取对方信息（仅作为fallback，优先使用loadPartnerInfo的结果）
      if (newMessages.length > 0 && !partner) {
        const msg = newMessages[0];
        const p = msg.senderId === partnerId ? msg.sender : { id: msg.receiverId, name: '', avatar: '' };
        // 如果消息里的name为空，暂时不设置，等loadPartnerInfo来设置
        if (p.name) {
          setPartner(p);
        }
      }
    } catch (err: any) {
      console.error('加载消息失败:', err);
    }
  };

  useEffect(() => {
    if (!partnerId) return;
    loadMessages();
    loadPartnerInfo();

    // 轮询：每3秒刷新一次
    const timer = setInterval(() => loadMessages(true), 3000);
    return () => clearInterval(timer);
  }, [partnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      await messageAPI.sendMessage(partnerId!, input, jobId);
      setInput('');
      loadMessages();
    } catch (err: any) {
      showToast(err.response?.data?.error || '发送失败', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!partnerId) {
    return <div className="flex items-center justify-center min-h-screen">无效的会话</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* 顶部：返回按钮 + 对方信息 + 举报按钮 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/messages')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        {partner && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getImageUrl(partner.avatar) ? (
              <img
                src={getImageUrl(partner.avatar)}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${getImageUrl(partner.avatar) ? 'hidden' : ''}`}>
              {partner.role === 'ENTERPRISE' || partner.role === 'HR' ? (
                <BuildingOffice2Icon className="w-5 h-5 text-brand-500" />
              ) : (
                <UserCircleIcon className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white truncate flex items-center gap-2">
                {partner.name || partner.email}
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
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    咨询岗位：{jobTitle}
                  </span>
                ) : partner.role === 'ENTERPRISE' || partner.role === 'HR' ? '企业' : '求职者'}
              </p>
            </div>
          </div>
        )}
        {/* 举报按钮 */}
        <button
          onClick={() => setShowReport(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
          title="举报此人"
        >
          <FlagIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <EmptyState size="sm" title="暂无消息" description="发送一条消息开始聊天吧" />
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId !== partnerId} partnerAvatar={partner?.avatar} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-3 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 举报弹窗 */}
      {showReport && partner && (
        <ReportModal targetId={partner.id} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
