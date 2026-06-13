# utils/extractError.ts

**文件路径**: `backend/src/utils/extractError.ts`

## 职责概述

轻量级工具函数，从 API 错误响应或 Error 对象中提取人类可读的错误消息。统一错误消息提取逻辑，避免各模块重复编写相同的 try-catch 解析代码。

## 核心功能

### `extractApiError(error, fallback)`
- 优先返回 `error.response.data.error`（Axios 错误响应格式）
- 其次返回 `error.message`（原生 Error 对象）
- 兜底返回 `fallback` 参数（默认提示文案）

## 外部依赖

- 无

## 调用关系

- 被前端和后端中需要统一提取错误消息的模块调用
