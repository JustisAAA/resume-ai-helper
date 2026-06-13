# auth.ts (routes)

**文件路径**: backend/src/routes/auth.ts

## 职责概述
认证路由模块，管理登录、注册、头像上传、资料更新等用户认证相关接口。

## 代码质量分析

### 优点
- 使用了 bcrypt 密码加密和 jwt 令牌签发
- 集成 rateLimit 和 authenticateToken 中间件
- 头像上传使用 multer 且自动创建目录
- 参数校验基本覆盖

### 问题
- 注册和登录逻辑耦合在同一文件
- 错误处理使用 sanitizeError 但部分直接抛出

## 依赖关系
- 导入 services: prisma
- 导入 middleware: rateLimit, auth
- 导入 utils: sanitize
