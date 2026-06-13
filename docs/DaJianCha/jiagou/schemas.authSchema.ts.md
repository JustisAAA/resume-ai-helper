# schemas/authSchema.ts

**文件路径**: `frontend/src/schemas/authSchema.ts`

## 职责概述

用户认证表单的 Zod 校验 schema。定义登录和注册两个场景的表单验证规则，并提供类型推导。

## 核心功能

### loginSchema（登录表单）
- **email**: 必填，需为有效邮箱格式
- **password**: 必填，无长度限制

### registerSchema（注册表单）
- **name**: 必填，1-50 字符
- **email**: 必填，需为有效邮箱格式
- **password**: 必填，6-50 字符

### 导出类型
- `LoginFormData` / `RegisterFormData` — 推导类型

## 外部依赖

- `zod`

## 调用关系

- 被 `Login.tsx` 和 `Register.tsx` 页面引用
- 在表单提交时调用 `loginSchema.parse()` 或 `registerSchema.parse()` 进行校验
