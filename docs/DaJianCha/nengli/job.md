# 职位管理功能

## 功能概述
企业发布/编辑/删除职位，求职者浏览职位列表与详情，支持关键词搜索与分类筛选。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| EnterpriseJobs.tsx | frontend/src/pages/EnterpriseJobs.tsx | 企业端职位管理列表页 |
| EnterpriseJobEdit.tsx | frontend/src/pages/EnterpriseJobEdit.tsx | 企业端职位创建/编辑页 |
| JobList.tsx | frontend/src/pages/JobList.tsx | 求职者端职位列表搜索与浏览 |
| JobDetail.tsx | frontend/src/pages/JobDetail.tsx | 职位详情展示页 |
| JobApply.tsx | frontend/src/pages/JobApply.tsx | 求职者岗位申请页面 |
| api.ts | frontend/src/services/api.ts | 定义 jobAPI（create/list/getDetail/update/delete/updateStatus）和 enterpriseAPI |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| job.ts | backend/src/routes/job.ts | 职位路由：创建/列表/详情/更新/删除/状态更新，以及职位下申请列表获取 |
| services/jobService.ts | backend/src/services/jobService.ts | 职位业务逻辑：CRUD（含事务创建 HR 子账号）、列表查询分页 |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/jobs', jobRoutes)` |
| middleware/auth.ts | backend/src/middleware/auth.ts | 企业权限校验（requireEnterprise） |
| utils/pagination.ts | backend/src/utils/pagination.ts | 分页工具函数 |

## 数据流图（文字描述）

```
企业端 → EnterpriseJobEdit.tsx → api.ts (jobAPI.create) → POST /api/jobs
→ job.ts → jobService.ts (createJob 事务：创建职位 + HR用户 + HR账号) → 返回职位

求职者 → JobList.tsx → api.ts (jobAPI.list) → GET /api/jobs?keyword=&location=&type=
→ job.ts → jobService.ts (getJobs) → Prisma 查询 → 返回职位列表（公开）

求职者 → JobDetail.tsx → api.ts (jobAPI.getDetail) → GET /api/jobs/:id
→ job.ts → jobService.ts (getJobById) → 返回职位详情（含企业信息）

企业端 → EnterpriseJobs.tsx → api.ts (jobAPI.update/delete/updateStatus)
→ PUT/DELETE/PATCH /api/jobs/:id → job.ts → jobService.ts → 更新/删除职位
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/jobs | 创建职位 | 是（ENTERPRISE） |
| GET | /api/jobs | 获取职位列表 | 否 |
| GET | /api/jobs/:id | 获取职位详情 | 否 |
| PUT | /api/jobs/:id | 更新职位 | 是（ENTERPRISE） |
| DELETE | /api/jobs/:id | 删除职位（软删除） | 是（ENTERPRISE） |
| PATCH | /api/jobs/:id/status | 更新职位状态 | 是（ENTERPRISE） |
| GET | /api/jobs/:jobId/applications | 获取职位申请列表 | 是（ENTERPRISE） |
