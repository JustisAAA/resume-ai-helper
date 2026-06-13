import axios from 'axios';
import { getApiUrl } from '../utils/api';

// 请求拦截器：自动附加 token
const API = axios.create({ baseURL: getApiUrl('') });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers!.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  jobId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name?: string;
    avatar?: string;
  };
}

export interface Conversation {
  partnerId: string;
  partner: {
    id: string;
    name?: string;
    avatar?: string;
    role: string;
  };
  lastMessage: Message;
  unreadCount: number;
  jobId?: string | null;
  jobTitle?: string | null;
  jobDeleted?: boolean;
  partnerAvatar?: string;
}

export const messageAPI = {
  // 获取会话列表（后端已按 partnerId + jobId 分组）
  getConversations: () => API.get<{ conversations: Conversation[] }>('/messages/conversations'),

  // 获取与某用户某职位的消息列表
  getMessages: (partnerId: string, jobId?: string, after?: string) => {
    const params = new URLSearchParams({ partnerId });
    if (jobId) params.append('jobId', jobId);
    if (after) params.append('after', after);
    return API.get<{ messages: Message[] }>(`/messages?${params.toString()}`);
  },

  // 发送消息（带jobId）
  sendMessage: (receiverId: string, content: string, jobId?: string) =>
    API.post<{ message: string; data: Message }>('/messages', { receiverId, content, jobId }),

  // 获取未读消息数
  getUnreadCount: () => API.get<{ count: number }>('/messages/unread-count'),

  // 标记消息已读（带jobId）
  markAsRead: (partnerId: string, jobId?: string) => {
    const params = new URLSearchParams({ partnerId });
    if (jobId) params.append('jobId', jobId);
    return API.put<{ message: string }>(`/messages/read?${params.toString()}`);
  },
};
