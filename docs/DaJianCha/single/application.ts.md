# application.ts (routes)

**文件路径**: backend/src/routes/application.ts

## 职责概述
投递申请管理路由，支持更新申请状态、查看简历和详情。

## 代码质量分析

### 优点
- 从 applicationService 导入服务函数
- 使用 Prisma 枚举 ApplicationStatus
- 权限控制完善（requireEnterprise）

### 问题
- req.user 使用 `(req as any)` 类型断言，未使用 AuthRequest 类型

## 依赖关系
- 导入 services: applicationService
- 导入 middleware: auth
