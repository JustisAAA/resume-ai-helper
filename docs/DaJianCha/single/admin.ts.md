# admin.ts (routes)

**文件路径**: backend/src/routes/admin.ts

## 职责概述
管理员路由模块，提供系统统计、用户管理、企业审核和举报处理功能。

## 代码质量分析

### 优点
- 使用 Prisma 聚合查询（count、groupBy）高效获取统计
- 权限控制严格（requireAdmin）
- Promise.all 并行查询优化性能

### 问题
- 用户管理和企业管理的查询逻辑未使用服务层

## 依赖关系
- 导入 middleware: auth
- 导入 utils: sanitize
