import { Router, Request, Response } from 'express';
import {
  updateApplicationStatus,
  getApplicationResume,
  getApplicationById
} from '../services/applicationService';
import { authenticateToken, requireEnterprise } from '../middleware/auth';
import { ApplicationStatus } from '@prisma/client';
import { getPrisma } from '../index';

const router = Router();

/**
 * 更新申请状态
 * PATCH /api/applications/:id/status
 * 
 * 请求体：
 * - status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED'
 * 
 * 权限：企业用户，只能修改自己职位收到的申请
 */
router.patch('/:id/status', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { status } = req.body;

    // 参数校验
    if (!status || !['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        error: '参数校验失败',
        details: [{ field: 'status', message: '状态值无效，必须是 PENDING、REVIEWING、ACCEPTED 或 REJECTED' }]
      });
    }

    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 更新申请状态
    const application = await updateApplicationStatus(
      id,
      enterprise.id,
      status as ApplicationStatus
    );

    res.json({
      message: '申请状态更新成功',
      application
    });
  } catch (error: any) {
    console.error('更新申请状态错误:', error);

    // 根据错误信息返回相应的状态码
    if (error.message === '申请不存在') {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(400).json({ error: error.message || '更新申请状态失败' });
  }
});

/**
 * 查看申请简历详情
 * GET /api/applications/:id/resume
 * 
 * 权限：企业用户，只能查看自己职位收到的申请的简历
 */
router.get('/:id/resume', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 获取简历详情
    const resume = await getApplicationResume(id, enterprise.id);

    res.json({
      message: '获取简历详情成功',
      resume
    });
  } catch (error: any) {
    console.error('获取申请简历错误:', error);

    // 根据错误信息返回相应的状态码
    if (error.message === '申请不存在' || error.message === '该申请没有关联的简历') {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || '获取申请简历失败' });
  }
});

/**
 * 获取申请详情
 * GET /api/applications/:id
 * 
 * 权限：企业用户，只能查看自己职位收到的申请
 */
router.get('/:id', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 获取申请详情
    const application = await getApplicationById(id, enterprise.id);

    res.json({
      message: '获取申请详情成功',
      application
    });
  } catch (error: any) {
    console.error('获取申请详情错误:', error);

    // 根据错误信息返回相应的状态码
    if (error.message === '申请不存在') {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || '获取申请详情失败' });
  }
});

export default router;
