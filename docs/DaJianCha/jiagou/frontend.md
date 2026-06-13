# 前端架构报告

## 概述

本项目前端采用 **React 18 + TypeScript + Vite + Tailwind CSS + React Router 6** 技术栈，面向求职者、企业、HR、管理员四类用户角色（含未登录访客），提供简历管理、AI面试、岗位投递、消息沟通、求职工具等核心功能。前端共包含约 **52个页面组件**、**16个共享组件**、**4个API服务层文件**，采用 **React.lazy 懒加载** 提升首屏性能，通过 `data-role` 属性驱动的 CSS 变量体系实现多角色主题切换。

## 详细分析

### 1. 技术选型

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 组件框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具（HMR 极快） |
| Tailwind CSS | 3.x | 原子化样式 |
| React Router | 6.x | 客户端路由 |
| Axios | 1.x | HTTP 请求 |
| Zod | 3.x | 表单验证 |
| html2pdf.js / jsPDF | - | PDF 导出 |

### 2. 目录结构

```
frontend/src/
├── App.tsx              # 路由配置 + 角色守卫 + 主题角色设置
├── main.tsx             # 应用入口（Provider 嵌套）
├── index.css            # Tailwind + CSS 变量（角色主题色）
├── components/          # 16个共享组件
│   ├── AdminLayout.tsx
│   ├── AIInterviewerAvatar.tsx
│   ├── EmptyState.tsx
│   ├── ErrorAlert.tsx
│   ├── ErrorBoundary.tsx
│   ├── InterviewConfigModal.tsx
│   ├── Loading.tsx
│   ├── MessageBubble.tsx
│   ├── NavigationBar.tsx
│   ├── PageLayout.tsx
│   ├── Pagination.tsx
│   ├── ReportModal.tsx
│   ├── ScoringConfigModal.tsx
│   ├── StatusBadge.tsx
│   ├── ThemeToggle.tsx
│   └── Toast.tsx
├── pages/               # 52个页面组件
│   ├── 求职者端（22个）：Home, Register, Login, Dashboard, ResumeList/Upload/Detail,
│   │   InterviewList/New/Room/Guide/Report, ReportCenter, ToolsOptimize/Match/
│   │   Questions/Score/Guide, Templates/Apply, Profile, JobList/Detail/Apply,
│   │   MyApplications, MessageList/Window, PracticePage, MyEnterpriseInterviews,
│   │   EnterpriseInterviewRoom
│   ├── 企业端（12个）：EnterpriseLogin/Register/Dashboard, EnterpriseJobs/Edit,
│   │   EnterpriseApplications/ResumeDetail, EnterpriseInterviewList/Report,
│   │   EnterpriseAnalytics/Messages/ProfileEdit, EnterpriseMarketing
│   ├── 管理员端（3个）：AdminDashboard, AdminUsers, AdminReports
│   └── HR端（7个）：HRLogin/Dashboard, HRApplications/ResumeDetail,
│       HRInterviews/Messages/Settings
├── services/            # 4个API服务层
│   ├── api.ts           # 主API（auth/resume/interview/tools/admin/enterprise/job）
│   ├── hrAPI.ts         # HR专用API（含Axios拦截器）
│   ├── messageAPI.ts    # 消息API（含Axios拦截器）
│   └── reportAPI.ts     # 举报API（含Axios拦截器）
├── utils/               # 3个工具
│   ├── api.ts           # API地址配置（Vite环境变量）
│   ├── exportPdf.ts     # PDF导出（html2pdf.js-智能分页+中文）
│   └── image.ts         # 图片URL拼接
├── schemas/             # 4个Zod验证
│   ├── authSchema.ts    # 登录/注册验证
│   ├── answerSchema.ts  # 面试回答验证
│   ├── interviewSchema.ts
│   └── resumeSchema.ts
├── context/
│   └── ThemeContext.tsx  # 暗色模式Context
├── hooks/
│   └── useLazyLoad.ts   # 懒加载Hook（IntersectionObserver）
├── types/
│   └── report.ts        # 面试报告类型定义
└── data/
    └── templates.ts     # 简历模板数据
```

### 3. 路由设计（角色守卫分层）

路由采用 **5层守卫** + **React.lazy 懒加载** 架构，在 `App.tsx` 中集中定义：

- **GuestRoute**：未登录用户专用（登录/注册页），已登录自动跳转对应仪表盘
- **UserRoute**：普通求职者路由，管理员/企业被重定向
- **AdminRoute**：ADMIN 角色专属，非管理员跳转到 `/dashboard`
- **EnterpriseRoute**：ENTERPRISE 角色专属，其他角色被重定向
- **HRRoute**：HR 角色专属，依赖 `hrToken` 本地存储 + `hrUser` 角色校验

守卫逻辑：
```
App (Routes)
├── 公开路径: /, /home, /role-select
├── GuestRoute: /register, /login, /enterprise/login, /enterprise/register
├── UserRoute: /dashboard, /resumes/*, /interviews/*, /tools/*, /templates/*, /jobs/*, /messages/* 等
├── AdminRoute: /admin, /admin/users, /admin/reports
├── EnterpriseRoute: /enterprise/dashboard, /enterprise/jobs/*, /enterprise/applications/* 等
└── HRRoute: /hr/dashboard, /hr/applications/*, /hr/messages/* 等
```

所有页面使用 `React.lazy(() => import('./pages/...'))` 实现代码分割，配合 `<Suspense fallback={<Loading />}>` 包裹。

### 4. 组件层级设计

```
main.tsx
└── ErrorBoundary（顶层错误捕获）
    └── ThemeProvider（暗色模式）
        └── BrowserRouter
            └── ToastProvider（全局提示）
                └── App（路由+守卫）
                    ├── 页面级：Dashboard, Reports, ...
                    └── 组件嵌套：
                        ├── NavigationBar / PageLayout / AdminLayout → 布局容器
                        ├── Loading / EmptyState / ErrorAlert → 状态展示
                        ├── Pagination → 分页
                        ├── Toast → 消息提示（Context方式）
                        ├── ErrorBoundary → 错误边界
                        ├── StatusBadge / MessageBubble → 数据展示
                        ├── AIInterviewerAvatar → AI交互
                        ├── InterviewConfigModal / ScoringConfigModal / ReportModal → 模态框
                        └── ThemeToggle → 主题切换
```

共享组件分为5类：
- **布局类**：`NavigationBar`, `PageLayout`, `AdminLayout`
- **反馈类**：`Loading`, `EmptyState`, `ErrorAlert`, `Toast`, `ErrorBoundary`
- **数据展示类**：`StatusBadge`, `MessageBubble`, `Pagination`
- **交互类**：`ThemeToggle`, `AIInterviewerAvatar`
- **模态框类**：`InterviewConfigModal`, `ScoringConfigModal`, `ReportModal`

### 5. API 调用架构

API 层采用 **Axios + 手动传 Token** 模式：

```
services/
├── api.ts           # 无拦截器，每个方法手动传 token
│   ├── authAPI      # 登录/注册/获取用户/修改密码/上传头像
│   ├── resumeAPI    # 简历CRUD + 分析/评分
│   ├── interviewAPI # 面试CRUD + 开始/回答(含SSE流式)/报告
│   ├── toolsAPI     # 求职工具(匹配/问题/指南/优化/解析文件)
│   ├── adminAPI     # 管理员(统计/用户管理)
│   ├── enterpriseAPI# 企业(注册登录/资料/仪表盘/申请管理)
│   └── jobAPI       # 职位CRUD
├── hrAPI.ts         # 有 Axios 拦截器，自动附加 hrToken
├── messageAPI.ts    # 有 Axios 拦截器，自动附加 token
└── reportAPI.ts     # 有 Axios 拦截器，自动附加 token
```

`getApiUrl(endpoint)` 工具函数拼接完整路径：`${VITE_API_URL}/api${endpoint}`。

**SSE 流式接口**：`interviewAPI.answerStream()` 和 `interviewAPI.generateReport()` 使用原生 `fetch` + `ReadableStream` 逐行解析 `data:` 事件，实现 AI 回答的流式渲染。

### 6. 状态管理方案

采用 **React Context + localStorage** 轻量方案：
- **ThemeContext**：管理暗色模式状态，存储到 `localStorage('theme')`
- **ToastContext**：Toast消息队列（Provider方式 + 3秒自动消失）
- **用户身份**：存储在 `localStorage('user')` / `localStorage('token')` / `localStorage('hrToken')` / `localStorage('hrUser')`

无 Redux/Zustand 等重型状态管理库。

### 7. 主题系统

采用 **`data-role` 属性 + CSS 变量** 双主题方案：

- **角色主题色**（`index.css`）：
  - `data-role="jobseeker"` → Indigo 系（紫色）
  - `data-role="enterprise"` → Violet 系（紫色）
  - `data-role="hr"` → Emerald 系（绿色）
  - `:root:not([data-role])` → 默认 Indigo 系

- **暗色模式**（`ThemeContext`）：在 `<html>` 上添加/移除 `dark` class，配合 Tailwind `dark:` 前缀

- **动态切换**：`App.tsx` 的 `useEffect` 监听 localStorage 和路径变化，根据用户角色设置 `document.documentElement.dataset.role`

### 8. 错误处理

- **ErrorBoundary**：React Class Component 实现，捕获渲染错误，提供「重试」和「回到首页」按钮
- **Toast**：Context 驱动的通知系统，支持 `success / error / info` 三种类型，顶部右侧浮动展示，3秒自动消失
- **API 错误**：通过 `try/catch` 在页面层捕获，使用 `extractApiError()` 提取人类可读消息，显示到 Toast

### 9. 分页实现方案

- **服务端分页**：后端返回 `{ data[], pagination: { page, limit, total, totalPages } }`
- **前端组件**：`Pagination.tsx` 智能页码生成（7页以内全显，超过7页显示省略号）
- **状态管理**：页面组件维护 `currentPage` 状态，通过 `onPageChange` 回调重新请求数据

### 10. 工具函数抽取

```
utils/api.ts       → getApiUrl(), getApiBaseUrl()       — API地址拼接
utils/exportPdf.ts → exportTextToPdf(), exportReportToPDF() — PDF导出
utils/image.ts     → getImageUrl()                      — 图片URL拼接
hooks/useLazyLoad.ts → useLazyLoad(), useLazyLoadImage()  — IntersectionObserver懒加载
```

## 评价

### 优点
1. **角色守卫分层清晰**：5种守卫对应5种用户状态，职责明确
2. **代码分割充分**：52个页面全部使用 `React.lazy` 懒加载，首屏加载速度快
3. **主题系统设计精巧**：`data-role` + CSS 变量实现角色主题，`dark` class 实现暗色模式，互不干扰
4. **API 层职责分明**：4个API文件按业务模块拆分，SSE 流式兼容好
5. **组件复用度高**：16个共享组件覆盖了大部分通用场景

### 不足
1. **无全局状态管理**：`localStorage` 直接读写不利于类型安全和响应式更新
2. **API Token 管理不一致**：`api.ts` 手动传 token，`hrAPI.ts/messageAPI.ts/reportAPI.ts` 用拦截器，风格不统一
3. **缺少 Axios 响应拦截器**：未在全局统一处理 401 重定向、错误提示等
4. **CSS 变量未在组件中使用**：`brand-*` 变量已定义但组件内未广泛引用
5. **类型定义混放**：部分类型定义在 `api.ts` 中，部分在 `types/report.ts`，分散不易维护

### 改进建议
1. 引入 **Zustand** 或 **Jotai** 管理用户状态，替代 localStorage 直读
2. 统一所有 API 模块使用 Axios 实例 + 请求/响应拦截器
3. 在 Tailwind 配置中注册 `brand-*` 自定义颜色，实现组件级别的角色主题引用
4. 将 `api.ts` 中的接口定义提取到独立的 `types/api.ts`
