# schemas/interviewSchema.ts

**文件路径**: `frontend/src/schemas/interviewSchema.ts`

## 职责概述

面试创建表单的 Zod 校验 schema。定义创建模拟面试所需的字段验证规则。

## 核心功能

### interviewSchema
- **resumeId** (string): 简历 ID，非空校验
- **position** (string): 目标岗位，1-100 字符
- **difficulty** (enum): 面试难度
  - 可选值: `EASY` | `MEDIUM` | `HARD`
  - 非法值时报错"请选择面试难度"

### 导出类型
- `InterviewFormData` — 推导类型

## 外部依赖

- `zod`

## 调用关系

- 被 `InterviewNew.tsx` 页面引用，创建面试前校验表单输入
