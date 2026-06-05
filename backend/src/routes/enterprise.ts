import { Router, Request, Response } from 'express';
import { registerEnterprise, loginEnterprise, getEnterpriseProfile, updateEnterpriseProfile } from '../services/enterpriseService';
import { authenticateToken, requireEnterprise } from '../middleware/auth';

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
    } else if (password.length < 6) {
      errors.push({ field: 'password', message: '密码长度不能少于6位' });
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
    console.error('企业注册错误:', error);
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
    console.error('企业登录错误:', error);
    res.status(401).json({ error: error.message || '企业登录失败' });
  }
});

// 获取企业资料（需要企业权限）
router.get('/profile', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const enterprise = await getEnterpriseProfile(userId);
    res.json({ enterprise });
  } catch (error: any) {
    console.error('获取企业资料错误:', error);
    res.status(404).json({ error: error.message || '获取企业资料失败' });
  }
});

// 更新企业资料（需要企业权限）
router.put('/profile', authenticateToken, requireEnterprise, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description, logo, website, industry, size, location, contactEmail, contactPhone } = req.body;

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
    console.error('更新企业资料错误:', error);
    res.status(400).json({ error: error.message || '更新企业资料失败' });
  }
});

export default router;
