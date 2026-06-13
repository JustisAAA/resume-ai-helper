# JobDetail.tsx

**文件路径**: frontend/src/pages/JobDetail.tsx

## 职责概述
职位详情页面，展示职位完整信息、企业信息，支持举报功能。

## 代码质量分析

### 优点
- JobDetail 接口类型丰富，覆盖 title/description/requirements/salary 等完整字段
- 使用 ReportModal 组件实现举报功能
- 使用 Toast 提供操作反馈

### 问题
- 本地 JobDetail 接口与企业 API 返回类型可能不一致
- 举报功能虽然存在，但缺少举报成功后的反馈处理
- 页面缺乏"申请职位"的直接入口（可能单独在 JobApply 页面）

### 建议
- 复用 `../services/api` 中的共享类型
- 在详情页底部添加"立即申请"按钮直接跳转
- 添加企业其他职位的推荐列表

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate, useParams
- `../components/ThemeToggle`
- `../services/api`: jobAPI
- `../utils/image`: getImageUrl
- `../components/Toast`: useToast
- `@heroicons/react/24/outline`: MapPinIcon, CurrencyDollarIcon 等
- `../components/ReportModal`
- `../components/ErrorAlert`
- `../components/Loading`
