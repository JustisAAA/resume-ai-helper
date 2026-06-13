# JobApply.tsx

**文件路径**: frontend/src/pages/JobApply.tsx

## 职责概述
职位申请页面，展示职位信息并选择简历进行投递。

## 代码质量分析

### 优点
- JobInfo 和 Resume 本地接口定义专注且必要
- 使用 getApiBaseUrl 管理 API 基础路径
- 使用 heroicons 的 PaperClipIcon 图标

### 问题
- 本地 Resume 接口与 `../services/api` 中的可能重复
- API_BASE 在文件级定义，跳出了组件作用域
- 缺少投递成功后的后续引导（如查看投递状态）

### 建议
- 复用共享类型避免重复定义
- 投递成功后引导用户查看"我的投递"页面
- 添加投递信（cover letter）输入框

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate, useParams
- `../components/ThemeToggle`
- `../services/api`: jobAPI, resumeAPI
- `../utils/api`: getApiBaseUrl
- `../components/Toast`: useToast
- `@heroicons/react/24/outline`: PaperClipIcon
- `../components/Loading`
- `../components/EmptyState`
