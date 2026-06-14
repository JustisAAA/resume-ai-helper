import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hrAPI } from '../services/hrAPI';
import { getImageUrl } from '../utils/image';
import { useToast } from '../components/Toast';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import ThemeToggle from '../components/ThemeToggle';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function HRMessages() {
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get('partnerId');
  const jobId = searchParams.get('jobId') || undefined;

  if (partnerId) return <HRChatWindow partnerId={partnerId} jobId={jobId} />;
  return <HRConversationList />;
}

function HRConversationList() {
  const navigate = useNavigate();
  const [convs, setConvs] = useState<any[]>([]);
  const [enterpriseOwner, setEnterpriseOwner] = useState<{ userId: string; name: string; logo?: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 并行加载：会话列表 + HR dashboard（获取企业主信息）
      const [convRes, dashRes] = await Promise.all([
        hrAPI.getConversations(),
        hrAPI.getDashboard()
      ]);

      const list = convRes.data.conversations || [];

      // 从 dashboard 获取企业主信息
      const dash = dashRes.data;
      if (dash.enterprise?.ownerId) {
        const ownerId = dash.enterprise.ownerId;
        setEnterpriseOwner({
          userId: ownerId,
          name: dash.enterprise.name || '企业组长',
          logo: dash.enterprise.logo || undefined,
        });
        // 过滤掉企业主（已经固定显示）
        const filtered = list.filter((c: any) => c.partnerId !== ownerId);
        setConvs(filtered);
      } else {
        setConvs(list);
      }
    } catch {
      // fallback: 单独加载会话
      try {
        const r = await hrAPI.getConversations();
        setConvs(r.data.conversations || []);
      } catch {}
    }
    setReady(true);
  };

  if (!ready) return <Loading size="sm" />;

  const navigateToChat = (partnerId: string, name: string, jobId?: string, jobTitle?: string) => {
    const params = new URLSearchParams({ partnerId, name });
    if (jobId) params.set('jobId', jobId);
    if (jobTitle) params.set('jobTitle', jobTitle);
    navigate(`/hr/messages?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/hr/dashboard')} className="text-gray-500 hover:text-gray-700">← 返回</button>
            <span className="font-bold text-gray-900 dark:text-white">消息</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>
      <div className="max-w-3xl mx-auto py-4 px-4">
        {/* ====== 固定的企业主入口 ====== */}
        {enterpriseOwner && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">企业组长</h3>
            <button
              onClick={() => navigateToChat(enterpriseOwner!.userId, enterpriseOwner!.name)}
              className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getImageUrl(enterpriseOwner.logo) ? (
                  <img src={getImageUrl(enterpriseOwner.logo)} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <BuildingOffice2Icon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{enterpriseOwner.name}</span>
                    <span className="shrink-0 px-2 py-0.5 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">企业组长</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">内部工作沟通</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
            </button>
          </div>
        )}

        {/* ====== 求职者会话列表 ====== */}
        {convs.length > 0 && (
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 mt-6">求职者</h3>
        )}
        {convs.length === 0 ? (
          <EmptyState title="暂无求职者消息" description="当求职者联系你时会在这里显示" />
        ) : (
          <div className="space-y-3">
            {convs.map(c => (
              <button key={`${c.partnerId}_${c.jobId || ''}`}
                onClick={() => {
                  const params = new URLSearchParams({ partnerId: c.partnerId });
                  if (c.jobId) params.set('jobId', c.jobId);
                  if (c.partner?.name) params.set('name', c.partner.name);
                  if (c.jobTitle) params.set('jobTitle', c.jobTitle);
                  navigate(`/hr/messages?${params.toString()}`);
                }}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getImageUrl(c.partnerAvatar || c.partner.avatar) ? (
                    <img src={getImageUrl(c.partnerAvatar || c.partner.avatar)} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">
                      {c.partner.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white truncate">{c.partner.name || '求职者'}</span>
                      {c.jobTitle && (
                        <span className="shrink-0 px-2 py-0.5 text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full truncate max-w-[160px]">
                          {c.jobTitle}
                        </span>
                      )}
                      {c.jobDeleted && (
                        <span className="shrink-0 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-semibold whitespace-nowrap">
                          已删除
                        </span>
                      )}
                      {c.unreadCount > 0 && (
                        <span className="shrink-0 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{c.unreadCount}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{c.lastMessage.content}</p>
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

function HRChatWindow({ partnerId, jobId }: { partnerId: string; jobId?: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const nameHint = searchParams.get('name') || '';
  const jobTitleHint = searchParams.get('jobTitle') || '';
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [partner, setPartner] = useState<any>(
    nameHint ? { name: nameHint } : null
  );
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadMessages = () => {
    hrAPI.getMessages(partnerId, jobId).then(r => {
      const msgs = r.data.messages || [];
      setMessages(msgs);
      if (msgs.length > 0) {
        const p = msgs[0].senderId === partnerId ? msgs[0].sender : { id: msgs[0].receiverId, name: '求职者' };
        setPartner(p);
      }
      hrAPI.markAsRead(partnerId, jobId).catch(() => {});
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [partnerId, jobId]);

  const send = async () => {
    if (!input.trim()) return;
    try {
      const r = await hrAPI.sendMessage(partnerId, input, jobId);
      setMessages(prev => [...prev, r.data.data]);
      setInput('');
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e: any) { showToast(e.response?.data?.error || '发送失败', 'error'); }
  };

  if (loading && !nameHint) return <Loading size="sm" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/hr/messages')} className="text-gray-500 hover:text-gray-700">←</button>
        {getImageUrl(partner?.avatar) ? (
          <img src={getImageUrl(partner.avatar)} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">{partner?.name?.charAt(0) || '?'}</div>
        )}
        <span className="font-semibold text-gray-900 dark:text-white">{partner?.name || '求职者'}</span>
        {jobTitleHint && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full">
            {jobTitleHint}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === partnerId ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.senderId === partnerId ? 'bg-white dark:bg-gray-800 border text-gray-900 dark:text-white' : 'bg-brand-500 text-white'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-2 shrink-0">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="输入消息..." />
        <button onClick={send} className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600">发送</button>
      </div>
    </div>
  );
}
