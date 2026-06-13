# types/express.d.ts

**文件路径**: `backend/src/types/express.d.ts`

## 职责概述

Express 框架的类型声明扩展模块。通过在全局 `Express.Request` 命名空间上添加自定义属性，使得整个后端代码中无需额外类型断言即可访问 `req.user`、`req.userId`、`req.file`。

## 核心功能

### 类型扩展
- **`Request.user`**: 当前登录用户信息对象，包含 `userId`、`email`、`role`，由 `authenticateToken` 中间件挂载
- **`Request.userId`**: 当前登录用户 ID 字符串，由 auth 中间件添加，保留向后兼容
- **`Request.file`**: 上传的单个文件，由 `multer.single()` 添加

### 设计要点
- 使用 `declare namespace Express { interface Request { ... } }` 语法进行声明合并
- `user` 标记为可选（`?`），未认证的请求中不存在该字段
- `file` 暂用 `any` 类型规避 multer 类型复杂性

## 外部依赖

- `express`（全局命名空间扩展）

## 调用关系

- 被所有路由处理器和服务层隐式引用（通过 TypeScript 自动合并声明）
- 与 `middleware/auth.ts` 配合使用（中间件负责挂载 `user` 对象）
