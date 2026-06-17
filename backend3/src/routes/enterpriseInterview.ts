import { Router, Request, Response } from 'express';
import { createInterview, getEnterpriseInterviews, getInterviewReport, getEnterpriseInterviewDetail } from '../services/enterpriseInterviewService';
import { authenticateToken, requireEnterprise, requireEnterpriseOrHR, AuthRequest } from '../middleware/auth';
import { sanitizeError } from '../utils/sanitize';
import { getPrisma } from '../index';

const router = Router();

/**
 * 创建面试邀请
 * POST /api/enterprise/interviews
 * 
 * 请求体：
 * - applicationId: 申请ID
 * 
 * 权限：企业用户或HR，只能为属于自己职位的申请创建面试
 */
router.post('/', authenticateToken, requireEnterpriseOrHR, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { applicationId, interviewConfig } = req.body;

    // 参数校验
    if (!applicationId) {
      return res.status(400).json({
        error: '参数校验失败',
        details: [{ field: 'applicationId', message: '申请ID不能为空' }]
      });
    }

    // 根据角色获取企业ID
    let enterpriseId: string;
    if (userRole === 'HR') {
      const hrAccount = await getPrisma().hRAccount.findUnique({
        where: { userId },
        select: { enterpriseId: true, jobId: true }
      });
      if (!hrAccount) {
        return res.status(404).json({ error: 'HR信息不存在' });
      }
      enterpriseId = hrAccount.enterpriseId;
    } else {
      const enterprise = await getPrisma().enterprise.findUnique({
        where: { userId }
      });
      if (!enterprise) {
        return res.status(404).json({ error: '企业信息不存在' });
      }
      enterpriseId = enterprise.id;
    }

    // 创建面试
    const interview = await createInterview(enterpriseId, applicationId, interviewConfig);

    // 生成面试链接（前端路由：/interviews/:id/enterprise-room）
    const interviewLink = `${req.protocol}://${req.get('host')}/interviews/${interview.id}/enterprise-room`;

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
    console.error('创建面试邀请错误:', sanitizeError(error));

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
 * 权限：企业或HR，企业看全部，HR看关联岗位
 */
router.get('/', authenticateToken, requireEnterpriseOrHR, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let enterpriseId: string;

    if (userRole === 'HR') {
      // HR用户：通过HRAccount找到绑定的岗位和企业
      const hrAccount = await getPrisma().hRAccount.findUnique({
        where: { userId },
        select: { enterpriseId: true, jobId: true }
      });
      if (!hrAccount) {
        return res.status(404).json({ error: 'HR信息不存在' });
      }
      enterpriseId = hrAccount.enterpriseId;
      // HR只能查看绑定岗位的面试
      const interviews = await getEnterpriseInterviews(enterpriseId, hrAccount.jobId);
      return res.json({ message: '获取面试列表成功', interviews });
    }

    // 企业用户
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });
    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }
    const interviews = await getEnterpriseInterviews(enterprise.id);
    res.json({ message: '获取面试列表成功', interviews });
  } catch (error: any) {
    console.error('获取面试列表错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '获取面试列表失败' });
  }
});

/**
 * 获取面试详情（含 questions/answers/feedback）
 * GET /api/enterprise/interviews/:id
 * 
 * 权限：企业或HR
 */
router.get('/:id', authenticateToken, requireEnterpriseOrHR, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { id } = req.params;

    let enterpriseId: string;

    if (userRole === 'HR') {
      const hrAccount = await getPrisma().hRAccount.findUnique({
        where: { userId },
        select: { enterpriseId: true }
      });
      if (!hrAccount) {
        return res.status(404).json({ error: 'HR信息不存在' });
      }
      enterpriseId = hrAccount.enterpriseId;
    } else {
      const enterprise = await getPrisma().enterprise.findUnique({
        where: { userId }
      });
      if (!enterprise) {
        return res.status(404).json({ error: '企业信息不存在' });
      }
      enterpriseId = enterprise.id;
    }

    const interview = await getEnterpriseInterviewDetail(id, enterpriseId);
    res.json({ interview });
  } catch (error: any) {
    console.error('获取面试详情错误:', sanitizeError(error));
    if (error.message === '面试不存在') {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || '获取面试详情失败' });
  }
});

/**
 * 获取面试报告
 * GET /api/enterprise/interviews/:id/report
 * 
 * 权限：企业或HR
 */
router.get('/:id/report', authenticateToken, requireEnterpriseOrHR, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { id } = req.params;

    let enterpriseId: string;

    if (userRole === 'HR') {
      const hrAccount = await getPrisma().hRAccount.findUnique({
        where: { userId },
        select: { enterpriseId: true }
      });
      if (!hrAccount) {
        return res.status(404).json({ error: 'HR信息不存在' });
      }
      enterpriseId = hrAccount.enterpriseId;
    } else {
      const enterprise = await getPrisma().enterprise.findUnique({
        where: { userId }
      });
      if (!enterprise) {
        return res.status(404).json({ error: '企业信息不存在' });
      }
      enterpriseId = enterprise.id;
    }

    const report = await getInterviewReport(id, enterpriseId);
    res.json({ message: '获取面试报告成功', report });
  } catch (error: any) {
    console.error('获取面试报告错误:', sanitizeError(error));

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
