import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { JWT_SECRET } from '../config';

// 扩展 Request 类型，添加 user 字段
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * 认证中间件：验证 JWT Token，将用户信息挂载到 req.user
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true }
    });

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    if (user.status === 'BANNED') {
      return res.status(403).json({ error: '账号已被封禁，请联系管理员' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

/**
 * 管理员权限中间件：必须在 authenticateToken 之后使用
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: '权限不足，需要管理员权限' });
  }

  next();
}

/**
 * 企业权限中间件：必须在 authenticateToken 之后使用
 */
export function requireEnterprise(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }

  if (req.user.role !== 'ENTERPRISE') {
    return res.status(403).json({ error: '权限不足，需要企业权限' });
  }

  next();
}

/**
 * 普通用户权限中间件：必须在 authenticateToken 之后使用
 * 只允许求职者（USER）访问
 */
export function requireUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }

  if (req.user.role !== 'USER') {
    return res.status(403).json({ error: '权限不足，该功能仅限求职者使用' });
  }

  next();
}

/**
 * HR权限中间件：必须在 authenticateToken 之后使用
 */
export function requireHR(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }
  if (req.user.role !== 'HR') {
    return res.status(403).json({ error: '权限不足，需要HR权限' });
  }
  next();
}

/** 企业或HR权限（用于企业面试API） */
export function requireEnterpriseOrHR(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }
  if (req.user.role !== 'ENTERPRISE' && req.user.role !== 'HR') {
    return res.status(403).json({ error: '权限不足，需要企业或HR权限' });
  }
  next();
}
