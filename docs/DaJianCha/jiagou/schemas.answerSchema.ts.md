# schemas/answerSchema.ts

**文件路径**: `frontend/src/schemas/answerSchema.ts`

## 职责概述

面试回答表单的 Zod 校验 schema。定义回答内容字段的验证规则和 TypeScript 类型推导。

## 核心功能

### answerSchema
- **answer** (string): 回答内容
  - 最小 1 字符（"请输入回答内容"）
  - 最大 5000 字符（"回答内容不能超过5000个字符"）

### 导出类型
- `AnswerFormData` — 从 schema 推导的类型

## 外部依赖

- `zod`

## 调用关系

- 被面试回答输入组件引用，用于表单提交前数据校验
