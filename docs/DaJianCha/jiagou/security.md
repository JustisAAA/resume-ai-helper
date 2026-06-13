# 安全设计报告

## 概述

本项目安全设计涵盖了 **认证授权**、**频率限制**、**密码安全**、**数据脱敏**、**文件安全** 等多个维度。采用 JWT 双 Token 系统（用户 Token + HR Token）实现无状态认证，5 种角色守卫实现细粒度权限控制，4 种频率限制防范滥用，bcryptjs 保障密码存储安全。

## 详细分析

### 1. JWT 双 Token 认证

系统维护两个独立的 JWT Token 体系：

**用户 Token**：
- 签发接口：`POST /api/auth/login`、`POST /api/enterprise/login`
- 载荷：`{ userId, email, role }`（EXPRESS 用户/企业/管理员）
- 密钥：`JWT_SECRET`（环境变量，启动时校验不为空）
- 过期时间：`7d`（config 中硬编码）
- 签名算法：HS256（jsonwebtoken 默认）
- 存储位置：前端 `localStorage('token')`

**HR Token**：
- 签发接口：`POST /api/hr/login`
- 载荷：类似用户 Token，但 role 限定为 HR
- 存储位置：前端 `localStorage('hrToken')` + `localStorage('hrUser')`
- HR 登录独立于用户登录体系，前端 HRRoute 守卫同时验证 token 和角色

**验证流程**（`authenticateToken` 中间件）：
```
请求 → 提取 Authorization: Bearer <token>
     → jwt.verify(token, JWT_SECRET) 验证签名和过期
     → 查数据库 User 表，检查 status !== 'BANNED'
     → req.user = { userId, email, role }
     → next()
```

**安全问题**：
- Token 过期时间 7 天较长，无法手动吊销（无黑名单机制）
- 无 refresh token 机制，过期后仅能重新登录
- 密钥存储在环境变量，启动时校验但未强制要求生产环境更换

### 2. 5 种角色权限守卫

在 `middleware/auth.ts` 中定义了 5 种守卫函数，必须配合 `authenticateToken` 使用：

| 守卫 | 检查逻辑 | 错误响应 |
|------|---------|---------|
| `requireAdmin` | `req.user.role !== 'ADMIN'` | 403 + "权限不足，需要管理员权限" |
| `requireEnterprise` | `req.user.role !== 'ENTERPRISE'` | 403 + "权限不足，需要企业权限" |
| `requireUser` | `req.user.role !== 'USER'` | 403 + "该功能仅限求职者使用" |
| `requireHR` | `req.user.role !== 'HR'` | 403 + "需要HR权限" |
| `requireEnterpriseOrHR` | 既非 ENTERPRISE 也非 HR | 403 + "需要企业或HR权限" |

守卫在路由中的组合模式：`router.get('/admin/stats', authenticateToken, requireAdmin, handler)`

### 3. 4 种频率限制

在 `middleware/rateLimit.ts` 中定义（基于 `express-rate-limit`）：

| 限流器 | 窗口 | 上限 | 用途 |
|--------|------|------|------|
| `generalLimiter` | 1分钟 | 100次 | 全局 API 调用 |
| `loginLimiter` | 15分钟 | 5次 | 登录防暴力破解 |
| `registerLimiter` | 15分钟 | 3次 | 注册防恶意批量 |
| `aiLimiter` | 1分钟 | 20次 | AI 调用防滥用，控制成本 |

全局限流器在 `index.ts` 中挂载在 `/api` 路径，其他限流器在具体路由中按需使用（如 `router.post('/register', registerLimiter, handler)`）。

### 4. 密码加密

使用 `bcryptjs` 实现密码安全存储：

- **加密轮数**：`BCRYPT_SALT_ROUNDS = 10`（在 `config/index.ts` 中配置）
- **存储字段**：`User.passwordHash`（已哈希，非明文）
- **密码策略**（服务端校验）：
  - 最小长度：8位（`PASSWORD_MIN_LENGTH`）
  - 复杂度：必须包含大小写字母和数字
- **验证方式**：`bcrypt.compare(password, user.passwordHash)`

**安全性分析**：salt rounds = 10（约 10 次哈希迭代），在 2025 年属于中等安全级别。对于 SQLite 本地数据库场景已足够。

### 5. 日志脱敏

在 `utils/sanitize.ts` 中实现：

```typescript
export function sanitizeError(error: unknown): unknown {
  if (error instanceof Error) {
    const sanitized = {
      name: error.name,
      message: error.message,
    };
    // 如果有 HTTP 响应，提取 status/statusText/data，不包含 headers（可能含 token）
    if ('response' in error) {
      sanitized.response = {
        status: resp?.status,
        statusText: resp?.statusText,
        data: resp?.data,
      };
    }
    return sanitized;
  }
  return error;
}
```

所有路由的 catch 块中统一使用 `sanitizeError(error)` 处理错误日志，避免敏感信息泄露。

### 6. 文件上传校验

在 `middleware/uploadMiddleware.ts` 中实现多维度校验：

**文件类型校验**（白名单模式）：
| 上传类型 | 允许的 MIME 类型 |
|---------|----------------|
| 职位图片 | `image/jpeg`, `image/png`, `image/webp` |
| 简历文件 | `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| 企业Logo | `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` |

**文件大小限制**：
| 上传类型 | 大小限制 |
|---------|---------|
| 头像 | 2MB |
| 职位图片 | 5MB |
| 简历文件 | 10MB |
| 企业Logo | 2MB |

**文件名安全**：使用 `Date.now() + random string` 生成唯一文件名，避免路径遍历和文件名冲突。

**静态文件服务**：简历文件路径受 `authenticateToken` 中间件保护。

### 7. XSS/CSRF 防护现状

**XSS 防护**：
- React 默认对 JSX 插值进行 HTML 转义（`{}` 中的内容自动 escape）
- 未使用 `dangerouslySetInnerHTML`（除非特殊场景）
- 后端返回 JSON，不直接渲染 HTML

**CSRF 防护**：
- 无专门 CSRF Token 机制
- 依赖 CORS 配置（开发环境限定 `localhost:5173`）
- API 使用 `Authorization: Bearer Token` 方式，不存在 Cookie 自动携带问题

**潜在风险**：
- 未设置 `helmet` 等安全 HTTP 头中间件
- 头像 URL 未做 MIME 校验
- 无 SQL 注入风险（Prisma ORM 使用参数化查询）

## 评价

### 优点
1. **密码策略严格**：长度 + 复杂度 + bcrypt 哈希（salt rounds=10）
2. **频率限制完备**：4 种限流覆盖全局、登录、注册、AI 调用
3. **角色守卫粒度细**：5 种守卫满足多角色业务需求
4. **文件校验严谨**：白名单 MIME 类型 + 大小限制 + 唯一文件名
5. **日志脱敏到位**：统一 sanitize 处理，敏感字段被过滤

### 不足
1. **JWT token 不可吊销**：无黑名单机制，被封禁用户的 token 仍有效直到过期
2. **无 refresh token**：7 天超长有效期增加泄露风险
3. **缺少 HTTP 安全头**：未配置 CSP、HSTS、X-Frame-Options 等
4. **无请求体/响应体脱敏**：用户敏感信息（email 等）在某些 API 响应中明文传输

### 改进建议
1. 引入 **Token 黑名单**（Redis 或数据库表），支持手动吊销被封禁用户的 Token
2. 实现 **Refresh Token** 机制：access token 15 分钟 + refresh token 7 天
3. 添加 `helmet` 中间件配置安全 HTTP 头（CSP, HSTS, X-Frame-Options 等）
4. 用户列表 API 中对 email/phone 等敏感字段做脱敏处理（如 `a***@example.com`）
5. 对头像上传添加 MIME 校验（读取文件头魔数），防止伪装上传
