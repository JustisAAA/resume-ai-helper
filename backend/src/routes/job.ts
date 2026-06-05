import { Router, Request, Response } from 'express';
import { createJob, getJobs, getJobById, updateJob, deleteJob, updateJobStatus } from '../services/jobService';
import { authenticateToken, requireEnterprise } from '../middleware/auth';
import { JobStatus } from '@prisma/client';

const router = Router();

// 创建职位（需要企业权限）
router.post('/', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
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

    const { title, description, requirements, salaryRange, location, type } = req.body;

    // 参数校验
    const errors: { field: string; message: string }[] = [];
    
    if (!title) {
      errors.push({ field: 'title', message: '职位标题不能为空' });
    }
    
    if (!description) {
      errors.push({ field: 'description', message: '职位描述不能为空' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ error: '参数校验失败', details: errors });
    }

    const job = await createJob(enterprise.id, {
      title,
      description,
      requirements,
      salaryRange,
      location,
      type
    });

    res.status(201).json({ message: '职位创建成功', job });
  } catch (error: any) {
    console.error('创建职位错误:', error);
    res.status(400).json({ error: error.message || '创建职位失败' });
  }
});

// 获取职位列表（公开接口）
router.get('/', async (req: Request, res: Response) => {
  try {
    const { enterpriseId, status } = req.query;
    
    const jobs = await getJobs(
      enterpriseId as string | undefined,
      status as JobStatus | undefined
    );

    res.json({ jobs });
  } catch (error: any) {
    console.error('获取职位列表错误:', error);
    res.status(500).json({ error: error.message || '获取职位列表失败' });
  }
});

// 获取职位详情（公开接口）
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await getJobById(id);
    res.json({ job });
  } catch (error: any) {
    console.error('获取职位详情错误:', error);
    res.status(404).json({ error: error.message || '获取职位详情失败' });
  }
});

// 更新职位（需要企业权限）
router.put('/:id', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
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

    const { title, description, requirements, salaryRange, location, type, status } = req.body;

    const job = await updateJob(id, enterprise.id, {
      title,
      description,
      requirements,
      salaryRange,
      location,
      type,
      status
    });

    res.json({ message: '职位更新成功', job });
  } catch (error: any) {
    console.error('更新职位错误:', error);
    res.status(400).json({ error: error.message || '更新职位失败' });
  }
});

// 删除职位（需要企业权限）
router.delete('/:id', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
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

    const result = await deleteJob(id, enterprise.id);
    res.json(result);
  } catch (error: any) {
    console.error('删除职位错误:', error);
    res.status(400).json({ error: error.message || '删除职位失败' });
  }
});

// 更新职位状态（需要企业权限）
router.patch('/:id/status', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { status } = req.body;
    
    // 获取企业ID
    const { prisma } = require('../index');
    const enterprise = await prisma.enterprise.findUnique({
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
    console.error('更新职位状态错误:', error);
    res.status(400).json({ error: error.message || '更新职位状态失败' });
  }
});

export default router;
