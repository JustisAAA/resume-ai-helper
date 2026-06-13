# rateLimit.ts

**文件路径**: `backend/src/middleware/rateLimit.ts`

## 功能概述

基于 `express-rate-limit` 的请求频率限制中间件集合，按场景细分为登录、注册、AI 调用、通用 API 四档限流策略。

## 导出中间件列表

| 导出项 | 限流策略 | 简述 |
|--------|----------|------|
| `loginLimiter` | 15 分钟内 5 次 | 登录接口限流，防止暴力破解密码 |
| `registerLimiter` | 15 分钟内 3 次 | 注册接口限流，防止恶意批量注册 |
| `aiLimiter` | 1 分钟内 20 次 | AI 分析接口限流，控制 API 调用成本 |
| `generalLimiter` | 1 分钟内 100 次 | 通用 API 限流，基础防滥用保护 |

## 关键逻辑

- **差异化窗口**：登录/注册使用 15 分钟长窗口（低阈值），AI 调用使用 1 分钟窗口（中等阈值），通用 API 使用 1 分钟窗口（高阈值）
- **标准响应**：超出限制时返回 `{ error: '...' }` 格式的错误消息
- **标准头**：启用 `standardHeaders: true` 返回 RateLimit-* 标准响应头，便于客户端感知

## 依赖关系

- `express-rate-limit`：第三方限流中间件
