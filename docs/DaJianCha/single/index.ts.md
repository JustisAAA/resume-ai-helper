# index.ts

**文件路径**: `backend/src/index.ts`

## 功能概述

Express 服务入口文件，初始化 Prisma 客户端、配置中间件、注册全部 API 路由、设置静态文件服务、全局错误处理及优雅关闭。

## 主要逻辑

| 模块 | 说明 |
|------|------|
| **初始化** | 加载 `.env` 环境变量，创建 Prisma 客户端实例（`export const prisma`） |
| **中间件** | CORS（开发环境 localhost:5173，生产环境可从环境变量配置）、JSON 解析 |
| **静态文件** | `/uploads/jobs` 和 `/uploads/avatars` 公开访问（7d 缓存）；`/uploads/resumes` 需 JWT 认证（无缓存） |
| **API 路由** | 注册 14 组路由：auth、resumes、interviews、tools、admin、enterprise、jobs、applications、upload、messages、reports、users、enterprise/interviews、hr；全部挂载 `/api` 前缀并应用通用限流 `generalLimiter` |
| **404 处理** | 未匹配路由统一返回 `{ error: '接口不存在' }` |
| **全局错误处理** | 使用 `sanitizeError` 安全化错误，`AppError` 类携带 statusCode 时返回指定状态码，否则返回 500 |
| **服务启动** | 监听 `PORT`（默认 3002），日志输出地址和环境 |
| **优雅关闭** | 监听 `SIGTERM` 和 `SIGINT`，关闭 Prisma 连接后退出 |

## 路由注册清单

| 路由前缀 | 来源 |
|----------|------|
| `/api/auth` | `./routes/auth` |
| `/api/resumes` | `./routes/resume` |
| `/api/interviews` | `./routes/interview` |
| `/api/tools` | `./routes/tools` |
| `/api/admin` | `./routes/admin` |
| `/api/enterprise` | `./routes/enterprise` |
| `/api/jobs` | `./routes/job` |
| `/api/applications` | `./routes/application` |
| `/api/upload` | `./routes/upload` |
| `/api/messages` | `./routes/message` |
| `/api/reports` | `./routes/report` |
| `/api/users` | `./routes/user` |
| `/api/enterprise/interviews` | `./routes/enterpriseInterview` |
| `/api/hr` | `./routes/hr` |

## 依赖关系

- `express`、`cors`、`dotenv`：框架和配置
- `@prisma/client`：`PrismaClient` 数据库客户端
- `path`、`fs`：Node.js 内置模块
- `./middleware/auth`：`authenticateToken`（简历文件静态服务认证）
- `./middleware/rateLimit`：`generalLimiter`
- `./utils/sanitize`：`sanitizeError`
- 14 个路由模块
