import axios from 'axios';
import { getApiUrl } from '../utils/api';

const API = axios.create({ baseURL: getApiUrl('') });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers!.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Report {
  id: string;
  targetId: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  handledAt?: string;
  reporter: {
    id: string;
    name?: string;
    email: string;
  };
  target: {
    id: string;
    name?: string;
    email: string;
  };
}

export const reportAPI = {
  // 提交举报
  submit: (targetId: string, reason: string, description?: string) =>
    API.post<{ message: string; report: Report }>('/reports', { targetId, reason, description }),

  // 获取举报列表（管理员）
  getList: (status?: string, page?: number) =>
    API.get<{ reports: Report[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/reports${(() => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (page) params.set('page', String(page));
      return params.toString() ? `?${params.toString()}` : '';
    })()}`),

  // 通过举报（管理员）
  approve: (id: string) =>
    API.put<{ message: string; report: Report }>(`/reports/${id}/approve`),

  // 驳回举报（管理员）
  reject: (id: string) =>
    API.put<{ message: string; report: Report }>(`/reports/${id}/reject`),
};
