# ResumeList.tsx

**文件路径**: frontend/src/pages/ResumeList.tsx

## 职责概述
简历列表页面，展示用户所有简历，支持查看详情、删除简历等操作，并引导用户上传新简历。

## 代码质量分析

### 优点
- 使用了多个通用组件（Loading、ErrorAlert、StatusBadge、Toast），组件化程度高
- fetchResumes 和 handleDelete 逻辑清晰，API 调用正确
- 删除操作有 confirm 确认，防止误操作

### 问题
- useEffect 依赖数组为空 `[]`，但调用 fetchResumes 时未将其作为依赖项，存在 stale closure 风险
- token 每次通过 `localStorage.getItem('token')` 获取，未封装为统一认证管理
- 错误处理方式不一致：fetch 使用 setError，delete 使用 showToast

### 建议
- 将 fetchResumes 放到 useEffect 内部或使用 useCallback 包裹
- 统一错误提示方式，建议全部使用 Toast 组件
- 考虑将 token 获取封装到 API 拦截器中

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../services/api`: resumeAPI, Resume
- `../components/Toast`: useToast
- `../components/Loading`
- `../components/ErrorAlert`
- `../components/StatusBadge`
