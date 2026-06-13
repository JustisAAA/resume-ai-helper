import { Router, Response } from 'express';
import { createJob, getJobs, getJobById, updateJob, deleteJob, updateJobStatus } from '../services/jobService';
import { authenticateToken, requireEnterprise, AuthRequest } from '../middleware/auth';
import { JobStatus } from '@prisma/client';
import { getApplicationsByJobId } from '../services/applicationService';
import { getPrisma } from '../index';
import { sanitizeError } from '../utils/sanitize';

const router = Router();

// 创建职位（需要企业权限）
router.post('/', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    const { title, description, requirements, salaryRange, location, type, keywords, images, hrName, hrEmail, hrPassword } = req.body;

    // 参数校验
    const errors: { field: string; message: string }[] = [];
    
    if (!title) {
      errors.push({ field: 'title', message: '职位标题不能为空' });
    }
    
    if (!description) {
      errors.push({ field: 'description', message: '职位描述不能为空' });
    }

    if (!hrEmail || !hrPassword || !hrName) {
      errors.push({ field: 'hr', message: 'HR信息为必填项（姓名、邮箱、密码）' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ error: '参数校验失败', details: errors });
    }

    const result = await createJob(enterprise.id, {
      title,
      description,
      requirements,
      salaryRange,
      location,
      type,
      keywords,
      images,
      hrConfig: { name: hrName, email: hrEmail, password: hrPassword }
    });

    res.status(201).json({ message: '职位创建成功', job: result.job, hr: result.hrResult });
  } catch (error: any) {
    console.error('创建职位错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '创建职位失败' });
  }
});

// 获取职位列表（公开接口）
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { enterpriseId, status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await getJobs(
      enterpriseId as string | undefined,
      status as JobStatus | undefined,
      { page, limit }
    );

    res.json({ jobs: result.jobs, pagination: result.pagination });
  } catch (error: any) {
    console.error('获取职位列表错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '获取职位列表失败' });
  }
});

// 获取职位详情（公开接口）
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const job = await getJobById(id);
    res.json({ job });
  } catch (error: any) {
    console.error('获取职位详情错误:', sanitizeError(error));
    res.status(404).json({ error: error.message || '获取职位详情失败' });
  }
});

// 更新职位（需要企业权限）
router.put('/:id', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    const { title, description, requirements, salaryRange, location, type, status, keywords, images } = req.body;

    const job = await updateJob(id, enterprise.id, {
      title,
      description,
      requirements,
      salaryRange,
      location,
      type,
      status,
      keywords,
      images
    });

    res.json({ message: '职位更新成功', job });
  } catch (error: any) {
    console.error('更新职位错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '更新职位失败' });
  }
});

// 删除职位（需要企业权限）
router.delete('/:id', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    const result = await deleteJob(id, enterprise.id);
    res.json(result);
  } catch (error: any) {
    console.error('删除职位错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '删除职位失败' });
  }
});

// 更新职位状态（需要企业权限）
router.patch('/:id/status', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status } = req.body;
    
    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    if (!status || !['ACTIVE', 'CLOSED', 'DRAFT'].includes(status)) {
      return res.status(400).json({ 
        error: '参数校验失败', 
        details: [{ field: 'status', message: '状态值无效，必须是 ACTIVE、CLOSED 或 DRAFT' }] 
      });
    }

    const job = await updateJobStatus(id, enterprise.id, status as JobStatus);
    res.json({ message: '职位状态更新成功', job });
  } catch (error: any) {
    console.error('更新职位状态错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '更新职位状态失败' });
  }
});

// 获取职位的申请列表（需要企业权限）
router.get('/:jobId/applications', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { jobId } = req.params;

    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 获取申请列表
    const applications = await getApplicationsByJobId(jobId, enterprise.id);

    res.json({
      message: '获取申请列表成功',
      applications
    });
  } catch (error: any) {
    console.error('获取职位申请列表错误:', sanitizeError(error));

    // 根据错误信息返回相应的状态码
    if (error.message === '职位不存在') {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || '获取职位申请列表失败' });
  }
});

export default router;
