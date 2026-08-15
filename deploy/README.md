# 简历面试AI助手 - 腾讯云轻量服务器部署指南

## 一、部署架构

```
用户浏览器
    │  http://IP:3002
    ▼
Docker容器: resume-ai-app（Node.js + Express）
    │  ├─ 托管前端静态文件（frontend/dist）
    │  ├─ REST API（/api/*）
    │  └─ 文件上传（/uploads/*）
    │
    ▼
Docker容器: resume-ai-db（PostgreSQL 16）
```

**为什么用 Docker Compose：**
- 前端后端一体，一个容器搞定（与现有架构一致）
- PostgreSQL 独立容器，数据持久化
- 一键启停，服务器重启自动恢复

## 二、前置条件

| 项目 | 要求 |
|------|------|
| 腾讯云轻量应用服务器 | 2核2G 及以上 |
| 操作系统 | Ubuntu 22.04（推荐）/ Debian / CentOS |
| 带宽 | 3Mbps 及以上（演示够用）|
| 学生认证 | 腾讯云学生认证（学信网在线核验）|

## 三、部署步骤

### 第1步：上传代码到服务器

```bash
# 方式一：git clone（推荐，方便更新）
cd /root
git clone <你的仓库地址> resume-ai-helper
cd resume-ai-helper/deploy

# 方式二：本地打包上传
# 在本地执行：
#   tar czf resume-ai-helper.tar.gz --exclude=node_modules --exclude=dist mygo/
# 上传到服务器后解压
```

### 第2步：修改配置

编辑 `docker-compose.yml`，必改3处：

| 配置项 | 位置 | 说明 |
|--------|------|------|
| 数据库密码 | `POSTGRES_PASSWORD` 和 `DATABASE_URL` | 改成自己的强密码 |
| JWT密钥 | `JWT_SECRET` | 随机长字符串 |
| 元器API | `YUANQI_*` 四个变量 | 从 Railway 环境变量复制 |

### 第3步：一键部署

```bash
chmod +x deploy.sh
sudo bash deploy.sh
```

脚本会自动：装 Docker → 装 Compose → 构建镜像 → 启动服务

### 第4步：验证

```bash
# 查看状态
docker compose ps

# 查看日志
docker compose logs -f app
```

浏览器访问 `http://服务器IP:3002` 即可。

## 四、数据持久化

| 数据 | 存储位置 | 说明 |
|------|---------|------|
| PostgreSQL数据 | Docker卷 `db-data` | 删除容器不丢失 |
| 上传文件 | Docker卷 `upload-data` | 头像/职位图/简历文件 |

## 五、常用运维命令

```bash
docker compose ps          # 查看状态
docker compose logs -f app # 查看应用日志
docker compose restart app # 重启应用
docker compose down        # 停止所有服务（数据保留）
docker compose up -d       # 重新启动
docker compose pull        # 更新镜像后
```

## 六、可选：域名 + HTTPS

若需要域名访问（比赛填域名更好看）：

```nginx
# /etc/nginx/conf.d/resume-ai.conf
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        # SSE流式传输需要关闭缓冲
        proxy_buffering off;
        proxy_cache off;
    }
}
```

```bash
# 安装nginx并重启
apt install -y nginx
nginx -t && systemctl restart nginx

# HTTPS（可选，用certbot）
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

> ⚠️ 域名 + 国内服务器需 ICP 备案（约7-20天）。比赛时间紧可先用 IP 访问，或用海外域名（如 .dev/.app 域名无需备案）。

## 七、从 Railway 迁移数据（可选）

### 迁移数据库：
```bash
# 在本地（有Railway数据时）
# 1. 导出：pg_dump "railway的连接串" > backup.sql
# 2. 导入：
docker compose exec -T db psql -U resume_ai -d resume_ai < backup.sql
```

### 迁移上传文件：
- Railway 上 `/uploads` 目录内容 → 复制到服务器 Docker 卷
- 或通过管理员后台重新上传

## 八、常见问题

| 问题 | 解决方案 |
|------|---------|
| 端口3002被占用 | `docker compose down` 后重试 |
| 数据库连接失败 | 检查 docker-compose.yml 密码是否一致 |
| 上传文件重启丢失 | 确认 upload-data 卷挂载正常 |
| 访问慢 | 检查带宽、确认走国内节点 |
