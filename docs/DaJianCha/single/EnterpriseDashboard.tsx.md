# EnterpriseDashboard.tsx

**文件路径**: frontend/src/pages/EnterpriseDashboard.tsx

## 职责概述
企业仪表盘主页，展示企业信息、快捷功能入口（发布职位、消息、应聘管理）和统计数据。

## 代码质量分析

### 优点
- CARD_STYLE 配色映射表管理各功能卡片的样式配置，设计优雅
- 使用 enterpriseAPI 和 jobAPI 获取企业信息和数据
- getImageUrl 处理企业 Logo 显示
- 使用 heroicons 图标丰富展示

### 问题
- 文件较大（356 行），导航和仪表盘内容混合
- 内联样式配置 CARD_STYLE 较复杂，可简化
- 企业信息展示和功能入口耦合较紧

### 建议
- 将功能卡片拆分为独立组件
- 简化颜色配置，使用统一的 Tailwind 类
- 响应式布局有待加强

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../services/api`: enterpriseAPI, jobAPI
- `../utils/api`: getApiBaseUrl
- `../utils/image`: getImageUrl
- `../components/Loading`
- `../components/ErrorAlert`
- `@heroicons/react/24/outline`: BuildingOfficeIcon, PlusIcon 等
