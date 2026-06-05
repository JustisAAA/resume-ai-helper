import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { generalLimiter } from './middleware/rateLimit';

// 加载环境变量
dotenv.config();

// 初始化 Prisma
export const prisma = new PrismaClient();

// 创建 Express 应用
const app: Express = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务（上传的文件）
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '7d',
  etag: true,
  lastModified: true,
}));

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
import enterpriseInterviewRoutes from './routes/enterpriseInterview';
app.use('/api', generalLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/enterprise/interviews', enterpriseInterviewRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务器启动成功！`);
  console.log(`📍 地址：http://localhost:${PORT}`);
  console.log(`📋 环境：${process.env.NODE_ENV || 'development'}`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});
