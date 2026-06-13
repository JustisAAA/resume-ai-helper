# InterviewNew.tsx

**文件路径**: frontend/src/pages/InterviewNew.tsx

## 职责概述
新建面试页面，提供简历选择、职位设定、难度选择等表单，使用 react-hook-form 和 zod 做表单校验。

## 代码质量分析

### 优点
- 使用 react-hook-form + zodResolver 进行表单校验，方案成熟可靠
- 面试模式、难度等配置通过常量管理（FULL_PRACTICE, FULL_MOCK 等）
- 表单验证 schema 分离到 `../schemas/interviewSchema`，关注点分离清晰

### 问题
- 本地定义了 Resume 接口（id, title, status），应为共享类型
- 组件中 handler/UI 代码在同一文件中较混合

### 建议
- Resume 类型应从 `../services/api` 导入而非本地定义
- 考虑将大型表单项拆分为子组件

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `react-router-dom`: useNavigate
- `react-hook-form`: useForm
- `@hookform/resolvers/zod`: zodResolver
- `../components/ThemeToggle`
- `../services/api`: interviewAPI, resumeAPI
- `../schemas/interviewSchema`: interviewSchema, InterviewFormData
- `../components/ErrorAlert`
- `../components/EmptyState`
