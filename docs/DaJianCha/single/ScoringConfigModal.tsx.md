# ScoringConfigModal.tsx

**文件路径**: frontend/src/components/ScoringConfigModal.tsx

## 职责概述
评分配置弹窗组件，配置评分要点、关键点、评分标准和分数线。

## 代码质量分析

### 优点
- 支持动态添加/删除评分要点
- 设置合格线和优秀线

### 问题
- onConfirm 参数使用 `any` 类型
- 评分要点管理可能过于复杂

## 依赖关系
- 被 EnterpriseResumeDetail 和 HRResumeDetail 等导入
