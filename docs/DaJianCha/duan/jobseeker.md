# 求职者端功能报告

## 概述

求职者端是 MyGo 平台的核心用户端，面向正在求职的个人用户。系统为求职者提供 AI 驱动的简历智能分析、AI 模拟面试练习、求职攻略工具（岗位匹配/问题预测/面试辅导等）、职位搜索与投递、简历模板、消息沟通以及企业面试管理等功能，帮助求职者全面提升求职效率和面试表现。

## 功能模块清单

| 功能 | 页面文件 | API文件 | 描述 |
|------|---------|--------|------|
| 用户注册 | Register.tsx | api.ts (authAPI.register) | 求职者邮箱/密码注册，注册后自动登录 |
| 用户登录 | Login.tsx | api.ts (authAPI.login) | 求职者账号登录，JWT 认证 |
| 个人资料管理 | Profile.tsx | api.ts (authAPI.getProfile/updateProfile/changePassword/uploadAvatar) | 查看/编辑个人信息，修改密码，上传头像 |
| 首页仪表盘 | Dashboard.tsx | api.ts (authAPI.getProfile) | 展示快捷操作入口、个人概览 |
| 求职者门户 | JobSeekerHome.tsx | — | 展示系统九大功能（简历分析、模拟面试、求职攻略等）的营销宣传页 |
| 简历列表 | ResumeList.tsx | api.ts (resumeAPI.list/delete) | 查看所有上传的简历，支持删除 |
| 简历上传 | ResumeUpload.tsx | api.ts (resumeAPI.upload) | 上传 PDF/Word 简历文件（拖拽或选择） |
| 简历详情 | ResumeDetail.tsx | api.ts (resumeAPI.getDetail/analyze/score) | 查看简历解析内容、AI 评分与分析报告 |
| 面试练习主页 | PracticePage.tsx | api.ts (interviewAPI.list, resumeAPI.list) | AI 模拟面试入口，选择简历创建面试 |
| 面试列表 | InterviewList.tsx | api.ts (interviewAPI.list/delete) | 查看所有面试记录及状态 |
| 新建面试 | InterviewNew.tsx | api.ts (interviewAPI.create, resumeAPI.list) | 选择简历、目标岗位和难度创建 AI 面试 |
| 面试指引 | InterviewGuide.tsx | api.ts (interviewAPI.getDetail) | 面试前准备指引，展示面试配置信息 |
| 面试房间 | InterviewRoom.tsx | api.ts (interviewAPI.start/answer/answerStream/exit) | AI 面试实时对话，支持 SSE 流式回答 |
| 面试报告 | InterviewReport.tsx | api.ts (interviewAPI.generateReport) | 查看 AI 生成的面试评估报告（SSE 流式生成） |
| 报告中心 | ReportCenter.tsx | api.ts (interviewAPI.list) | 集中查看所有已完成面试的评估报告 |
| 职位列表 | JobList.tsx | api.ts (jobAPI.list) | 浏览/搜索企业发布的职位 |
| 职位详情 | JobDetail.tsx | api.ts (jobAPI.getDetail) | 查看岗位要求、薪资范围、公司信息等详情 |
| 职位投递 | JobApply.tsx | api.ts (jobAPI.getDetail) | 提交职位申请，附上简历和求职信 |
| 我的投递 | MyApplications.tsx | api.ts (enterpriseAPI 相关) | 查看已投递的职位列表及申请状态 |
| 简历模板 | Templates.tsx | 静态数据 (data/templates.ts) | 浏览可用的简历模板列表 |
| 模板应用 | TemplateApply.tsx | api.ts (resumeAPI.applyTemplate) | 将选中模板应用到指定简历 |
| 岗位匹配 | ToolsMatch.tsx | api.ts (toolsAPI.match) | AI 分析个人简历与目标岗位的匹配度 |
| 面试问题预测 | ToolsQuestions.tsx | api.ts (toolsAPI.questions) | AI 基于简历和目标岗位生成预测面试题 |
| 面试辅导 | ToolsGuide.tsx | api.ts (toolsAPI.guide) | AI 提供面试技巧和回答策略建议 |
| 简历优化 | ToolsOptimize.tsx | api.ts (toolsAPI.optimize) | AI 分析简历并提出优化建议 |
| 简历评分 | ToolsScore.tsx | api.ts (resumeAPI.score) | AI 对简历内容进行综合评分 |
| 消息列表 | MessageList.tsx | messageAPI.ts (getConversations/getUnreadCount) | 查看与企业/HR 的会话列表及未读消息数 |
| 消息窗口 | MessageWindow.tsx | messageAPI.ts (getMessages/sendMessage/markAsRead) | 与企业/HR 实时沟通，发送文字消息 |
| 企业面试管理 | MyEnterpriseInterviews.tsx | api.ts (enterpriseAPI.getInterviews) | 查看企业发起的面试邀请列表 |
| 企业面试房间 | EnterpriseInterviewRoom.tsx | api.ts (interviewAPI.answerStream) | 参与企业发起的 AI 面试（流式回答） |

## 页面路由表

| 路由 | 页面组件 | 描述 |
|------|---------|------|
| `/` | Home | 系统首页/角色选择页 |
| `/home` | JobSeekerHome | 求职者门户营销页 |
| `/login` | Login | 求职者登录 |
| `/register` | Register | 求职者注册 |
| `/dashboard` | Dashboard | 个人仪表盘首页 |
| `/practice` | PracticePage | AI 模拟面试练习入口 |
| `/resumes` | ResumeList | 简历列表 |
| `/resumes/upload` | ResumeUpload | 上传简历 |
| `/resumes/:id` | ResumeDetail | 简历详情与 AI 分析 |
| `/interviews` | InterviewList | 面试列表 |
| `/interviews/new` | InterviewNew | 创建新面试 |
| `/interviews/:id/guide` | InterviewGuide | 面试指引 |
| `/interviews/:id/room` | InterviewRoom | AI 面试房间 |
| `/interviews/:id/enterprise-room` | EnterpriseInterviewRoom | 企业面试房间 |
| `/interviews/:id/report` | InterviewReport | 面试报告 |
| `/reports` | ReportCenter | 报告中心 |
| `/tools/optimize` | ToolsOptimize | 简历优化工具 |
| `/tools/match` | ToolsMatch | 岗位匹配分析 |
| `/tools/questions` | ToolsQuestions | 面试问题预测 |
| `/tools/score` | ToolsScore | 简历评分 |
| `/tools/guide` | ToolsGuide | 面试辅导 |
| `/templates` | Templates | 简历模板列表 |
| `/templates/:id/apply` | TemplateApply | 应用简历模板 |
| `/profile` | Profile | 个人资料设置 |
| `/jobs` | JobList | 职位浏览 |
| `/jobs/:id` | JobDetail | 职位详情 |
| `/jobs/:id/apply` | JobApply | 投递职位 |
| `/my-applications` | MyApplications | 我的投递 |
| `/messages` | MessageList | 消息列表 |
| `/messages/:partnerId` | MessageWindow | 消息聊天窗口 |
| `/enterprise-interviews` | MyEnterpriseInterviews | 企业面试列表 |

## 业务流程

### 1. AI 模拟面试流程
求职者上传简历 → 选择简历和目标岗位 → 配置面试难度 → 创建 AI 面试 → 查看面试指引 → 进入面试房间 → 与 AI 面试官进行多轮问答（SSE 流式互动） → 提交回答实时获取评估 → 面试完成后自动生成评估报告

### 2. 简历管理流程
上传简历（支持 PDF/Word） → AI 自动解析提取内容 → 查看简历详情 → AI 多维度评分分析 → 应用简历模板美化排版 → 将优质简历投递给心仪职位

### 3. 求职攻略工具流
- **岗位匹配**: 上传简历 + 目标岗位 → AI 分析匹配度、能力差距和建议
- **问题预测**: 基于简历和岗位生成针对性面试问题列表
- **面试辅导**: 针对特定岗位提供回答策略和技巧建议
- **简历优化**: AI 分析简历内容，给出排版、用词、项目经历等优化建议
- **简历评分**: AI 对简历质量进行综合量化评分

### 4. 职位搜索与投递
浏览职位（可按关键词/地点/类型筛选） → 查看职位详情和企业信息 → 选择简历提交申请 → 在"我的投递"中跟踪申请状态 → 等待企业反馈/面试邀请

### 5. 消息沟通流程
收到企业/HR消息提醒 → 查看消息会话列表 → 进入聊天窗口 → 发送/接收文字消息 → 标记已读 → 通过消息协商面试安排

## 权限控制

- **未登录用户**: 仅可访问首页、登录页、注册页、职位浏览（列表/详情）和求职者门户
- **已登录求职者（USER）**: 可访问所有求职者功能页面；管理员和企业角色会被自动重定向到对应端
- **JWT 认证**: 所有 API 请求通过 `Authorization: Bearer <token>` 头携带 token，后端验证身份
- **本地存储**: 用户信息和 token（`token`/`user`）存储在 localStorage

## 依赖的外部服务

| 服务 | 用途 | 依赖文件 |
|------|------|---------|
| 后端 API (axios) | 所有业务接口调用 | utils/api.ts (getApiUrl) |
| SSE 流式服务 | AI 面试回答流式传输 | api.ts (interviewAPI.answerStream) |
| SSE 流式报告 | 面试报告流式生成 | api.ts (interviewAPI.generateReport) |
| 消息 API | 会话/消息/未读数 | messageAPI.ts |
| 简历模板数据 | 预置模板库 | data/templates.ts |
