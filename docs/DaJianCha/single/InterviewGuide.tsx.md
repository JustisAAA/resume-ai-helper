# InterviewGuide.tsx

**文件路径**: frontend/src/pages/InterviewGuide.tsx

## 职责概述
面试引导页面，在面试开始前展示面试的基本信息、注意事项和开始按钮，作为从列表到面试室的过渡页面。

## 代码质量分析

### 优点
- useEffect 依赖了 `[id]`，正确地在路由参数变化时重新获取数据
- 本地定义了 Interview 接口（id, title, position, difficulty, status），与页面需求匹配

### 问题
- 本地 Interview 接口与 `../services/api` 中的同名类型可能不一致，存在重复定义
- 使用了 `as unknown as Interview` 的类型转换，说明 API 返回类型与原定义不匹配

### 建议
- 复用 `../services/api` 中定义的 Interview 类型
- 修复 API 类型定义以消除强制类型转换

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `react-router-dom`: useParams, useNavigate
- `../components/ThemeToggle`
- `../services/api`: interviewAPI
- `../components/Loading`
- `../components/ErrorAlert`
