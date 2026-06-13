# EnterpriseJobEdit.tsx

**文件路径**: frontend/src/pages/EnterpriseJobEdit.tsx

## 职责概述
企业职位编辑/创建页面，支持发布新职位或编辑现有职位信息。

## 代码质量分析

### 优点
- form 状态集中管理，包含 title/description/requirements/salaryRange 等完整字段
- 支持图片上传（images 数组）
- 状态类型使用联合类型 `'ACTIVE' | 'CLOSED' | 'DRAFT'`
- API_BASE 用 getApiBaseUrl 获取路径

### 问题
- 文件较大（359 行），表单字段较多不宜全部在同一组件
- 缺少富文本编辑器支持（description/requirements 应为 HTML 或 Markdown 输入）
- 表单无字段级校验反馈

### 建议
- 引入 react-hook-form 管理复杂表单
- 添加富文本编辑器组件
- 将图片上传区域提取为子组件

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate, useParams
- `../services/api`: jobAPI
- `../components/Toast`: useToast
- `../utils/api`: getApiBaseUrl
- `../utils/image`: getImageUrl
- `../components/Loading`: ButtonSpinner
- `../components/ErrorAlert`
