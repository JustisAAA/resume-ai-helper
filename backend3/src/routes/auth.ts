import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPrisma } from '../index';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { sanitizeError } from '../utils/sanitize';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';

const router = Router();

// 确保上传目录存在
const avatarDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

// 配置 multer 存储头像
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 2 * 1024 * 1024 } }); // 最大2MB

// 用户注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: '密码长度至少8位' });
    }
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: '密码必须包含大小写字母和数字' });
    }

    // 检查用户是否存在
    const existingUser = await getPrisma().user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    // 哈希密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await getPrisma().user.create({
      data: {
        email,
        passwordHash,
        name
      }
    });

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 返回结果
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('注册错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    // 查找用户
    const user = await getPrisma().user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 检查账号是否被封禁
    if (user.status === 'BANNED') {
      return res.status(403).json({ error: '此账号已封禁', banned: true });
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 返回结果
    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('登录错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getPrisma().user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true, avatar: true }
    });
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    res.json({ user });
  } catch (error) {
    console.error('获取用户信息错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 修改用户名
router.put('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '用户名不能为空' });
    }
    const user = await getPrisma().user.update({
      where: { id: req.user!.userId },
      data: { name: name.trim() },
      select: { id: true, email: true, name: true, role: true, createdAt: true, avatar: true }
    });
    res.json({ user });
  } catch (error) {
    console.error('修改用户名错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 修改密码
router.put('/me/password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码不能为空' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: '新密码至少8位，需包含大小写字母和数字' });
    }
    if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: '新密码必须包含大小写字母和数字' });
    }
    const user = await getPrisma().user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      return res.status(400).json({ error: '旧密码错误' });
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await getPrisma().user.update({
      where: { id: req.user!.userId },
      data: { passwordHash: newPasswordHash }
    });
    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 上传头像（直接存 base64 到数据库，避免 Railway 文件丢失）
router.post('/me/avatar', authenticateToken, uploadAvatar.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' });
    }
    // 读取文件转为 base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const mimeType: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
    const avatarBase64 = `data:${mimeType[ext] || 'image/png'};base64,${imageBuffer.toString('base64')}`;
    // 删除临时文件
    try { fs.unlinkSync(req.file.path); } catch {}
    const user = await getPrisma().user.update({
      where: { id: req.user!.userId },
      data: { avatar: avatarBase64 },
      select: { id: true, email: true, name: true, role: true, createdAt: true, avatar: true }
    });
    res.json({ user, avatarUrl: avatarBase64 });
  } catch (error) {
    console.error('上传头像错误:', sanitizeError(error));
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;
