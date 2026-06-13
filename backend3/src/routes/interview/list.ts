import { Router, Response } from 'express';
import { getPrisma } from '../../index';
import { authenticateToken, requireUser, AuthRequest } from '../../middleware/auth';
import { sanitizeError } from '../../utils/sanitize';

const router = Router();

// 获取面试列表（支持 ?type=PRACTICE|ENTERPRISE 过滤）
router.get('/', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const typeFilter = req.query.type as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (typeFilter === 'ENTERPRISE') {
      where.type = 'ENTERPRISE';
      const [interviews, total] = await Promise.all([
        getPrisma().interview.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: { id: true, status: true, type: true, createdAt: true }
        }),
        getPrisma().interview.count({ where })
      ]);
      return res.json({ interviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } else if (typeFilter === 'PRACTICE') {
      where.type = 'PRACTICE';
    }

    const [interviews, total] = await Promise.all([
      getPrisma().interview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { resume: { select: { title: true } } }
      }),
      getPrisma().interview.count({ where })
    ]);
    res.json({ interviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('获取面试列表失败:', sanitizeError(error));
    res.status(500).json({ error: '获取面试列表失败' });
  }
});

// 获取单个面试
router.get('/:id', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const interview = await getPrisma().interview.findFirst({
      where: { id: req.params.id, userId }
    });
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }
    res.json(interview);
  } catch (error) {
    console.error('获取面试详情失败:', sanitizeError(error));
    res.status(500).json({ error: '获取面试详情失败' });
  }
});

export default router;
