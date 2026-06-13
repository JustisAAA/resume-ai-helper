# job.ts (routes)

**文件路径**: backend/src/routes/job.ts

## 职责概述
职位管理路由，支持职位的 CRUD 操作、状态变更和投递数量统计。

## 代码质量分析

### 优点
- 从 jobService 和 applicationService 导入服务函数
- 使用 Prisma 枚举 JobStatus
- CRUD 接口完整

### 问题
- 列表查询缺少搜索和过滤参数
- 创建职位时直接操作 prisma 而非通过 service

## 依赖关系
- 导入 services: jobService, applicationService
- 导入 middleware: auth
