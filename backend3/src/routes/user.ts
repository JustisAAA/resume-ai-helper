import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getCreditInfo, getUserCreditScore } from '../services/creditService';
import { sanitizeError } from '../utils/sanitize';

const router = Router();

// 获取当前用户的信用分信息
router.get('/me/credit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const data = await getCreditInfo(userId);
    res.json(data);
  } catch (error: any) {
    console.error('获取信用分信息错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '服务器内部错误' });
  }
});

// 获取他人的信用分（公开，仅分数）
router.get('/:id/credit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const data = await getUserCreditScore(req.params.id);
    res.json(data);
  } catch (error: any) {
    res.status(404).json({ error: error.message || '用户不存在' });
  }
});

export default router;
