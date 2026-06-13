# InterviewConfigModal.tsx

**文件路径**: frontend/src/components/InterviewConfigModal.tsx

## 职责概述
面试配置弹窗组件，允许配置难度、关键词、能力标签、题目数量和每题限时。

## 代码质量分析

### 优点
- InterviewConfig 导出为接口，支持在父组件中使用
- 增加/删除关键词和能力的动态列表功能
- 使用 heroicons 图标

### 问题
- 文件较大（328 行），功能复杂
- 能力标签缺少建议/选择列表

## 依赖关系
- 被 EnterpriseApplications 和 HRApplications 等页面导入
