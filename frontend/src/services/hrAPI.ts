import axios from 'axios';
import { getApiUrl } from '../utils/api';
import type { ScoringConfig, InterviewConfig } from './api';
import { setBanned } from '../utils/bannedEvent';

const API = axios.create({ baseURL: getApiUrl('') });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hrToken') || localStorage.getItem('token');
  if (token) config.headers!.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.banned) {
      setBanned(true);
    }
    return Promise.reject(error);
  }
);

export const hrAPI = {
  /** HR登录 */
  login: (email: string, password: string) =>
    API.post('/hr/login', { email, password }),

  /** HR首页 */
  getDashboard: () => API.get('/hr/dashboard'),

  /** 申请列表 */
  getApplications: (page?: number) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return API.get(`/hr/applications${queryStr}`);
  },

  /** 简历详情 */
  getResume: (applicationId: string) => API.get(`/hr/applications/${applicationId}/resume`),

  /** AI分析 */
  aiAnalyze: (applicationId: string, scoringConfig: ScoringConfig) =>
    API.post(`/hr/applications/${applicationId}/ai-analyze`, { scoringConfig }),

  /** 更新申请状态 */
  updateStatus: (applicationId: string, status: string) =>
    API.put(`/hr/applications/${applicationId}/status`, { status }),

  /** 消息 */
  getConversations: () => API.get('/hr/messages/conversations'),
  getMessages: (partnerId: string, jobId?: string) => {
    const params = new URLSearchParams({ partnerId });
    if (jobId) params.append('jobId', jobId);
    return API.get(`/hr/messages?${params}`);
  },
  sendMessage: (receiverId: string, content: string, jobId?: string) =>
    API.post('/hr/messages', { receiverId, content, jobId }),
  markAsRead: (partnerId: string, jobId?: string) => {
    const params = new URLSearchParams({ partnerId });
    if (jobId) params.append('jobId', jobId);
    return API.put(`/hr/messages/read?${params}`);
  },

  /** 个人设置 */
  updateSettings: (data: { name?: string; password?: string }) =>
    API.put('/hr/settings', data),

  /** 创建面试邀请 */
  createInterview: (applicationId: string, interviewConfig?: InterviewConfig) =>
    API.post('/enterprise/interviews', { applicationId, interviewConfig }),

  /** 获取企业面试列表 */
  getInterviews: (page?: number) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return API.get(`/enterprise/interviews${queryStr}`);
  },

  /** 获取面试报告 */
  getInterviewReport: (interviewId: string) =>
    API.get(`/enterprise/interviews/${interviewId}/report`),
};
