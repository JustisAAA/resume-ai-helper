import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { generalLimiter } from './middleware/rateLimit';
import { sanitizeError } from './utils/sanitize';

// 加载环境变量
dotenv.config();

// 初始化 Prisma
export const prisma = new PrismaClient();

// 创建 Express 应用
const app: Express = express();
const PORT = process.env.PORT || 3002;
const isProduction = process.env.NODE_ENV === 'production';

// 中间件
// CORS — 生产环境允许同源（前端由后端托管）或配置的来源
app.use(cors({
  origin: isProduction
    ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true)
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 上传目录
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// 生产环境：前端静态文件 / data 目录
const frontendDistPath = path.join(process.cwd(), '..', 'frontend', 'dist');
const dataDir = path.join(process.cwd(), 'data');
if (isProduction && fs.existsSync(frontendDistPath)) {
  console.log(`📦 前端静态文件目录: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath, {
    maxAge: '7d',
    etag: true,
  }));
}

// 公开静态资源
app.use('/uploads/jobs', express.static(path.join(uploadsPath, 'jobs'), {
  maxAge: isProduction ? '30d' : '7d',
  etag: true,
}));
app.use('/uploads/avatars', express.static(path.join(uploadsPath, 'avatars'), {
  maxAge: isProduction ? '30d' : '7d',
  etag: true,
}));

// 简历文件需要认证
import { authenticateToken } from './middleware/auth';
app.use('/uploads/resumes', authenticateToken, express.static(path.join(uploadsPath, 'resumes'), {
  maxAge: '0',
  etag: false,
}));

// 健康检查
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    environment: isProduction ? 'production' : 'development',
  });
});

// API 路由
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

// 生产环境：所有非 API 请求返回前端 index.html（SPA 路由支持）
if (isProduction && fs.existsSync(frontendDistPath)) {
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 处理（非生产环境返回 JSON）
if (!isProduction) {
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: '接口不存在' });
  });
}

// 全局错误处理
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[服务端错误]', sanitizeError(err));
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : '服务器内部错误';
  res.status(statusCode).json({ error: message });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 简历面试AI助手 - 后端服务`);
  console.log(`📍 地址：http://0.0.0.0:${PORT}`);
  console.log(`📋 模式：${isProduction ? '生产模式' : '开发模式'}`);
  if (isProduction) {
    console.log(`🌐 前端由后端统一托管`);
  }
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM，正在关闭...');
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGINT', async () => {
  console.log('收到 SIGINT，正在关闭...');
  await prisma.$disconnect();
  process.exit(0);
});
