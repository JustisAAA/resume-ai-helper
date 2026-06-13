# HRDashboard.tsx

**文件路径**: frontend/src/pages/HRDashboard.tsx

## 职责概述
HR 仪表盘页面，展示 HR 工作统计和快捷操作入口。

## 代码质量分析

### 优点
- 内联 SVG 图标组件命名清晰
- 使用 hrAPI 获取数据
- ThemeToggle 支持暗黑模式
- getImageUrl 处理图片 URL

### 问题
- 内联 SVG 图标重复定义
- 统计数据和功能入口混合
- 文件较大（292 行），可拆分

### 建议
- 提取内联图标为公共组件
- 将功能卡片拆分为子组件
- 添加待处理事项提醒功能

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../services/hrAPI`: hrAPI
- `../utils/image`: getImageUrl
- `../components/ThemeToggle`
- `../components/Loading`
- `../components/ErrorAlert`
