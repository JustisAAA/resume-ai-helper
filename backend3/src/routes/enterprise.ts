import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { registerEnterprise, loginEnterprise, getEnterpriseProfile, updateEnterpriseProfile, getDashboardStats } from '../services/enterpriseService';
import { authenticateToken, requireEnterprise, AuthRequest } from '../middleware/auth';
import { uploadLogo } from '../middleware/uploadMiddleware';
import { sanitizeError } from '../utils/sanitize';

const router = Router();

// 企业注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, description, logo, website, industry, size, location, contactEmail, contactPhone } = req.body;

    // 参数校验
    const errors: { field: string; message: string }[] = [];
    
    if (!email) {
      errors.push({ field: 'email', message: '邮箱不能为空' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: '邮箱格式不正确' });
    }
    
    if (!password) {
      errors.push({ field: 'password', message: '密码不能为空' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: '密码长度不能少于8位' });
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.push({ field: 'password', message: '密码必须包含大小写字母和数字' });
    }
    
    if (!name) {
      errors.push({ field: 'name', message: '企业名称不能为空' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ error: '参数校验失败', details: errors });
    }

    const result = await registerEnterprise({
      email,
      password,
      name,
      description,
      logo,
      website,
      industry,
      size,
      location,
      contactEmail,
      contactPhone
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('企业注册错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '企业注册失败' });
  }
});

// 企业登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 参数校验
    const errors: { field: string; message: string }[] = [];
    
    if (!email) {
      errors.push({ field: 'email', message: '邮箱不能为空' });
    }
    
    if (!password) {
      errors.push({ field: 'password', message: '密码不能为空' });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ error: '参数校验失败', details: errors });
    }

    const result = await loginEnterprise({
      email,
      password
    });

    res.json(result);
  } catch (error: any) {
    console.error('企业登录错误:', sanitizeError(error));
    res.status(401).json({ error: error.message || '企业登录失败' });
  }
});

// 获取企业资料（需要企业权限）
router.get('/profile', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const enterprise = await getEnterpriseProfile(userId);
    res.json({ enterprise });
  } catch (error: any) {
    console.error('获取企业资料错误:', sanitizeError(error));
    res.status(404).json({ error: error.message || '获取企业资料失败' });
  }
});

// 更新企业资料（需要企业权限）
router.put('/profile', authenticateToken, requireEnterprise, uploadLogo, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, description, website, industry, size, location, contactEmail, contactPhone } = req.body;

    // 处理 logo 上传（直接存 base64 到数据库）
    let logo = req.body.logo;
    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      const ext = path.extname(req.file.originalname).toLowerCase();
      const mimeType: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
      logo = `data:${mimeType[ext] || 'image/png'};base64,${imageBuffer.toString('base64')}`;
      try { fs.unlinkSync(req.file.path); } catch {}
    }

    const enterprise = await updateEnterpriseProfile(userId, {
      name,
      description,
      logo,
      website,
      industry,
      size,
      location,
      contactEmail,
      contactPhone
    });

    res.json({ message: '企业资料更新成功', enterprise });
  } catch (error: any) {
    console.error('更新企业资料错误:', sanitizeError(error));
    res.status(400).json({ error: error.message || '更新企业资料失败' });
  }
});

// 获取Dashboard统计数据（需要企业权限）
router.get('/dashboard/stats', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const enterprise = await getEnterpriseProfile(userId);
    const stats = await getDashboardStats(enterprise.id);
    res.json(stats);
  } catch (error: any) {
    console.error('获取Dashboard统计错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '获取统计失败' });
  }
});

export default router;
