# ReportModal.tsx

**文件路径**: frontend/src/components/ReportModal.tsx

## 职责概述
举报弹窗组件，用户选择举报原因并提交。

## 代码质量分析

### 优点
- 使用 reportAPI 提交举报
- 支持成功/错误状态展示
- 表单校验（必选原因）

### 问题
- 举报原因硬编码在组件内
- 不支持匿名举报选项

## 依赖关系
- 被 JobDetail 和 MessageWindow 等页面导入
