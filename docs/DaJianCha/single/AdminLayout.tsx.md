# AdminLayout.tsx

**文件路径**: frontend/src/components/AdminLayout.tsx

## 职责概述
管理员后台布局组件，包含侧边导航栏、顶部栏和内容区域。

## 代码质量分析

### 优点
- 侧边导航使用路由高亮当前页面
- 使用 useTheme 上下文支持暗黑模式
- 内联 SVG 图标作为导航图标

### 问题
- 内联 SVG 图标重复定义
- 侧边栏不支持折叠

## 依赖关系

### 此文件导入的模块
- `react-router-dom`: useNavigate, useLocation
- `../context/ThemeContext`: useTheme
