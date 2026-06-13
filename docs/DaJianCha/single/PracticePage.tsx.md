# PracticePage.tsx

**文件路径**: frontend/src/pages/PracticePage.tsx

## 职责概述
求职者练习中心页面，集成简历管理、模拟面试、报告查看、职位推荐等工具入口，是求职者日常操作的主页面。

## 代码质量分析

### 优点
- 使用自定义内联 SVG 图标组件（UploadIcon、InterviewIcon 等），命名语义化
- 与后端 API 对接良好，引入了 interviewAPI、resumeAPI 等完整 API 接口
- 错误处理组件 ErrorAlert 的使用覆盖了可能的网络异常场景

### 问题
- 同样存在内联 SVG 过多导致文件过大（404 行）的问题
- 多个内联图标组件（UploadIcon、InterviewIcon 等）在其他页面也会用到，未做复用
- 引入了 `UserProfile` 和 `Interview` 类型但可能存在 unused import

### 建议
- 建立统一的图标组件库，将重复出现的 SVG 图标提取为公共组件
- 使用 ESLint 的 no-unused-vars 规则检测未使用的导入
- 考虑将各工具入口拆分为独立的功能卡片组件

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../services/api`: interviewAPI, resumeAPI, UserProfile, Interview
- `../utils/api`: getApiBaseUrl
- `../components/ErrorAlert`
