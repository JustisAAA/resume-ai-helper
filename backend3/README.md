# 简历面试AI助手 - Serverless 部署版 (backend3)

## 与 backend / backend2 的区别

| 特性 | backend (开发版) | backend2 (VPS版) | backend3 (Serverless版) |
|------|:----------------:|:-----------------:|:-----------------------:|
| 数据库 | SQLite | SQLite | **PostgreSQL** |
| 运行方式 | ts-node-dev | 长期服务进程 | **云函数按需调用** |
| 部署平台 | — | VPS/Nginx/PM2 | **腾讯云SCF/AWS Lambda/Vercel** |
| 入口 | app.listen | app.listen | **handler.handler (导出函数)** |
| 文件存储 | 本地磁盘 | 本地磁盘 | **云存储 (COS/S3)** |
| 前端托管 | Vite 代理 | 后端统一托管 | 后端统一托管 |

## 本地开发

```bash
# 安装依赖 + 生成 Prisma 客户端
npm run setup

# 启动（SQLite 模式）
npm run dev
```

## 构建

```bash
npm run build
# 产出在 dist/ 目录
```

## 部署到腾讯云 SCF

1. 准备 PostgreSQL 数据库（腾讯云 PostgreSQL）
2. 配置环境变量（参照 .env.example）
3. 构建：`npm run build`
4. 上传 `dist/` 目录到云函数
5. 设置入口为：`handler.handler`
6. 设置超时时间 ≥ 30 秒（AI 接口可能较慢）

## 部署到 Vercel

1. 在项目根目录创建 `vercel.json`：
```json
{
  "builds": [
    {
      "src": "backend3/dist/handler.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend3/dist/handler.js" }
  ]
}
```

2. 设置环境变量
3. `npx vercel --prod`

## 部署到 Railway（推荐）

Railway 提供每月 $5 免费额度和 PostgreSQL 数据库，最适合比赛演示。

### 一键部署（网页操作）

1. 把项目推到 GitHub：
```bash
cd D:\university\competition\soft_design\mygo
git add .
git commit -m "add railway config"
git push
```

2. 浏览器打开 [railway.app](https://railway.app)，用 GitHub 登录

3. **New Project → Deploy from GitHub repo** → 选你的仓库

4. 等部署失败（第一次肯定会失败），然后设置：
   - Settings → **Root Directory** → 留空（railway.json 在根目录）
   - 等 Railway 自动检测到 `railway.json`

5. **添加 PostgreSQL 数据库**：
   - 点 "+ New" → Database → Add PostgreSQL
   - 等待 1 分钟，Railway 自动注入 `DATABASE_URL` 环境变量

6. **设置其他环境变量**：
   - `JWT_SECRET` → 随便填一个随机字符串
   - `YUANQI_APPID` → 你的腾讯元器 AppID
   - `YUANQI_APPKEY` → 你的腾讯元器 AppKey
   - `YUANQI_ENTERPRISE_APPID` → 企业端 AppID（如有）
   - `YUANQI_ENTERPRISE_APPKEY` → 企业端 AppKey（如有）
   - `SILICONFLOW_API_KEY` → 硅基流动 API Key（如有）

7. **触发重新部署**：
   - Deployments → Redeploy
   - 等 2-3 分钟，构建 + 部署完成

8. Railway 会给一个域名：
   ```
   https://你的项目名.up.railway.app
   ```
   打开这个地址就能用了。

### 本地测试（部署前）

```bash
# 需要先有 PostgreSQL 数据库（本地或远程）

# 设置环境变量
set DATABASE_URL=postgresql://user:pass@localhost:5432/resume_ai
set NODE_ENV=production

# 建表 + 启动
npx prisma db push
npm run build
npm start
```

## 注意

- Serverless 环境下**不能使用 SQLite**（函数实例销毁后数据丢失）
- 文件上传建议改为腾讯云 COS / AWS S3，当前版本暂时保留本地存储作为 fallback
- AI 接口超时建议云函数超时设 60 秒
