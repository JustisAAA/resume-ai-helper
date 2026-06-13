import { Router, Request, Response } from 'express';
import { submitReport, getReports, approveReport, rejectReport } from '../services/reportService';
import { authenticateToken, requireUser, requireAdmin, AuthRequest } from '../middleware/auth';
import { sanitizeError } from '../utils/sanitize';

const router = Router();

// POST /api/reports - 提交举报
router.post('/', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { targetId, reason, description } = req.body;

    if (!targetId || !reason) {
      return res.status(400).json({ error: '缺少 targetId 或 reason' });
    }

    const report = await submitReport(userId, targetId, reason, description);
    res.status(201).json({ message: '举报已提交，管理员会尽快处理', report });
  } catch (error: any) {
    console.error('提交举报错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '提交失败' });
  }
});

// GET /api/reports - 获取举报列表（管理员）
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getReports(status as string | undefined, { page, limit });
    res.json({ reports: result.reports, pagination: result.pagination });
  } catch (error: any) {
    console.error('获取举报列表错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '获取失败' });
  }
});

// PUT /api/reports/:id/approve - 通过举报（管理员）
router.put('/:id/approve', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const report = await approveReport(id, userId);
    res.json({ message: '举报已通过，信用分已扣除', report });
  } catch (error: any) {
    console.error('通过举报错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '操作失败' });
  }
});

// PUT /api/reports/:id/reject - 驳回举报（管理员）
router.put('/:id/reject', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const report = await rejectReport(id, userId);
    res.json({ message: '举报已驳回', report });
  } catch (error: any) {
    console.error('驳回举报错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '操作失败' });
  }
});

export default router;
