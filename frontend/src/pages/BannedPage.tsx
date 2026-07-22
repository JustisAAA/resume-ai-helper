import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setBanned, subscribeBanned, isBanned } from '../utils/bannedEvent';

export default function BannedPage() {
  const navigate = useNavigate();
  const [banned, setBannedState] = useState(true);

  useEffect(() => {
    // 同步初始状态
    setBannedState(isBanned());
    // 订阅变化
    return subscribeBanned(() => setBannedState(isBanned()));
  }, []);

  const handleExit = () => {
    setBanned(false);
    navigate('/login');
  };

  if (!banned) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          此账号已封禁
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          您的账号已被管理员封禁，如需申诉请联系平台客服
        </p>
        <button
          onClick={handleExit}
          className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl transition-all shadow-sm"
        >
          返回登录
        </button>
      </div>
    </div>
  );
}
