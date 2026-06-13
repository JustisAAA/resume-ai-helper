# HR端功能报告

## 概述

HR端是面向企业 HR 子账号的管理后台。HR 子账号拥有独立的登录入口和权限体系，可以独立管理求职者投递、进行 AI 简历评分、安排面试、与求职者沟通以及维护个人设置。HR 端与企业端共享后端接口，采用独立的 token 认证体系和用户存储。

## 功能模块清单

| 功能 | 页面文件 | API文件 | 描述 |
|------|---------|--------|------|
| HR 登录 | HRLogin.tsx | hrAPI.ts (hrAPI.login) | HR 子账号独立登录，生成独立 token |
| HR 仪表盘 | HRDashboard.tsx | hrAPI.ts (hrAPI.getDashboard) | 展示 HR 工作概览数据 |
| 投递管理 | HRApplications.tsx | hrAPI.ts (hrAPI.getApplications/updateStatus) | 查看所有投递申请，更新申请状态 |
| 简历详情 | HRResumeDetail.tsx | hrAPI.ts (hrAPI.getResume/aiAnalyze) | 查看申请人简历详情，AI 简历评分分析 |
| 面试管理 | HRInterviews.tsx | hrAPI.ts (hrAPI.createInterview/getInterviews) | 创建面试邀请，查看面试列表 |
| 面试报告查看 | —（复用 EnterpriseInterviewReport） | hrAPI.ts (hrAPI.getInterviewReport) | 查看求职者面试评估报告 |
| 消息管理 | HRMessages.tsx | hrAPI.ts (hrAPI.getConversations/getMessages/sendMessage/markAsRead) | 与求职者会话管理和消息沟通 |
| 个人设置 | HRSettings.tsx | hrAPI.ts (hrAPI.updateSettings) | 修改姓名和密码 |

## 页面路由表

| 路由 | 页面组件 | 描述 |
|------|---------|------|
| `/hr/login` | HRLogin | HR 登录页 |
| `/hr/dashboard` | HRDashboard | HR 工作台首页 |
| `/hr/applications` | HRApplications | 投递申请列表 |
| `/hr/applications/:applicationId/resume` | HRResumeDetail | 简历详情 |
| `/hr/interviews` | HRInterviews | 面试管理列表 |
| `/hr/interviews/:interviewId/report` | EnterpriseInterviewReport | 面试报告查看（复用企业端组件） |
| `/hr/messages` | HRMessages | 消息列表 |
| `/hr/settings` | HRSettings | 个人设置 |

## 业务流程

### 1. 简历筛选与评分流程
查看投递申请列表 → 点击查看申请人简历详情 → 启动 AI 简历评分分析（自定义评分维度） → 根据评分结果更新申请状态（如标记为"待面试"/"不合适"）

### 2. 面试邀约流程
找到合适的候选人 → 选择候选人创建面试 → 配置面试参数 → 发送面试邀请 → 在面试列表中追踪面试状态 → 面试完成后查看 AI 面试报告

### 3. 候选人沟通流程
查看消息会话列表 → 进入与求职者的聊天窗口 → 发送/接收消息 → 标记消息已读 → 通过消息沟通面试安排、反馈等

### 4. 个人信息维护
查看个人基本信息 → 修改显示姓名 → 修改登录密码

## 权限控制

- **未登录用户**: 仅可访问 HR 登录页
- **已登录 HR 用户**: 使用独立的 `hrToken` 和 `hrUser` 存储在 localStorage 中
- **角色验证**: 每次路由进入时验证 localStorage 中的 hrToken 和 hrUser.role === 'HR'
- **JWT 认证**: hrAPI.ts 中 axios 拦截器自动附加 `hrToken` 或 `token` 到所有请求头
- **隔离性**: HR 独立存储不与普通用户/企业用户 token 冲突

## 依赖的外部服务

| 服务 | 用途 | 依赖文件 |
|------|------|---------|
| 后端 API (axios) | 所有业务接口调用 | hrAPI.ts（独立 axios 实例） |
| 消息 API | HR-求职者即时通讯 | hrAPI.ts（复用 enterprise 消息接口路径） |
| Enterprise 接口复用 | 面试创建/报告查看 | hrAPI.ts（复用 /enterprise/interviews 路径） |
| Heroicons | UI 图标库 | HRDashboard.tsx 等 |
