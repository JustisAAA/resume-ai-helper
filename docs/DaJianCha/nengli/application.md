# 投递申请功能

## 功能概述
求职者投递简历到职位、企业/HR 查看收到的申请列表与简历详情、更新申请状态（筛选/面试/录用/拒绝）、支持 AI 简历评分分析。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| MyApplications.tsx | frontend/src/pages/MyApplications.tsx | 求职者端我的申请列表页 |
| EnterpriseApplications.tsx | frontend/src/pages/EnterpriseApplications.tsx | 企业端收到的申请管理列表 |
| EnterpriseResumeDetail.tsx | frontend/src/pages/EnterpriseResumeDetail.tsx | 企业端查看申请者的简历详情 |
| HRApplications.tsx | frontend/src/pages/HRApplications.tsx | HR 端申请列表管理 |
| HRResumeDetail.tsx | frontend/src/pages/HRResumeDetail.tsx | HR 端查看申请者简历详情 |
| api.ts | frontend/src/services/api.ts | 定义 enterpriseAPI（getApplications/updateStatus/getResume/aiAnalyze）和 Application 接口类型 |
| hrAPI.ts | frontend/src/services/hrAPI.ts | HR 端申请相关接口（getApplications/getResume/updateStatus/aiAnalyze） |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| application.ts | backend/src/routes/application.ts | 申请相关路由：更新状态、获取简历详情、获取申请详情 |
| services/applicationService.ts | backend/src/services/applicationService.ts | 申请业务逻辑：按职位获取申请列表、更新状态、获取简历详情、获取申请详情 |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/applications', applicationRoutes)` |
| middleware/auth.ts | backend/src/middleware/auth.ts | 企业权限校验（requireEnterprise） |

## 数据流图（文字描述）

```
求职者 → JobApply.tsx → api.ts → POST /api/applications（通过 job 路由创建）
→ 后端创建申请记录 → 返回申请结果 → MyApplications.tsx 展示

企业/HR → EnterpriseApplications.tsx / HRApplications.tsx
→ api.ts / hrAPI.ts → GET /api/jobs/:jobId/applications 或 GET /api/hr/applications
→ applicationService.ts → Prisma 查询 → 返回申请列表（含简历、求职者信息）

企业/HR → EnterpriseResumeDetail.tsx / HRResumeDetail.tsx
→ api.ts / hrAPI.ts → GET /api/applications/:id/resume → applicationService.ts → 返回简历详情

企业/HR → 更新状态 → api.ts (enterpriseAPI.updateStatus)
→ PATCH /api/applications/:id/status → application.ts → applicationService.ts → 更新 Prisma

企业/HR → AI 分析 → api.ts / hrAPI.ts (aiAnalyze)
→ POST /api/applications/:id/ai-analyze → enterpriseAIService.ts → 腾讯元器企业 AI → 返回评分
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/jobs/:jobId/applications | 获取职位下所有申请（企业端） | 是（ENTERPRISE） |
| PATCH | /api/applications/:id/status | 更新申请状态 | 是（ENTERPRISE） |
| GET | /api/applications/:id/resume | 获取申请关联的简历详情 | 是（ENTERPRISE） |
| GET | /api/applications/:id | 获取申请详情 | 是（ENTERPRISE） |
| POST | /api/applications/:id/ai-analyze | AI 简历评分分析 | 是（ENTERPRISE） |
| GET | /api/hr/applications | HR 端获取申请列表 | 是（HR） |
| GET | /api/hr/applications/:id/resume | HR 端获取简历详情 | 是（HR） |
| PUT | /api/hr/applications/:id/status | HR 端更新申请状态 | 是（HR） |
