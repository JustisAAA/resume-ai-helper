/**
 * 简历面试AI助手 - Serverless 版后端入口
 * 
 * 支持三种运行模式：
 *   1. Serverless 云函数：导出 createApp()，供 serverless-http 包装
 *   2. 本地开发：npm run dev（ts-node-dev 热重载）
 *   3. 生产服务：npm start（编译后运行）
 * 
 * 部署平台：腾讯云 SCF / AWS Lambda / Vercel / Railway
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { generalLimiter } from './middleware/rateLimit';
import { authenticateToken } from './middleware/auth';
import { sanitizeError } from './utils/sanitize';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import interviewRoutes from './routes/interview';
import toolsRoutes from './routes/tools';
import adminRoutes from './routes/admin';
import enterpriseRoutes from './routes/enterprise';
import jobRoutes from './routes/job';
import applicationRoutes from './routes/application';
import uploadRoutes from './routes/upload';
import messageRoutes from './routes/message';
import reportRoutes from './routes/report';
import userRoutes from './routes/user';
import enterpriseInterviewRoutes from './routes/enterpriseInterview';
import hrRoutes from './routes/hr';

dotenv.config();

const isServerless = process.env.SERVERLESS === 'true';
const isProduction = process.env.NODE_ENV === 'production';

// ===== Prisma 单例（Serverless 冷启动复用） =====
let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({ log: isProduction ? ['error'] : ['warn', 'error'] });
  }
  return prisma;
}

// ===== Express 应用工厂 =====
export function createApp(): Express {
  const app: Express = express();

  // 信任反向代理（Railway/Nginx 等），使 rate-limit 能正确获取客户端 IP
  app.set('trust proxy', 1);

  // ── 基础中间件 ──
  app.use(cors({
    origin: isProduction
      ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*')
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── 静态资源 ──
  const uploadPath = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
  if (!isServerless && !fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // 公开资源：职位图片 / 头像 / Logo（确保目录存在，避免首次部署时静态服务未注册）
  ['jobs', 'avatars', 'logos'].forEach(dir => {
    const p = path.join(uploadPath, dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    app.use(`/uploads/${dir}`, express.static(p, {
      maxAge: isProduction ? '30d' : '7d', etag: true,
    }));
  });
  // 简历文件（需认证）
  const resumesPath = path.join(uploadPath, 'resumes');
  if (fs.existsSync(resumesPath)) {
    app.use('/uploads/resumes', authenticateToken, express.static(resumesPath, {
      maxAge: '0', etag: false,
    }));
  }

  // ── 健康检查（无数据库依赖） ──
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      mode: isServerless ? 'serverless' : (isProduction ? 'production' : 'development'),
      db: (process.env.DATABASE_URL || '').startsWith('postgres') ? 'postgresql' : 'sqlite',
    });
  });

  // ── API 路由 ──
  app.use('/api', generalLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/resumes', resumeRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/tools', toolsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/enterprise', enterpriseRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/enterprise/interviews', enterpriseInterviewRoutes);
  app.use('/api/hr', hrRoutes);

  // ── 前端静态文件（生产模式 + 有构建产物时） ──
  const frontendDist = path.join(process.cwd(), '..', 'frontend', 'dist');
  if (isProduction && fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist, { maxAge: '7d', etag: true }));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  // ── 404 ──
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: '接口不存在' });
  });

  // ── 全局错误处理 ──
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[服务端错误]', sanitizeError(err));
    const statusCode = err.statusCode || 500;
    const message = err.statusCode ? err.message : '服务器内部错误';
    res.status(statusCode).json({ error: message });
  });

  return app;
}

// ===== 非 Serverless 环境下自启动 =====
if (!isServerless && !process.env.AWS_LAMBDA_RUNTIME_API) {
  const PORT = process.env.PORT || 3002;
  const app = createApp();

  app.listen(PORT, () => {
    console.log('🚀 简历面试AI助手 - 后端服务');
    console.log(`📍 http://0.0.0.0:${PORT}`);
    console.log(`📋 模式: serverless 适配版 / 本地开发`);
    console.log(`💾 数据库: ${(process.env.DATABASE_URL || '').startsWith('postgres') ? 'PostgreSQL' : 'SQLite'}`);
  });

  const shutdown = async () => {
    console.log('正在关闭...');
    if (prisma) await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
