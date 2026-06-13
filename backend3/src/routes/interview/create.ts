import { Router, Response } from 'express';
import { getPrisma } from '../../index';
import { authenticateToken, requireUser, AuthRequest } from '../../middleware/auth';
import { sanitizeError } from '../../utils/sanitize';

const router = Router();

// 创建面试
router.post('/', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { resumeId, title, position, difficulty, language, aiRole } = req.body;
    
    const interview = await getPrisma().interview.create({
      data: {
        userId,
        resumeId,
        title: title || `${position || '模拟'}面试`,
        position,
        difficulty: difficulty || 'MEDIUM',
        language: language || 'ZH_CN',
        aiRole: aiRole || 'PROFESSIONAL',
        questions: [],
        status: 'CREATED'
      }
    });
    
    res.status(201).json(interview);
  } catch (error) {
    console.error('创建面试失败:', sanitizeError(error));
    res.status(500).json({ error: '创建面试失败' });
  }
});

export default router;
