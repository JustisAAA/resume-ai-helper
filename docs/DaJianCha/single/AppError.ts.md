# AppError.ts

**文件路径**: `backend/src/utils/AppError.ts`

## 功能概述

统一应用错误类，继承自 `Error`，为 Express 全局错误处理提供标准化的 HTTP 状态码和错误消息结构。

## 导出类

| 导出项 | 签名 | 简述 |
|--------|------|------|
| `AppError` | `class extends Error` | 构造时接收 `statusCode: number` 和 `message: string`，设置 `name = 'AppError'` |

## 关键逻辑

- **与全局错误处理中间件协作**：Express 全局错误处理（`index.ts:97`）根据 `err.statusCode` 是否存在决定返回客户端的状态码和消息——有则使用 `err.statusCode` 和 `err.message`，无则返回 500 + `服务器内部错误`
- **简化路由层错误抛出**：路由层抛出 `throw new AppError(400, '参数错误')` 即可被全局错误处理捕获并正确响应

## 依赖关系

- 无外部依赖
