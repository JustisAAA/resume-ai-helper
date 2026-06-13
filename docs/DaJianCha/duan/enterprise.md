# 企业端功能报告

## 概述

企业端面向招聘企业用户，提供完整的招聘管理解决方案。企业用户可以通过该端管理企业资料、发布和管理职位、查看求职者投递、AI 智能简历评分筛选、安排 AI 面试、查看面试报告、数据分析统计以及与求职者消息沟通等功能，实现招聘流程的智能化与高效化。

## 功能模块清单

| 功能 | 页面文件 | API文件 | 描述 |
|------|---------|--------|------|
| 企业注册 | EnterpriseRegister.tsx | api.ts (enterpriseAPI.register) | 企业账号注册，填写企业基本信息 |
| 企业登录 | EnterpriseLogin.tsx | api.ts (enterpriseAPI.login) | 企业账号登录，独立认证体系 |
| 营销门户 | EnterpriseMarketing.tsx | — | 展示 AI 招聘功能卖点的落地页 |
| 企业仪表盘 | EnterpriseDashboard.tsx | api.ts (enterpriseAPI.getDashboardStats) | 展示招聘漏斗数据、申请趋势、职位热度等统计数据 |
| 职位管理 | EnterpriseJobs.tsx | api.ts (jobAPI.list, enterpriseAPI.getProfile) | 查看企业所有职位列表，支持编辑/删除/切换状态 |
| 职位编辑 | EnterpriseJobEdit.tsx | api.ts (jobAPI.create/update) | 新建/编辑职位（标题、描述、要求、薪资、地点等） |
| 投递管理 | EnterpriseApplications.tsx | api.ts (enterpriseAPI.getApplications/updateStatus) | 查看职位收到的所有申请，更新申请状态（初审/复试/录用/拒绝） |
| 简历详情查看 | EnterpriseResumeDetail.tsx | api.ts (enterpriseAPI.getResume/aiAnalyze) | 查看申请人简历详情，AI 简历评分分析 |
| AI 评分配置 | ScoringConfigModal.tsx | api.ts (enterpriseAPI.aiAnalyze) | 自定义 AI 评分维度（名称、权重、描述） |
| 面试列表 | EnterpriseInterviewList.tsx | api.ts (enterpriseAPI.getInterviews) | 查看企业发起的 AI 面试列表 |
| 面试配置 | InterviewConfigModal.tsx | api.ts (enterpriseAPI.createInterview) | 配置面试参数（难度、题目数、时长、能力维度等） |
| 面试报告 | EnterpriseInterviewReport.tsx | api.ts (enterpriseAPI.getReport) | 查看求职者的 AI 面试评估报告 |
| 数据分析 | EnterpriseAnalytics.tsx | api.ts (enterpriseAPI.getDashboardStats) | 数据可视化看板（申请趋势折线图、职位热度柱状图） |
| 消息管理 | EnterpriseMessages.tsx | messageAPI.ts (getConversations/getMessages/sendMessage/markAsRead) | 与求职者会话管理和实时消息沟通 |
| 企业资料编辑 | EnterpriseProfileEdit.tsx | api.ts (enterpriseAPI.getProfile/updateProfile) | 编辑企业资料（名称、描述、Logo、行业、规模等） |

## 页面路由表

| 路由 | 页面组件 | 描述 |
|------|---------|------|
| `/enterprise` | EnterpriseMarketing（重定向） | 企业门户入口，默认跳转营销页 |
| `/enterprise/marketing` | EnterpriseMarketing | 企业营销落地页 |
| `/enterprise/login` | EnterpriseLogin | 企业登录 |
| `/enterprise/register` | EnterpriseRegister | 企业注册 |
| `/enterprise/dashboard` | EnterpriseDashboard | 企业仪表盘 |
| `/enterprise/jobs` | EnterpriseJobs | 职位列表 |
| `/enterprise/jobs/new` | EnterpriseJobEdit | 新建职位 |
| `/enterprise/jobs/:id/edit` | EnterpriseJobEdit | 编辑职位 |
| `/enterprise/applications` | EnterpriseApplications | 投递管理 |
| `/enterprise/applications/:applicationId/resume` | EnterpriseResumeDetail | 简历详情查看 |
| `/enterprise/interviews` | EnterpriseInterviewList | 面试列表 |
| `/enterprise/interviews/:interviewId/report` | EnterpriseInterviewReport | 面试报告 |
| `/enterprise/analytics` | EnterpriseAnalytics | 数据分析 |
| `/enterprise/messages` | EnterpriseMessages | 消息列表 |
| `/enterprise/messages/:userId` | EnterpriseMessages | 用户消息会话 |
| `/enterprise/profile` | EnterpriseProfileEdit | 企业资料编辑 |

## 业务流程

### 1. 招聘全流程
发布职位 → 职位上线后接收求职者投递 → 查看投递列表 → 查看申请人简历 → AI 智能简历评分分析（自定义评分维度） → 更新申请状态（初审/复试/录用/拒） → 发送面试邀请 → 追踪面试结果

### 2. AI 面试流程
在投递管理中选择候选人 → 配置面试参数（难度、题目数、题型、能力维度等） → 向候选人发起 AI 面试 → 候选人在线完成 AI 面试 → 企业查看 AI 生成的面试评估报告（含评分、优缺点、录用建议）

### 3. 数据分析流程
系统自动汇总招聘数据 → 仪表盘展示招聘漏斗（申请数/初筛数/面试数/录用数） → 申请趋势折线图（每日申请量变化） → 职位热度柱状图（各职位的申请人数排名）

### 4. 候选人沟通流程
查看申请列表 → 对有意向的候选人发起消息会话 → 与求职者在消息窗口内实时沟通 → 通过消息协商面试时间等安排 → 后续可通过消息发送面试邀请

## 权限控制

- **未登录用户**: 仅可访问企业营销页、登录页和注册页
- **已登录企业用户（ENTERPRISE）**: 可访问所有企业管理功能；求职者/管理员角色被自动重定向
- **独立认证体系**: 企业使用独立的 token（`token` 存储在 localStorage），与求职者端共享 localStorage 空间但有角色区分
- **JWT 认证**: 所有 API 请求通过 `Authorization: Bearer <token>` 鉴权

## 依赖的外部服务

| 服务 | 用途 | 依赖文件 |
|------|------|---------|
| 后端 API (axios) | 所有业务接口调用 | utils/api.ts (getApiUrl) |
| 消息 API | 企业-求职者即时通讯 | messageAPI.ts |
| Recharts 图表库 | 数据可视化（折线图/柱状图） | EnterpriseAnalytics.tsx |
| Heroicons | UI 图标库 | EnterpriseDashboard.tsx 等 |
