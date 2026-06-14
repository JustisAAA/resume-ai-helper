# 简历面试AI助手 - 部署版本 (backend2)

本目录是部署优化的后端版本。与 `backend/` 的区别：

| 特性 | backend (开发版) | backend2 (部署版) |
|------|:----------------:|:----------------:|
| 前端托管 | 独立 Vite 开发服务器 | 后端统一托管静态文件 |
| CORS | 仅允许 localhost:5173 | 生产模式允许同源/配置 |
| 启动方式 | npm run dev | npm run deploy:start |
| 依赖 | 含测试工具链 | 精简至生产必需 |

---

## 部署到 VPS（推荐方案）

### 前置条件
- 一台 Linux 服务器（Ubuntu 20.04+），开放 80 端口
- Node.js 18+ 已安装
- 域名（可选）

### 一键部署

```bash
# 1. 服务器上拉代码
git clone <你的仓库地址> mygo
cd mygo/backend2

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，主要修改 JWT_SECRET 和 AI API 密钥

# 3. 安装依赖 + 初始化数据库 + 编译
npm run deploy:setup

# 4. 构建前端 + 启动
npm run deploy:start
# 服务会启动在 http://0.0.0.0:3002
```

### Nginx 反向代理（推荐，用 80 端口）

创建 `/etc/nginx/sites-available/mygo`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket 支持（AI 面试流式响应）
    location /api/interviews/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
ln -s /etc/nginx/sites-available/mygo /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### PM2 进程守护

```bash
npm install -g pm2
NODE_ENV=production pm2 start dist/index.js --name resume-ai
pm2 save
pm2 startup  # 设置开机自启
```

---

## 部署到 Railway（免费方案）

Railway 提供每月 $5 免费额度，适合比赛演示。

### 步骤

1. Fork 代码到 GitHub
2. 在 [Railway](https://railway.app) 创建项目
3. 连接 GitHub 仓库
4. 设置环境变量（参照 `.env.example`）
5. Railway 自动检测 `package.json` 中的 `start` 脚本

**注意**：免费方案需要将 SQLite 换成 PostgreSQL。修改 `prisma/schema.prisma` 中的数据库提供者。如需帮助请单独咨询。

---

## 健康检查

部署后访问以下地址确认服务正常运行：

```
GET /health

响应：
{
  "status": "ok",
  "timestamp": "2026-06-13T...",
  "version": "0.1.0",
  "environment": "production"
}
```

---

## 常见问题

**Q: 前端页面访问空白？**
A: 确保 `cd ../frontend && npm install && npm run build` 已执行，且 `frontend/dist/` 目录存在。

**Q: 数据库在哪？**
A: 默认在 `backend2/prisma/dev.db`。生产环境建议定期备份。

**Q: AI 面试不可用？**
A: 检查 `.env` 中的 `YUANQI_*` 和 `SILICONFLOW_*` 配置是否正确。
