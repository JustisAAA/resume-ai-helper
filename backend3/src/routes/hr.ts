import { Router, Response } from 'express';
import { authenticateToken, requireHR, requireEnterpriseOrHR, AuthRequest } from '../middleware/auth';
import {
  hrLogin, getHRDashboard, getHRApplications,
  getHRApplicationResume, updateHRApplicationStatus, updateHRProfile,
  getEnterpriseHRs
} from '../services/hrService';
import { analyzeApplicationResume } from '../services/enterpriseAIService';
import { getMessages, sendMessage, getConversations, markAsRead } from '../services/messageService';
import { sanitizeError } from '../utils/sanitize';

const router = Router();

// POST /api/hr/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '请输入邮箱和密码' });
    }
    const result = await hrLogin(email, password);
    res.json(result);
  } catch (error: any) {
    console.error('HR登录失败:', sanitizeError(error));
    const message = error.message || '登录失败，请稍后重试';
    // 被封禁的账号返回 403 + banned:true
    if (error.banned) {
      return res.status(403).json({ error: message, banned: true });
    }
    res.status(401).json({ error: message });
  }
});

// GET /api/hr/dashboard
router.get('/dashboard', authenticateToken, requireHR, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getHRDashboard(req.user!.userId);
    res.json(data);
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// GET /api/hr/applications
router.get('/applications', authenticateToken, requireHR, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getHRApplications(req.user!.userId, { page, limit });
    res.json({ applications: result.applications, pagination: result.pagination });
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// GET /api/hr/applications/:id/resume
router.get('/applications/:id/resume', authenticateToken, requireHR, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getHRApplicationResume(req.user!.userId, req.params.id);
    res.json(data);
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(400).json({ error: '操作失败，请稍后重试' });
  }
});

// POST /api/hr/applications/:id/ai-analyze（企业用户和HR都可访问）
router.post('/applications/:id/ai-analyze', authenticateToken, requireEnterpriseOrHR, async (req: AuthRequest, res: Response) => {
  try {
    const { scoringConfig } = req.body;
    if (!scoringConfig?.scoringPoints?.length) {
      return res.status(400).json({ error: '请设置得分点' });
    }
    const result = await analyzeApplicationResume(req.params.id, scoringConfig, req.user!.userId);
    res.json({ message: 'AI分析完成', analysis: result });
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(400).json({ error: '操作失败，请稍后重试' });
  }
});

// PUT /api/hr/applications/:id/status
router.put('/applications/:id/status', authenticateToken, requireHR, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: '无效状态' });
    }
    const app = await updateHRApplicationStatus(req.user!.userId, req.params.id, status);
    res.json({ message: '状态更新成功', application: app });
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(400).json({ error: '操作失败，请稍后重试' });
  }
});

// GET /api/hr/messages/conversations
router.get('/messages/conversations', authenticateToken, requireHR, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getConversations(req.user!.userId, 'HR', { page, limit });
    res.json({ conversations: result.conversations, pagination: result.pagination });
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// GET /api/hr/messages?partnerId=&jobId=&after=
router.get('/messages', authenticateToken, requireHR, async (req: AuthRequest, res: Response) => {
  try {
    const { partnerId, jobId, after } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    if (!partnerId || typeof partnerId !== 'string') {
      return res.status(400).json({ error: '缺少 partnerId' });
    }
    const result = await getMessages(
      req.user!.userId, partnerId,
      typeof jobId === 'string' ? jobId : undefined,
      after as string | undefined,
      { page, limit }
    );
    res.json({ messages: result.messages, pagination: result.pagination });
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// POST /api/hr/messages
router.post('/messages', authenticateToken, requireHR, async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId, content, jobId } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ error: '缺少参数' });
    }
    const msg = await sendMessage(req.user!.userId, receiverId, content, jobId, 'HR');
    res.status(201).json({ message: '发送成功', data: msg });
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(400).json({ error: '操作失败，请稍后重试' });
  }
});

// PUT /api/hr/messages/read?partnerId=&jobId=
router.put('/messages/read', authenticateToken, requireHR, async (req: AuthRequest, res: Response) => {
  try {
    const { partnerId, jobId } = req.query;
    if (!partnerId || typeof partnerId !== 'string') {
      return res.status(400).json({ error: '缺少 partnerId' });
    }
    await markAsRead(req.user!.userId, partnerId, typeof jobId === 'string' ? jobId : undefined);
    res.json({ message: '已读' });
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

// PUT /api/hr/settings
router.put('/settings', authenticateToken, requireHR, async (req: AuthRequest, res: Response) => {
  try {
    const { name, password } = req.body;
    await updateHRProfile(req.user!.userId, { name, password });
    res.json({ message: '更新成功' });
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(400).json({ error: '操作失败，请稍后重试' });
  }
});

// GET /api/hr/by-enterprise - 企业端获取自己的HR子账号列表
router.get('/by-enterprise', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ENTERPRISE') {
      return res.status(403).json({ error: '仅企业用户可访问' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getEnterpriseHRs(req.user!.userId, { page, limit });
    res.json({ hrs: result.hrs, pagination: result.pagination });
  } catch (error: any) {
    console.error('操作失败:', sanitizeError(error));
    res.status(500).json({ error: '操作失败，请稍后重试' });
  }
});

export default router;
