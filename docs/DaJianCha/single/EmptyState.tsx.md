# EmptyState.tsx

**文件路径**: frontend/src/components/EmptyState.tsx

## 职责概述
通用空状态展示组件，支持自定义图标、标题、描述和操作按钮。

## 代码质量分析

### 优点
- Props 接口设计良好（icon/title/description/action/size）
- 支持三种尺寸（sm/md/lg）
- 组件设计简洁（56 行）

### 问题
- 无默认图标时显示空，可添加默认图标兜底

## 依赖关系
- 被大量页面导入使用
