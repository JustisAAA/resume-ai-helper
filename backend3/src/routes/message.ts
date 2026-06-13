import { Router, Request, Response } from 'express';
import { sendMessage, getMessages, getUnreadCount, markAsRead, getConversations } from '../services/messageService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sanitizeError } from '../utils/sanitize';

const router = Router();

// POST /api/messages - 发送消息（支持jobId隔离）
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role === 'ADMIN') {
      return res.status(403).json({ error: '管理员不能使用消息功能' });
    }
    const userId = req.user!.userId;
    const { receiverId, content, jobId } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: '缺少 receiverId 或 content' });
    }

    const message = await sendMessage(userId, receiverId, content, jobId, req.user!.role);
    res.status(201).json({ message: '发送成功', data: message });
  } catch (error: any) {
    console.error('发送消息错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '发送失败' });
  }
});

// GET /api/messages/conversations - 获取会话列表（按职位隔离）
router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role === 'ADMIN') {
      return res.status(403).json({ error: '管理员不能使用消息功能' });
    }
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await getConversations(userId, req.user!.role, { page, limit });
    res.json({ conversations: result.conversations, pagination: result.pagination });
  } catch (error: any) {
    console.error('获取会话列表错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '获取失败' });
  }
});

// GET /api/messages/unread-count - 获取未读消息数
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role === 'ADMIN') {
      return res.status(403).json({ error: '管理员不能使用消息功能' });
    }
    const userId = req.user!.userId;
    const count = await getUnreadCount(userId);
    res.json({ count });
  } catch (error: any) {
    console.error('获取未读消息数错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '获取失败' });
  }
});

// GET /api/messages?partnerId=xxx&jobId=xxx&after=yyy - 获取与某用户某职位的消息列表
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role === 'ADMIN') {
      return res.status(403).json({ error: '管理员不能使用消息功能' });
    }
    const userId = req.user!.userId;
    const { partnerId, jobId, after } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!partnerId || typeof partnerId !== 'string') {
      return res.status(400).json({ error: '缺少 partnerId 参数' });
    }

    const result = await getMessages(
      userId,
      partnerId,
      typeof jobId === 'string' ? jobId : undefined,
      after as string | undefined,
      { page, limit }
    );
    res.json({ messages: result.messages, pagination: result.pagination });
  } catch (error: any) {
    console.error('获取消息列表错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '获取失败' });
  }
});

// PUT /api/messages/read?partnerId=xxx&jobId=xxx - 标记消息已读（按职位隔离）
router.put('/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role === 'ADMIN') {
      return res.status(403).json({ error: '管理员不能使用消息功能' });
    }
    const userId = req.user!.userId;
    const { partnerId, jobId } = req.query;

    if (!partnerId || typeof partnerId !== 'string') {
      return res.status(400).json({ error: '缺少 partnerId 参数' });
    }

    await markAsRead(userId, partnerId, typeof jobId === 'string' ? jobId : undefined);
    res.json({ message: '标记已读成功' });
  } catch (error: any) {
    console.error('标记已读错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '操作失败' });
  }
});

export default router;
