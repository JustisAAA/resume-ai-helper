# EnterpriseMarketing.tsx

**文件路径**: frontend/src/pages/EnterpriseMarketing.tsx

## 职责概述
企业营销首页，展示企业品牌形象、产品优势和服务入口，是企业的对外宣传页面。

## 代码质量分析

### 优点
- 与 Home.tsx 结构一致，使用 HeroBg + floatingAnimation 的动态背景
- 视觉效果丰富，动画流畅
- 功能入口卡片化展示，适合企业用户快速了解产品

### 问题
- 与 Home.tsx 存在大量重复代码（HeroBg、floatingAnimation 等）
- 内联 SVG 图标充斥，增加文件体积（403 行）
- 营销文案和视觉设计硬编码在 JSX 中，不利于 A/B 测试

### 建议
- 提取 HeroBg 和动画样式为公共组件/样式文件
- 将营销内容数据化以便快速迭代
- 提取通用 LandingPage Layout

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
