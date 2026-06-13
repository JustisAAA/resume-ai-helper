/**
 * 简历面试AI助手 - Serverless 云函数入口
 *
 * 腾讯云 SCF (Serverless Cloud Function) 部署：
 *   1. npm run build
 *   2. 上传 dist/ 至云函数
 *   3. 入口文件: handler.handler
 *
 * AWS Lambda 部署：
 *   1. npm run build
 *   2. sls deploy (需 serverless.yml 配置)
 *
 * Vercel 部署：
 *   1. 添加 vercel.json，配置路由到 dist/handler.js
 */

import serverless from 'serverless-http';
import { createApp } from './index';

const app = createApp();

// 云函数标准导出
export const handler = serverless(app, {
  binary: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
});
