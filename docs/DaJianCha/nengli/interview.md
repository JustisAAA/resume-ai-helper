# 模拟面试功能

## 功能概述
求职者创建 AI 模拟面试、接收面试问题、提交回答并获取实时评估、生成面试报告与评分。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| InterviewList.tsx | frontend/src/pages/InterviewList.tsx | 面试列表展示，支持按类型（PRACTICE/ENTERPRISE）筛选 |
| InterviewNew.tsx | frontend/src/pages/InterviewNew.tsx | 创建新模拟面试，选择简历、岗位、难度 |
| InterviewGuide.tsx | frontend/src/pages/InterviewGuide.tsx | 面试前准备指南页面 |
| InterviewRoom.tsx | frontend/src/pages/InterviewRoom.tsx | 面试房间，展示问题、接收回答、调用 answerStream SSE 流式交互 |
| InterviewReport.tsx | frontend/src/pages/InterviewReport.tsx | 面试报告展示，含维度评分、问题评估、建议 |
| ReportCenter.tsx | frontend/src/pages/ReportCenter.tsx | 报告中心，汇总所有面试报告 |
| InterviewConfigModal.tsx | frontend/src/components/InterviewConfigModal.tsx | 面试配置弹窗（难度、问题数、时长等） |
| api.ts | frontend/src/services/api.ts | 定义 interviewAPI（list/create/getDetail/start/answer/answerStream/generateReport/exit/delete） |
| schemas/interviewSchema.ts | frontend/src/schemas/interviewSchema.ts | 创建面试表单的 Zod 校验规则 |
| schemas/answerSchema.ts | frontend/src/schemas/answerSchema.ts | 回答表单的 Zod 校验规则 |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| interview/index.ts | backend/src/routes/interview/index.ts | 路由聚合入口，合并 list、create、full 子路由 |
| interview/list.ts | backend/src/routes/interview/list.ts | 获取面试列表（支持 ?type 过滤）和单个面试详情 |
| interview/create.ts | backend/src/routes/interview/create.ts | 创建面试记录 |
| interview/full.ts | backend/src/routes/interview/full.ts | 面试核心逻辑：开始面试、提交回答（SSE 流式）、生成报告、退出面试 |
| interview/mock.ts | backend/src/routes/interview/mock.ts | 模拟模式数据（MOCK_MODE 保底） |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/interviews', interviewRoutes)` |
| middleware/auth.ts | backend/src/middleware/auth.ts | 认证与权限校验 |
| middleware/rateLimit.ts | backend/src/middleware/rateLimit.ts | AI 调用限流 |

## 数据流图（文字描述）

```
InterviewNew.tsx → interviewSchema 校验 → api.ts (interviewAPI.create)
→ POST /api/interviews → interview/create.ts → Prisma 创建面试 → 返回面试对象

InterviewRoom.tsx → api.ts (interviewAPI.start) → POST /api/interviews/:id/start
→ interview/full.ts → 调用腾讯元器 AI 生成第一题 → SSE 返回

用户回答 → InterviewRoom.tsx → api.ts (interviewAPI.answerStream)
→ POST /api/interviews/:id/answer（SSE 流式）→ interview/full.ts
→ 腾讯元器 AI 评估回答 → 流式返回 delta/done 事件 → 前端实时展示

InterviewReport.tsx → api.ts (interviewAPI.generateReport) → POST /api/interviews/:id/report
→ interview/full.ts → AI 生成面试报告 → SSE 流式返回 progress/complete 事件
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/interviews | 获取面试列表 | 是（USER） |
| POST | /api/interviews | 创建面试 | 是（USER） |
| GET | /api/interviews/:id | 获取面试详情 | 是（USER） |
| POST | /api/interviews/:id/start | 开始面试（获取第一题） | 是（USER） |
| POST | /api/interviews/:id/answer | 提交回答（SSE 流式） | 是（USER） |
| POST | /api/interviews/:id/end | 退出/结束面试 | 是（USER） |
| POST | /api/interviews/:id/report | 生成面试报告（SSE 流式） | 是（USER） |
| DELETE | /api/interviews/:id | 删除面试 | 是（USER） |
