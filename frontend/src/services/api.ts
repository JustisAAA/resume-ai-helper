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

export interface InterviewAnswer {
  answer: string;
  score?: number;
  comment?: string;
  highlights?: string[];
  improvements?: string[];
}

export interface InterviewQuestionReview {
  questionNum: number;
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

export interface InterviewFeedback {
  overallScore?: number;
  passProbability?: number;
  dimensionScores?: Record<string, number>;
  questionReviews?: InterviewQuestionReview[];
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: 'HIRE' | 'REJECT';
  summary?: string;
  enterpriseEvaluation?: InterviewFeedback;
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
  answers?: InterviewAnswer[];
  messages?: Array<{
    role: 'assistant' | 'user';
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  duration?: number | null;
  resume?: {
    id: string;
    title: string;
    score?: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  feedback?: InterviewFeedback;
}

export interface ToolRequest {
  resumeId?: string;
  resume?: string;
  position?: string;
  keywords?: string;
  jd?: string;
  targetRole?: string;
  question?: string;
  count?: number;
  mode?: string;
  scene?: string;
}

export interface AIAnalysisSummary {
  totalScore: number;
  passed: boolean;
  verdict: string;
  scoringPoints: { name: string; score: number; comment: string }[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
  scoringConfig: ScoringConfig;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'INTERVIEWED';
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  aiAnalysis?: AIAnalysisSummary;
  resume?: ResumeDetail;
  job: {
    id: string;
    title: string;
  };
}

export interface ResumeDetail {
  id: string;
  title: string;
  fileName?: string;
  fileUrl?: string;
  content?: string;
  score?: number;
  skills?: string[];
  experience?: string;
  education?: string;
  summary?: string;
  aiAnalysis?: AIAnalysisSummary;
}

export interface ScoringConfig {
  criteria: Array<{
    name: string;
    weight: number;
    description?: string;
  }>;
  maxScore?: number;
}

export interface AIAnalysis {
  overallScore: number;
  criteriaScores: Array<{
    criterion: string;
    score: number;
    feedback: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  summary: string;
}

export interface InterviewConfig {
  difficulty?: string;
  questionCount?: number;
  duration?: number;
  position?: string;
  keywords?: string[];
  abilities?: string[];
  questions?: string[];
  perQuestionTimeLimit?: number;
}

export interface InterviewReport {
  interview: Interview;
  report: {
    overallScore: number;
    passProbability: number;
    dimensionScores: Record<string, number>;
    questionReviews: InterviewQuestionReview[];
    strengths: string[];
    weaknesses: string[];
    recommendation: 'HIRE' | 'REJECT';
    summary: string;
  };
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
   * @param type 可选，'ENTERPRISE' | 'PRACTICE' 过滤类型
   */
  async list(token: string, type?: string): Promise<{ interviews: Interview[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const params = type ? `?type=${type}` : '';
    const res = await axios.get(getApiUrl(`/interviews${params}`), {
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
   * 提交回答（SSE 流式版本）
   * 使用 fetch + ReadableStream 接收 SSE 事件
   */
  answerStream: (
    token: string,
    id: string,
    data: { answer: string; timeSpent?: number },
    callbacks: {
      onDelta: (text: string) => void;
      onDone: (result: {
        evaluation: { score: number; comment: string; highlights: string[]; improvements: string[] };
        nextQuestion: string;
        questionType?: string;
        mock?: boolean;
        interview?: Interview;
      }) => void;
      onError: (error: string) => void;
    }
  ): AbortController => {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(getApiUrl(`/interviews/${id}/answer`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `请求失败 (${response.status})`);
        }

        if (!response.body) throw new Error('不支持流式响应');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // 保留最后一个可能不完整的行
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === 'delta') {
                  callbacks.onDelta(event.content);
                } else if (event.type === 'done') {
                  callbacks.onDone({
                    evaluation: event.evaluation,
                    nextQuestion: event.nextQuestion || '',
                    questionType: event.questionType,
                    mock: event.mock,
                    interview: event.interview,
                  });
                } else if (event.type === 'error') {
                  callbacks.onError(event.message || '未知错误');
                }
              } catch { /* skip unparseable lines */ }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          callbacks.onError(err.message || '请求失败');
        }
      }
    })();

    return controller;
  },

  /**
   * 退出面试
   */
  async exit(token: string, id: string): Promise<void> {
    await axios.post(getApiUrl(`/interviews/${id}/end`), {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  /**
   * 生成面试报告 (SSE流式)
   */
  async generateReport(token: string, id: string, onProgress?: (progress: { step: string; percent: number; message: string }) => void): Promise<{ report: InterviewFeedback; interview: Interview }> {
    const response = await fetch(getApiUrl(`/interviews/${id}/report`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Process complete events (separated by \n\n)
      while (buffer.includes('\n\n')) {
        const eventEnd = buffer.indexOf('\n\n');
        const eventStr = buffer.substring(0, eventEnd);
        buffer = buffer.substring(eventEnd + 2);
        
        if (eventStr.startsWith('data: ')) {
          const dataStr = eventStr.substring(6);
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'progress' && onProgress) {
              onProgress({ step: data.step, percent: data.percent, message: data.message });
            } else if (data.type === 'complete') {
              return { report: data.report, interview: data.interview };
            } else if (data.type === 'error') {
              throw new Error(data.error || '生成报告失败');
            }
          } catch (e: unknown) {
            console.error('SSE parse error:', e);
            if (e instanceof Error) throw e;
          }
        }
      }
    }

    throw new Error('Stream ended without complete event');
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
  enterpriseCount: number;
  jobCount: number;
  applicationCount: number;
  interviewCount: number;
  reportCount: number;
  pendingReportCount: number;
  newUsersToday: number;
  newEnterprisesToday: number;
  userRoleCount: number;
  enterpriseRoleCount: number;
  adminRoleCount: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ENTERPRISE' | 'HR' | 'ADMIN';
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
    const res = await axios.get(getApiUrl('/admin/stats'), {
      headers: { Authorization: `Bearer ${token}` }
    });
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
    const res = await axios.get(getApiUrl(`/admin/users?${query.toString()}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 更新用户（状态）
   */
  async updateUser(token: string, userId: string, data: {
    status?: 'ACTIVE' | 'BANNED';
  }): Promise<{ user: AdminUser }> {
    const res = await axios.put(getApiUrl(`/admin/users/${userId}`), data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 删除用户
   */
  async deleteUser(token: string, userId: string): Promise<void> {
    await axios.delete(getApiUrl(`/admin/users/${userId}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
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
   * 获取Dashboard统计数据
   */
  async getDashboardStats(): Promise<{
    funnel: { applied: number; screened: number; interviewed: number; hired: number };
    applicationTrend: { date: string; count: number }[];
    jobPopularity: { jobId: string; title: string; count: number }[];
  }> {
    const token = localStorage.getItem('token');
    const res = await axios.get(getApiUrl('/enterprise/dashboard/stats'), {
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
  async getApplications(jobId: string, page?: number): Promise<{ applications: Application[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await axios.get(getApiUrl(`/jobs/${jobId}/applications${queryStr}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 更新申请状态
   */
  async updateStatus(applicationId: string, status: string): Promise<{ application: Application }> {
    const token = localStorage.getItem('token');
    const res = await axios.put(getApiUrl(`/applications/${applicationId}/status`), { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 获取申请简历详情
   */
  async getResume(applicationId: string): Promise<{ resume: ResumeDetail; application?: Application }> {
    const token = localStorage.getItem('token');
    const res = await axios.get(getApiUrl(`/applications/${applicationId}/resume`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * AI简历评分分析
   */
  async aiAnalyze(applicationId: string, scoringConfig: ScoringConfig): Promise<{ message: string; analysis: AIAnalysis }> {
    const token = localStorage.getItem('token');
    const res = await axios.post(getApiUrl(`/applications/${applicationId}/ai-analyze`), { scoringConfig }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 创建面试邀请（企业端）
   */
  async createInterview(applicationId: string, interviewConfig?: InterviewConfig): Promise<{ message: string; interview: Interview }> {
    const token = localStorage.getItem('token');
    const res = await axios.post(getApiUrl('/enterprise/interviews'), { applicationId, interviewConfig }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 获取企业面试列表
   */
  async getInterviews(page?: number): Promise<{ interviews: Interview[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await axios.get(getApiUrl(`/enterprise/interviews${queryStr}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  /**
   * 获取面试报告
   */
  async getReport(interviewId: string): Promise<{ data: InterviewReport }> {
    const token = localStorage.getItem('token');
    const res = await axios.get(getApiUrl(`/enterprise/interviews/${interviewId}/report`), {
      headers: { Authorization: `Bearer ${token}` }
    });
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
  images?: string[];
  keywords?: string[];
}

export interface JobUpdateRequest {
  title?: string;
  description?: string;
  requirements?: string;
  salaryRange?: string;
  location?: string;
  type?: string;
  status?: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  images?: string[];
  keywords?: string[];
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
  images?: string[];
  keywords?: string[];
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
  async list(params?: { enterpriseId?: string; status?: string; keyword?: string; location?: string; type?: string; page?: number; limit?: number }): Promise<{ jobs: Job[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params?.enterpriseId) query.set('enterpriseId', params.enterpriseId);
    if (params?.status) query.set('status', params.status);
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.location) query.set('location', params.location);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
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
