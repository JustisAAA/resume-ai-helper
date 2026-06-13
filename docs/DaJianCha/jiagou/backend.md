# 后端架构报告

## 概述

本项目后端采用 **Express.js + TypeScript + Prisma ORM + SQLite** 技术栈，为 AI 面试助手提供 RESTful API 服务。后端采用三层分层架构（路由 → 服务 → 数据），包含 **9个服务模块**、**18个路由文件**（含子路由拆分）、**3个中间件**、**4个工具模块**，集成腾讯元器 AI 平台和硅基流动 API，支持求职者端模拟面试、企业端智能简历筛选、HR 子账号管理等核心业务。

## 详细分析

### 1. 技术选型

| 技术 | 版本 | 用途 |
|------|------|------|
| Express.js | 4.x | HTTP 框架 |
| TypeScript | 5.x | 类型安全 |
| Prisma | 5.x | ORM（数据库抽象层） |
| SQLite | - | 嵌入式数据库 |
| jsonwebtoken | 9.x | JWT 签发/验证 |
| bcryptjs | 2.x | 密码哈希 |
| multer | 1.x | 文件上传 |
| express-rate-limit | 7.x | 频率限制 |
| cors | 2.x | 跨域支持 |
| pdf-parse / mammoth | - | PDF/DOCX 提取文字 |

### 2. 分层架构

```
backend/src/
├── index.ts                  # 入口：Express 启动、中间件注册、路由挂载
├── config/index.ts           # 配置集中管理（JWT/密码策略/分页/上传限制/AI API）
├── middleware/                # 中间件层
│   ├── auth.ts               # 认证 + 5种角色守卫
│   ├── rateLimit.ts          # 4种频率限制
│   └── uploadMiddleware.ts    # 3种文件上传配置
├── routes/                   # 路由层（18个文件）
│   ├── auth.ts               # 注册/登录/用户管理
│   ├── resume.ts             # 简历CRUD+分析
│   ├── interview/            # 面试（拆分为 index/list/create + interview.full）
│   ├── enterprise.ts         # 企业端
│   ├── enterpriseInterview.ts# 企业面试
│   ├── hr.ts                 # HR 端
│   ├── admin.ts              # 管理员
│   ├── job.ts                # 职位管理
│   ├── application.ts        # 申请管理
│   ├── message.ts            # 消息
│   ├── report.ts             # 举报
│   ├── tools.ts              # AI 工具（匹配/问题/指南/优化/趋势）
│   ├── upload.ts             # 上传
│   └── user.ts               # 用户
├── services/                 # 服务层（9个文件）
│   ├── applicationService.ts # 申请逻辑
│   ├── creditService.ts      # 信用分
│   ├── enterpriseAIService.ts# 企业AI分析
│   ├── enterpriseInterviewService.ts
│   ├── enterpriseService.ts  # 企业管理
│   ├── hrService.ts          # HR管理
│   ├── jobService.ts         # 职位管理
│   ├── messageService.ts     # 消息
│   └── reportService.ts      # 举报
├── utils/                    # 工具层
│   ├── AppError.ts           # 自定义错误类
│   ├── extractError.ts       # 错误消息提取
│   ├── pagination.ts         # 分页参数解析
│   └── sanitize.ts           # 错误日志脱敏
└── types/
    ├── express.d.ts          # Express Request 类型扩展
    └── pdf-parse.d.ts        # pdf-parse 类型声明
```

**请求流转路径**：
```
HTTP Request → CORS → JSON解析 → 通用频率限制 → 具体路由 → 
  认证中间件 → 角色守卫 → 路由处理函数 → 服务层 → Prisma → SQLite
```

### 3. 中间件链设计

中间件按 `app.use()` 注册顺序执行：

```
① cors             → 跨域（开发 localhost:5173，生产可配置）
② express.json()   → JSON 请求体解析
③ generalLimiter   → 全局频率限制（100次/分钟）
④ 静态文件服务      → /uploads/jobs, /uploads/avatars（公）
                     → /uploads/resumes（需 authenticateToken）
⑤ 路由级别中间件：
   └─ authenticateToken → JWT 验证 → 挂载 req.user
   └─ requireAdmin / requireEnterprise / requireUser / requireHR
   └─ requireEnterpriseOrHR（联合角色）
   └─ loginLimiter（15分钟5次）/ registerLimiter（15分钟3次）/ aiLimiter（1分钟20次）
⑥ 404 处理
⑦ 全局错误处理中间件（捕获 AppError 和未预期错误）
```

**5种角色守卫函数**（`middleware/auth.ts`）：
| 守卫 | 允许的角色 | 典型路由 |
|------|-----------|---------|
| `requireAdmin` | ADMIN | `/api/admin/*` |
| `requireEnterprise` | ENTERPRISE | `/api/enterprise/*`, `/api/jobs/*`（写操作） |
| `requireUser` | USER | `/api/interviews/*`, `/api/resumes/*` |
| `requireHR` | HR | `/api/hr/*` |
| `requireEnterpriseOrHR` | ENTERPRISE, HR | `/api/enterprise/interviews/*` |

### 4. RESTful API 设计风格

采用标准的 RESTful 风格：
- **资源路径**：`/api/{resource}`
- **HTTP 方法**：GET（查）、POST（增）、PUT（全量更新）、PATCH（部分更新）、DELETE（删）
- **响应格式**：统一 JSON `{ key: value }` 或 `{ data, pagination }`
- **错误格式**：`{ error: "错误消息" }` 或 `{ error: "消息", details: [...] }`（参数校验）
- **认证方式**：`Authorization: Bearer <token>`

### 5. Prisma ORM 使用方法

- **数据库**：SQLite（文件 `prisma/dev.db`）
- **Schema**：11个模型 + 10个枚举（`prisma/schema.prisma`）
- **查询模式**：
  - `prisma.user.findUnique({ where: { email } })`
  - `prisma.interview.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take, include: { resume: {...} } })`
  - `prisma.$transaction()` 用于批量操作
- **迁移**：`prisma generate` 编译客户端代码

### 6. AI 服务集成

双 AI 平台策略，通过 `.env` 中的 `MOCK_MODE=true` 控制是否真正调用 API：

**腾讯元器**（主 AI）：
- 求职者端智能体：`YUANQI_APPID / YUANQI_APPKEY`
- 企业端招聘 AI 助手：`YUANQI_ENTERPRISE_APPID / YUANQI_ENTERPRISE_APPKEY`
- 端点：`https://yuanqi.tencent.com/openapi/v1/agent/chat/completions`
- 使用场景：面试问答、简历分析评分

**硅基流动**（备用）：
- `SILICONFLOW_API_KEY / SILICONFLOW_BASE_URL`
- 在 `tools.ts` 路由中作为备选 AI 源

`enterpriseAIService.ts` 实现了企业端 AI 评分核心逻辑：
- `analyzeResumeWithConfig()`：根据 HR 自定义的评分标准分析简历
- `analyzeApplicationResume()`：查数据库 → 提取简历内容 → AI 分析 → 结果存回 `aiAnalysis` 字段

### 7. 错误处理机制

两层错误处理：

**自定义错误类**（`utils/AppError.ts`）：
```typescript
export class AppError extends Error {
  constructor(public statusCode: number, message: string) { ... }
}
```

**全局错误中间件**（`index.ts`）：
```typescript
app.use((err, req, res, next) => {
  console.error('[服务端错误]', sanitizeError(err));
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : '服务器内部错误';
  res.status(statusCode).json({ error: message });
});
```

**错误日志脱敏**（`utils/sanitize.ts`）：提取错误名称、消息、HTTP 响应状态，过滤敏感信息。

### 8. 文件上传架构

基于 `multer` 实现，3种上传配置：

| 上传类型 | 目标目录 | 大小限制 | 允许格式 | 认证 |
|---------|---------|---------|---------|------|
| 职位图片 | `uploads/jobs/` | 5MB | JPG/PNG/WebP | 需要企业权限 |
| 简历文件 | `uploads/resumes/` | 10MB | PDF/DOCX | 需要用户权限 |
| 企业Logo | `uploads/logos/` | 2MB | JPG/PNG/WebP/SVG | 需要企业权限 |
| 头像 | `uploads/avatars/` | 2MB | 图片 | 需要登录 |

文件名规则：`${时间戳}-${随机字符串}${扩展名}`。

静态文件服务：
- `/uploads/jobs` 和 `/uploads/avatars`：公开，7天缓存
- `/uploads/resumes`：需 `authenticateToken` 中间件保护，无缓存

### 9. 分页方案

统一分页工具（`utils/pagination.ts`）：
- `parsePagination({ page?, limit? })` → `{ page, limit, skip }`
- 默认每页 20 条，最大 100 条
- `buildPagination(page, limit, total)` → `{ page, limit, total, totalPages }`

所有列表路由返回格式：
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 10. 双Token认证（用户Token + HR Token）

系统有两个独立 Token 系统：

**用户 Token**（`POST /api/auth/login` & `POST /api/enterprise/login`）：
- JWT Payload：`{ userId, email, role }`
- 过期时间：7天
- 存储位置：`localStorage('token')`

**HR Token**（`POST /api/hr/login`）：
- 独立的 JWT 签发逻辑
- 存储位置：`localStorage('hrToken')` + `localStorage('hrUser')`
- 前端 HRRoute 守卫同时验证 token 存在性和 `hrUser.role === 'HR'`

## 评价

### 优点
1. **分层架构清晰**：路由层薄（参数校验+调用服务），业务逻辑集中在服务层，职责分离好
2. **中间件链精细**：认证→角色→限流三层独立可组合，灵活配置
3. **配置集中管理**：`config/index.ts` 统一管理所有常量，消除重复代码
4. **AI 双平台容灾**：腾讯元器主 + 硅基流动备，Mock 模式可离线开发
5. **错误处理完善**：自定义 `AppError` 类 + 全局错误中间件 + 日志脱敏

### 不足
1. **部分路由未拆分**：如 `resume.ts` 单文件过长，`interview.full.ts` 混杂待拆分
2. **缺少请求参数校验**：未使用 Joi/Zod 等校验库，手动校验代码重复
3. **类型安全性不足**：多处使用 `any` 类型，`prisma` 类型未充分利用
4. **无请求日志中间件**：缺少统一的请求/响应日志记录

### 改进建议
1. 引入 **Zod** 或 **Joi** 做请求参数校验，替代手写 `if` 判断
2. 将 `resume.ts` 和 `interview.full.ts` 按功能拆分子路由
3. 添加 **Winston** 或 **Pino** 日志库，统一日志格式和级别
4. 添加请求 ID 追踪（`uuid` + `cls-hooked`），便于排查生产问题
