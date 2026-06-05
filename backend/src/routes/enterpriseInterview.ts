import { Router, Request, Response } from 'express';
import { createInterview, getEnterpriseInterviews, getInterviewReport } from '../services/enterpriseInterviewService';
import { authenticateToken, requireEnterprise } from '../middleware/auth';

const router = Router();

/**
 * 创建面试邀请
 * POST /api/enterprise/interviews
 * 
 * 请求体：
 * - applicationId: 申请ID
 * 
 * 权限：企业用户，只能为属于自己职位的申请创建面试
 */
router.post('/', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { applicationId } = req.body;

    // 参数校验
    if (!applicationId) {
      return res.status(400).json({
        error: '参数校验失败',
        details: [{ field: 'applicationId', message: '申请ID不能为空' }]
      });
    }

    // 获取企业ID
    const { prisma } = require('../index');
    const enterprise = await prisma.enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 创建面试
    const interview = await createInterview(enterprise.id, applicationId);

    // 生成面试链接
    const interviewLink = `${req.protocol}://${req.get('host')}/interview/${interview.id}`;

    res.status(201).json({
      message: '面试邀请创建成功',
      interview: {
        id: interview.id,
        title: interview.title,
        status: interview.status,
        createdAt: interview.createdAt,
        link: interviewLink
      }
    });
  } catch (error: any) {
    console.error('创建面试邀请错误:', error);

    // 根据错误信息返回相应的状态码
    if (error.message === '申请不存在' || error.message === '该申请没有关联的简历，无法创建面试') {
      return res.status(400).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || '创建面试邀请失败' });
  }
});

/**
 * 获取企业的面试列表
 * GET /api/enterprise/interviews
 * 
 * 权限：企业用户，只能查看自己企业的面试
 */
router.get('/', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // 获取企业ID
    const { prisma } = require('../index');
    const enterprise = await prisma.enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 获取面试列表
    const interviews = await getEnterpriseInterviews(enterprise.id);

    res.json({
      message: '获取面试列表成功',
      interviews
    });
  } catch (error: any) {
    console.error('获取面试列表错误:', error);
    res.status(500).json({ error: error.message || '获取面试列表失败' });
  }
});

/**
 * 获取面试报告
 * GET /api/enterprise/interviews/:id/report
 * 
 * 权限：企业用户，只能查看自己企业的面试报告
 */
router.get('/:id/report', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // 获取企业ID
    const { prisma } = require('../index');
    const enterprise = await prisma.enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 获取报告
    const report = await getInterviewReport(id, enterprise.id);

    res.json({
      message: '获取面试报告成功',
      report
    });
  } catch (error: any) {
    console.error('获取面试报告错误:', error);

    // 根据错误信息返回相应的状态码
    if (error.message === '面试不存在' || error.message === '该面试没有报告') {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || '获取面试报告失败' });
  }
});

export default router;
