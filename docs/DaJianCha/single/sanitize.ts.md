# sanitize.ts

**文件路径**: `backend/src/utils/sanitize.ts`

## 功能概述

错误对象安全化工具，在全局错误处理中将原生 Error 转换为可序列化的安全结构，避免泄露敏感堆栈信息。

## 导出函数

| 函数 | 签名 | 简述 |
|------|------|------|
| `sanitizeError` | `(error: unknown): unknown` | 将 Error 实例转换为 `{ name, message, response? }` 的安全对象；若包含 `response` 属性（axios 错误特征），则提取 `{ status, statusText, data }` |

## 关键逻辑

- **堆栈保护**：仅保留 `name` 和 `message`，不包含 `stack` 属性，防止堆栈信息泄露给客户端
- **axios 兼容**：检测 `response` 属性存在时（即 axios HTTP 错误），提取响应状态和数据，便于调试但控制暴露范围
- **通用性**：非 Error 类型原样返回，避免破坏原有数据结构

## 依赖关系

- 无外部依赖
