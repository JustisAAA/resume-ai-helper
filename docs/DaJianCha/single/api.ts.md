# api.ts

**文件路径**: frontend/src/services/api.ts

## 职责概述
前端核心 API 服务层，集中管理所有后端接口调用，包含完整的类型定义和 8 个 API 模块。

## 代码质量分析

### 优点
- 类型定义丰富：LoginRequest/RegisterRequest/AuthResponse/UserProfile/Resume/Interview/Job 等
- 按功能模块分组清晰：authAPI/resumeAPI/interviewAPI/jobAPI/toolsAPI/enterpriseAPI/adminAPI
- 使用 axios 且各模块通过函数式封装

### 问题
- 文件极大（1096 行），类型定义和 API 调用耦合在一起
- 部分函数参数使用 `any` 类型
- 缺少统一的错误处理拦截器

### 建议
- 将类型定义拆分到 `types/` 目录
- 将各 API 模块拆分为独立文件
- 添加 axios 响应拦截器统一处理错误

## 依赖关系
- 被几乎所有前端页面和服务文件导入
