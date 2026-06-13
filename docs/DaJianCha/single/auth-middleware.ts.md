# auth-middleware.ts

**文件路径**: `backend/src/middleware/auth.ts`

## 功能概述

Express 认证与授权中间件集合，提供 JWT Token 验证、角色权限守卫（管理员/企业/求职者/HR/企业或HR）功能。

## 导出类型与函数

| 导出项 | 签名 | 简述 |
|--------|------|------|
| `AuthRequest` | `interface` | 扩展 Express Request 类型，添加 `user?: { userId, email, role }` 字段 |
| `authenticateToken` | `(req, res, next): Promise<void>` | 认证中间件：从 Authorization Header 解析 Bearer Token，验证 JWT，查询数据库确认用户有效且未被封禁，将用户信息挂载到 `req.user` |
| `requireAdmin` | `(req, res, next): void` | 管理员守卫：检查 `req.user.role === 'ADMIN'` |
| `requireEnterprise` | `(req, res, next): void` | 企业守卫：检查 `req.user.role === 'ENTERPRISE'` |
| `requireUser` | `(req, res, next): void` | 求职者守卫：检查 `req.user.role === 'USER'` |
| `requireHR` | `(req, res, next): void` | HR 守卫：检查 `req.user.role === 'HR'` |
| `requireEnterpriseOrHR` | `(req, res, next): void` | 联合守卫：检查 `req.user.role === 'ENTERPRISE' \|\| req.user.role === 'HR'` |

## 关键逻辑

- **双层验证**：`authenticateToken` 先 JWT 解码确保 Token 有效，再查数据库确认用户存在且 `status !== 'BANNED'`，避免已封禁用户使用未过期 Token
- **中间件链式调用**：角色守卫（requireAdmin 等）必须在 `authenticateToken` 之后使用，通过 `req.user` 获取已验证的用户信息
- **标准 HTTP 状态码**：未登录返回 401，权限不足返回 403，Token 过期返回 401

## 依赖关系

- `jsonwebtoken`：Token 验证
- `prisma`（从 `../index` 导入）：查询用户状态
- `../config`：`JWT_SECRET`
