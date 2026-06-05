/**
 * API 服务层 - 集中管理所有后端接口调用
 * 
 * 使用方式：
 * import { authAPI, resumeAPI, interviewAPI, toolsAPI } from '../services/api';
 * 
 * // 示例：登录
 * const data = await authAPI.login({ email, password });
 * 
 * // 示例：获取简历列表
 * const resumes = await resumeAPI.list(token);
 */

import axios from 'axios';
import { getApiUrl } from '../utils/api';

// ==================== 类型定义 ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  filename: string;
  originalName: string;
  status: 'DRAFT' | 'ANALYZED' | 'ARCHIVED';
  score?: number;
  uploader?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  title: string;
  position?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'pending' | 'active' | 'completed';
  score?: number | null;
  currentQuestion?: string;
  questions?: string[];
  startedAt?: string;
  answers?: any[];
  messages?: Array<{
    role: 'assistant' | 'user';
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  duration?: number | null;
  resume?: { title: string };
  feedback?: any;
}

export interface ToolRequest {
  resumeId?: string;
  resume?: string;
  position?: string;
  [key: string]: any;
}

// ==================== Auth API ====================

export const authAPI = {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await axios.post(getApiUrl('/auth/login'), data);
    return res.data;
  },

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await axios.post(getApiUrl('/auth/register'), data);
    return res.data;
  },

  /**
   * 获取当前用户信息
   */
  async getProfile(token: string): Promise<{ user: UserProfile }> {
    const res = await axios.get(getApiUrl('/auth/me'), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 更新用户信息（姓名）
   */
  async updateProfile(token: string, data: { name: string }): Promise<{ user: UserProfile }> {
    const res = await axios.put(getApiUrl('/auth/me'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 修改密码
   */
  async changePassword(token: string, data: { oldPassword: string; newPassword: string }): Promise<void> {
    await axios.put(getApiUrl('/auth/me/password'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  /**
   * 上传头像
   */
  async uploadAvatar(token: string, formData: FormData): Promise<{ avatar: string }> {
    const res = await axios.post(getApiUrl('/auth/me/avatar'), formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};

// ==================== Resume API ====================

export const resumeAPI = {
  /**
   * 获取简历列表
   */
  async list(token: string): Promise<Resume[]> {
    const res = await axios.get(getApiUrl('/resumes'), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 上传简历
   */
  async upload(token: string, formData: FormData): Promise<Resume> {
    const res = await axios.post(getApiUrl('/resumes/upload'), formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  /**
   * 获取简历详情
   */
  async getDetail(token: string, id: string): Promise<Resume> {
    const res = await axios.get(getApiUrl(`/resumes/${id}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 删除简历
   */
  async delete(token: string, id: string): Promise<void> {
    await axios.delete(getApiUrl(`/resumes/${id}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  /**
   * 分析简历
   */
  async analyze(token: string, id: string): Promise<Resume> {
    const res = await axios.post(getApiUrl(`/resumes/${id}/analyze`), {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 评分简历
   */
  async score(token: string, id: string): Promise<Resume> {
    const res = await axios.post(getApiUrl(`/resumes/${id}/score`), {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 应用模板到简历
   */
  async applyTemplate(token: string, resumeId: string, templateId: string): Promise<unknown> {
    const res = await axios.post(getApiUrl(`/resumes/${resumeId}/apply-template`), 
      { templateId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  }
};

// ==================== Interview API ====================

export const interviewAPI = {
  /**
   * 获取面试列表
   */
  async list(token: string): Promise<Interview[]> {
    const res = await axios.get(getApiUrl('/interviews'), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 创建面试
   */
  async create(token: string, data: { 
    resumeId: string; 
    title?: string;
    position?: string; 
    difficulty?: string;
    interviewType?: string;
  }): Promise<Interview> {
    const res = await axios.post(getApiUrl('/interviews'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 获取面试详情
   */
  async getDetail(token: string, id: string): Promise<Interview> {
    const res = await axios.get(getApiUrl(`/interviews/${id}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 开始面试（获取第一个问题）
   */
  async start(token: string, id: string): Promise<{ firstQuestion: string; interview: Interview }> {
    const res = await axios.post(getApiUrl(`/interviews/${id}/start`), {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 提交回答
   */
  async answer(token: string, id: string, data: { answer: string; timeSpent?: number }): Promise<{
    nextQuestion?: string;
    isComplete?: boolean;
    interview?: Interview;
    evaluation?: {
      score: number;
      comment: string;
      highlights: string[];
      improvements: string[];
    };
  }> {
    const res = await axios.post(getApiUrl(`/interviews/${id}/answer`), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 退出面试
   */
  async exit(token: string, id: string): Promise<void> {
    await axios.post(getApiUrl(`/interviews/${id}/exit`), {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  /**
   * 生成面试报告
   */
  async generateReport(token: string, id: string): Promise<unknown> {
    const res = await axios.post(getApiUrl(`/interviews/${id}/report`), {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 删除面试
   */
  async delete(token: string, id: string): Promise<void> {
    await axios.delete(getApiUrl(`/interviews/${id}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// ==================== Tools API ====================

export const toolsAPI = {
  /**
   * 求职攻略 - 岗位匹配分析
   */
  async match(token: string, data: ToolRequest): Promise<unknown> {
    const res = await axios.post(getApiUrl('/tools/match'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 求职攻略 - 面试问题生成
   */
  async questions(token: string, data: ToolRequest): Promise<unknown> {
    const res = await axios.post(getApiUrl('/tools/questions'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 求职攻略 - 面试辅导
   */
  async guide(token: string, data: ToolRequest): Promise<unknown> {
    const res = await axios.post(getApiUrl('/tools/guide'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 文件解析 - 上传文件并返回解析后的文本
   */
  async parseFile(token: string, file: File): Promise<{ text: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(getApiUrl('/tools/parse-file'), formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      timeout: 60000
    });
    return res.data;
  },

  /**
   * 求职攻略 - 职业建议
   */
  async optimize(token: string, data: ToolRequest): Promise<unknown> {
    const res = await axios.post(getApiUrl('/tools/optimize'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 求职攻略 - 岗位趋势预测
   */
  async trend(token: string, data: { targetRole: string }): Promise<unknown> {
    const res = await axios.post(getApiUrl('/tools/trend'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};

// ==================== 默认导出（兼容旧代码） ====================

export default {
  auth: authAPI,
  resume: resumeAPI,
  interview: interviewAPI,
  tools: toolsAPI
};

// ==================== Admin API ====================

export interface AdminStats {
  userCount: number;
  resumeCount: number;
  interviewCount: number;
  reportCount: number;
  newUsersToday: number;
  newResumesToday: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED';
  createdAt: string;
  _count?: {
    resumes: number;
    interviews: number;
    reports: number;
  };
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export const adminAPI = {
  /**
   * 获取系统统计数据
   */
  async getStats(token: string): Promise<AdminStats> {
    const res = await import('axios').then(m => m.default.get(getApiUrl('/admin/stats'), {
      headers: { Authorization: `Bearer ${token}` }
    }));
    return res.data;
  },

  /**
   * 获取用户列表
   */
  async getUsers(token: string, params: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<AdminUserListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.search) query.set('search', params.search);
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    const res = await import('axios').then(m => m.default.get(getApiUrl(`/admin/users?${query.toString()}`), {
      headers: { Authorization: `Bearer ${token}` }
    }));
    return res.data;
  },

  /**
   * 更新用户（状态）
   */
  async updateUser(token: string, userId: string, data: {
    status?: 'ACTIVE' | 'BANNED';
  }): Promise<{ user: AdminUser }> {
    const res = await import('axios').then(m => m.default.put(getApiUrl(`/admin/users/${userId}`), data, {
      headers: { Authorization: `Bearer ${token}` }
    }));
    return res.data;
  },

  /**
   * 删除用户
   */
  async deleteUser(token: string, userId: string): Promise<void> {
    await import('axios').then(m => m.default.delete(getApiUrl(`/admin/users/${userId}`), {
      headers: { Authorization: `Bearer ${token}` }
    }));
  }
};

// ==================== Enterprise API ====================

export interface EnterpriseRegisterRequest {
  email: string;
  password: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface EnterpriseLoginRequest {
  email: string;
  password: string;
}

export interface EnterpriseAuthResponse {
  token: string;
  enterprise: {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    industry?: string;
    size?: string;
    location?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface Enterprise {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const enterpriseAPI = {
  /**
   * 企业注册
   */
  async register(data: EnterpriseRegisterRequest): Promise<EnterpriseAuthResponse> {
    const res = await axios.post(getApiUrl('/enterprise/register'), data);
    return res.data;
  },

  /**
   * 企业登录
   */
  async login(data: EnterpriseLoginRequest): Promise<EnterpriseAuthResponse> {
    const res = await axios.post(getApiUrl('/enterprise/login'), data);
    return res.data;
  },

  /**
   * 获取企业资料
   */
  async getProfile(token: string): Promise<{ enterprise: Enterprise }> {
    const res = await axios.get(getApiUrl('/enterprise/profile'), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 更新企业资料
   */
  async updateProfile(token: string, data: Partial<EnterpriseRegisterRequest>): Promise<{ enterprise: Enterprise }> {
    const res = await axios.put(getApiUrl('/enterprise/profile'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 获取职位的申请列表
   */
  async getApplications(jobId: string): Promise<{ applications: any[] }> {
    const res = await axios.get(getApiUrl(`/jobs/${jobId}/applications`));
    return res.data;
  },

  /**
   * 更新申请状态
   */
  async updateStatus(applicationId: string, status: string): Promise<{ application: any }> {
    const res = await axios.patch(getApiUrl(`/applications/${applicationId}/status`), { status });
    return res.data;
  },

  /**
   * 获取申请简历详情
   */
  async getResume(applicationId: string): Promise<{ resume: any }> {
    const res = await axios.get(getApiUrl(`/applications/${applicationId}/resume`));
    return res.data;
  },

  /**
   * 获取企业面试列表
   */
  async getInterviews(): Promise<{ interviews: any[] }> {
    const res = await axios.get(getApiUrl('/enterprise/interviews'));
    return res.data;
  },

  /**
   * 获取面试报告
   */
  async getReport(interviewId: string): Promise<{ report: any }> {
    const res = await axios.get(getApiUrl(`/enterprise/interviews/${interviewId}/report`));
    return res.data;
  }
};

// ==================== Job API ====================

export interface JobCreateRequest {
  title: string;
  description: string;
  requirements?: string;
  salaryRange?: string;
  location?: string;
  type?: string;
}

export interface JobUpdateRequest {
  title?: string;
  description?: string;
  requirements?: string;
  salaryRange?: string;
  location?: string;
  type?: string;
  status?: 'ACTIVE' | 'CLOSED' | 'DRAFT';
}

export interface Job {
  id: string;
  enterpriseId: string;
  title: string;
  description: string;
  requirements?: string;
  salaryRange?: string;
  location?: string;
  type?: string;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
  enterprise?: {
    id: string;
    name: string;
    logo?: string;
  };
  _count?: {
    applications: number;
  };
  applications?: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      name?: string;
      email: string;
      avatar?: string;
    };
    resume?: {
      id: string;
      title: string;
      score?: number;
    };
  }>;
}

export const jobAPI = {
  /**
   * 创建职位
   */
  async create(token: string, data: JobCreateRequest): Promise<{ job: Job }> {
    const res = await axios.post(getApiUrl('/jobs'), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 获取职位列表
   */
  async list(params?: { enterpriseId?: string; status?: string }): Promise<{ jobs: Job[] }> {
    const query = new URLSearchParams();
    if (params?.enterpriseId) query.set('enterpriseId', params.enterpriseId);
    if (params?.status) query.set('status', params.status);
    const res = await axios.get(getApiUrl(`/jobs?${query.toString()}`));
    return res.data;
  },

  /**
   * 获取职位详情
   */
  async getDetail(id: string): Promise<{ job: Job }> {
    const res = await axios.get(getApiUrl(`/jobs/${id}`));
    return res.data;
  },

  /**
   * 更新职位
   */
  async update(token: string, id: string, data: JobUpdateRequest): Promise<{ job: Job }> {
    const res = await axios.put(getApiUrl(`/jobs/${id}`), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 删除职位
   */
  async delete(token: string, id: string): Promise<void> {
    await axios.delete(getApiUrl(`/jobs/${id}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  /**
   * 更新职位状态
   */
  async updateStatus(token: string, id: string, status: 'ACTIVE' | 'CLOSED' | 'DRAFT'): Promise<{ job: Job }> {
    const res = await axios.patch(getApiUrl(`/jobs/${id}/status`), { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
