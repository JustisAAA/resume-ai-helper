# 企业面试功能

## 功能概述
企业端/HR 端发起面试邀请、查看企业面试列表、查看面试报告（含 AI 评估结果）。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| EnterpriseInterviewList.tsx | frontend/src/pages/EnterpriseInterviewList.tsx | 企业面试列表页 |
| EnterpriseInterviewRoom.tsx | frontend/src/pages/EnterpriseInterviewRoom.tsx | 企业面试房间（候选人的企业面试入口） |
| EnterpriseInterviewReport.tsx | frontend/src/pages/EnterpriseInterviewReport.tsx | 企业面试报告查看页 |
| InterviewConfigModal.tsx | frontend/src/components/InterviewConfigModal.tsx | 面试配置弹窗（用于创建面试邀请时配置参数） |
| ScoringConfigModal.tsx | frontend/src/components/ScoringConfigModal.tsx | 评分配置弹窗（HR 自定义评分标准） |
| api.ts | frontend/src/services/api.ts | 定义 enterpriseAPI（createInterview/getInterviews/getReport） |
| hrAPI.ts | frontend/src/services/hrAPI.ts | HR 端也同路径调用 enterprise/interviews 接口 |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| enterpriseInterview.ts | backend/src/routes/enterpriseInterview.ts | 企业面试路由：创建面试邀请、获取面试列表、获取面试报告 |
| services/enterpriseInterviewService.ts | backend/src/services/enterpriseInterviewService.ts | 企业面试业务逻辑：创建面试（验证申请归属）、获取企业面试列表、获取面试报告 |
| services/enterpriseAIService.ts | backend/src/services/enterpriseAIService.ts | 企业 AI 智能体：按 HR 自定义标准分析简历并打分（调用企业专属腾讯元器 APP） |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/enterprise/interviews', enterpriseInterviewRoutes)` |
| middleware/auth.ts | backend/src/middleware/auth.ts | 企业/HR 权限中间件（requireEnterprise/requireEnterpriseOrHR） |

## 数据流图（文字描述）

```
企业端 → EnterpriseInterviewList.tsx → api.ts (enterpriseAPI.getInterviews)
→ GET /api/enterprise/interviews → enterpriseInterview.ts → enterpriseInterviewService.ts
→ Prisma 查询 → 返回企业所有面试列表

企业端 → ScoringConfigModal.tsx → api.ts (enterpriseAPI.aiAnalyze)
→ POST /api/applications/:id/ai-analyze → enterpriseAIService.ts → 腾讯元器企业 AI → 返回评分结果

企业端 → InterviewConfigModal.tsx → api.ts (enterpriseAPI.createInterview)
→ POST /api/enterprise/interviews → enterpriseInterview.ts → enterpriseInterviewService.ts → Prisma 创建
→ 返回面试链接

EnterpriseInterviewReport.tsx → api.ts (enterpriseAPI.getReport)
→ GET /api/enterprise/interviews/:id/report → enterpriseInterview.ts → enterpriseInterviewService.ts
→ 返回面试报告（含 AI 评估）
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/enterprise/interviews | 创建面试邀请 | 是（ENTERPRISE） |
| GET | /api/enterprise/interviews | 获取企业面试列表 | 是（ENTERPRISE/HR） |
| GET | /api/enterprise/interviews/:id/report | 获取面试报告 | 是（ENTERPRISE/HR） |
| POST | /api/applications/:id/ai-analyze | AI 简历评分分析 | 是（ENTERPRISE） |
