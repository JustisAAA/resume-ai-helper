import { useState } from 'react';
import { Message } from '../services/messageAPI';
import { getImageUrl } from '../utils/image';
import { BuildingOffice2Icon, UserCircleIcon } from '@heroicons/react/24/outline';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  /** 对方的头像URL（优先使用，适用于企业logo等不在User.avatar中的情况） */
  partnerAvatar?: string;
}

export default function MessageBubble({ message, isOwn, partnerAvatar }: MessageBubbleProps) {
  const [imgError, setImgError] = useState(false);
  
  const time = new Date(message.createdAt).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const avatarUrl = getImageUrl(partnerAvatar || message.sender.avatar);
  const isEnterprise = (message.sender as any)?.role === 'ENTERPRISE';

  const AvatarPlaceholder = () => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${!isOwn ? 'mr-3' : 'ml-3'} mt-1`}>
      {isEnterprise ? (
        <BuildingOffice2Icon className="w-4 h-4 text-indigo-500" />
      ) : (
        <UserCircleIcon className="w-4 h-4 text-gray-500" />
      )}
    </div>
  );

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwn && (
        avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full mr-3 mt-1 object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarPlaceholder />
        )
      )}
      <div className={`max-w-[70%] ${isOwn ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'} rounded-2xl px-4 py-3`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>{time}</p>
      </div>
      {isOwn && (
        avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full ml-3 mt-1 object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarPlaceholder />
        )
      )}
    </div>
  );
}
