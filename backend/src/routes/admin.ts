import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ==================== 系统统计 ====================

// 获取系统统计数据
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [userCount, resumeCount, interviewCount, reportCount] = await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.interview.count(),
      prisma.report.count()
    ]);

    // 今日新增统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [newUsersToday, newResumesToday] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.resume.count({ where: { createdAt: { gte: today } } })
    ]);

    res.json({
      userCount,
      resumeCount,
      interviewCount,
      reportCount,
      newUsersToday,
      newResumesToday
    });
  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ==================== 用户管理 ====================

// 获取用户列表（分页 + 搜索）
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = (req.query.search as string) || '';
    const role = req.query.role as string || '';
    const status = req.query.status as string || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true, status: true,
          createdAt: true, _count: { select: { resumes: true, interviews: true, reports: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.user.count({ where })
    ]);

    res.json({ users, total, page, pageSize });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取用户详情
router.get('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, name: true, role: true, status: true,
        createdAt: true, updatedAt: true,
        resumes: { select: { id: true, title: true, status: true, createdAt: true } },
        interviews: { select: { id: true, title: true, status: true, createdAt: true } },
        reports: { select: { id: true, title: true, type: true, createdAt: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 更新用户信息（角色、状态）
router.put('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role, status } = req.body;
    const userId = req.params.id;

    // 检查目标用户
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 不能修改管理员账号（防止误操作导致系统失去管理入口）
    if (targetUser.role === 'ADMIN') {
      return res.status(403).json({ error: '系统管理员账号不可修改' });
    }

    const updateData: any = {};
    if (role !== undefined) {
      if (!['USER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ error: '无效的角色' });
      }
      updateData.role = role;
    }
    if (status !== undefined) {
      if (!['ACTIVE', 'INACTIVE', 'BANNED'].includes(status)) {
        return res.status(400).json({ error: '无效的状态' });
      }
      updateData.status = status;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, status: true }
    });

    res.json({ message: '更新成功', user });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 删除用户
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    // 检查用户是否存在
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 不能删除管理员账号（防止误操作导致系统失去管理入口）
    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: '系统管理员账号不可删除' });
    }

    // 删除用户（级联删除相关数据）
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ==================== 简历管理 ====================

// 获取所有简历列表
router.get('/resumes', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = (req.query.search as string) || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { rawText: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [resumes, total] = await Promise.all([
      prisma.resume.findMany({
        where,
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.resume.count({ where })
    ]);

    res.json({ resumes, total, page, pageSize });
  } catch (error) {
    console.error('获取简历列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 删除简历
router.delete('/resumes/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await prisma.resume.findUnique({ where: { id: req.params.id } });
    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }

    await prisma.resume.delete({ where: { id: req.params.id } });
    res.json({ message: '简历已删除' });
  } catch (error) {
    console.error('删除简历错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ==================== 面试管理 ====================

// 获取所有面试列表
router.get('/interviews', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.interview.count()
    ]);

    res.json({ interviews, total, page, pageSize });
  } catch (error) {
    console.error('获取面试列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 删除面试
router.delete('/interviews/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const interview = await prisma.interview.findUnique({ where: { id: req.params.id } });
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }

    await prisma.interview.delete({ where: { id: req.params.id } });
    res.json({ message: '面试已删除' });
  } catch (error) {
    console.error('删除面试错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ==================== 报告管理 ====================

// 获取所有报告列表
router.get('/reports', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.report.count()
    ]);

    res.json({ reports, total, page, pageSize });
  } catch (error) {
    console.error('获取报告列表错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 删除报告
router.delete('/reports/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!report) {
      return res.status(404).json({ error: '报告不存在' });
    }

    await prisma.report.delete({ where: { id: req.params.id } });
    res.json({ message: '报告已删除' });
  } catch (error) {
    console.error('删除报告错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
