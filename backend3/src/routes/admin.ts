import { Router, Request, Response, NextFunction } from 'express';
import { getPrisma } from '../index';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { sanitizeError } from '../utils/sanitize';

const router = Router();

// ==================== 系统统计 ====================

// 获取系统统计数据
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [userCount, enterpriseCount, jobCount, applicationCount, interviewCount, reportCount, pendingReportCount] = await Promise.all([
      getPrisma().user.count(),
      getPrisma().enterprise.count(),
      getPrisma().job.count(),
      getPrisma().application.count(),
      getPrisma().interview.count(),
      getPrisma().complaint.count(),
      getPrisma().complaint.count({ where: { status: 'PENDING' } })
    ]);

    // 今日新增统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [newUsersToday, newEnterprisesToday] = await Promise.all([
      getPrisma().user.count({ where: { createdAt: { gte: today } } }),
      getPrisma().enterprise.count({ where: { createdAt: { gte: today } } })
    ]);

    // 角色分布
    const [userRoleCount, enterpriseRoleCount, adminRoleCount] = await Promise.all([
      getPrisma().user.count({ where: { role: 'USER' } }),
      getPrisma().user.count({ where: { role: 'ENTERPRISE' } }),
      getPrisma().user.count({ where: { role: 'ADMIN' } })
    ]);

    res.json({
      userCount,
      enterpriseCount,
      jobCount,
      applicationCount,
      interviewCount,
      reportCount,
      pendingReportCount,
      newUsersToday,
      newEnterprisesToday,
      userRoleCount,
      enterpriseRoleCount,
      adminRoleCount
    });
  } catch (error) {
    console.error('获取统计错误:', sanitizeError(error));
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
      getPrisma().user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true, status: true,
          createdAt: true,
          // 包含 HR 子账号状态（用于显示 HR 绑定岗位删除后的"已停用"标记）
          hrAccount: {
            select: {
              id: true,
              isActive: true,
              jobId: true,
              job: { select: { title: true, status: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      getPrisma().user.count({ where })
    ]);

    res.json({ users, total, page, pageSize });
  } catch (error) {
    console.error('获取用户列表错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取用户详情
router.get('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getPrisma().user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, email: true, name: true, role: true, status: true,
        createdAt: true, updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    console.error('获取用户详情错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 更新用户信息（状态）
router.put('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;

    // 检查目标用户
    const targetUser = await getPrisma().user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 不能修改管理员账号（防止误操作导致系统失去管理入口）
    if (targetUser.role === 'ADMIN') {
      return res.status(403).json({ error: '系统管理员账号不可修改' });
    }

    const updateData: any = {};
    if (status !== undefined) {
      if (!['ACTIVE', 'BANNED'].includes(status)) {
        return res.status(400).json({ error: '无效的状态' });
      }
      updateData.status = status;
    }

    const user = await getPrisma().user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, status: true }
    });

    res.json({ message: '更新成功', user });
  } catch (error) {
    console.error('更新用户错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 删除用户
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    // 检查用户是否存在
    const user = await getPrisma().user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 不能删除管理员账号（防止误操作导致系统失去管理入口）
    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: '系统管理员账号不可删除' });
    }

    // 删除用户（级联删除相关数据）
    await getPrisma().user.delete({ where: { id: userId } });

    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
