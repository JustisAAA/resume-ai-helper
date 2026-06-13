# schemas/resumeSchema.ts

**文件路径**: `frontend/src/schemas/resumeSchema.ts`

## 职责概述

简历标题表单的 Zod 校验 schema。定义简历创建/编辑时标题字段的验证规则。

## 核心功能

### resumeSchema
- **title** (string, 可选): 简历标题
  - 如果提供，长度需在 1-100 字符之间
  - 可选字段（允许创建时不传标题，后续再修改）

### 导出类型
- `ResumeFormData` — 推导类型

## 外部依赖

- `zod`

## 调用关系

- 被简历上传/编辑页面引用
- 用于简历标题字段的表单校验
