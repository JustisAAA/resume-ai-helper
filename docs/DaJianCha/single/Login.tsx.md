# Login.tsx

**文件路径**: frontend/src/pages/Login.tsx

## 职责概述
用户登录页面，提供邮箱+密码认证表单，登录成功后根据角色跳转到不同后台。

## 代码质量分析

### 优点
- 表单逻辑简洁清晰：useState 管理表单状态和 loading/error 状态
- 错误处理完善：catch 中捕获 API 错误并展示友好提示
- 路由跳转合理：根据 user.role 判断跳转到 ADMIN 或普通用户后台

### 问题
- 错误类型断言 `err as { response?: ... }` 写法冗长，可提取为工具函数
- Token 和用户信息直接存储到 localStorage，存在 XSS 风险
- 密码输入未做前端校验（如最小长度、复杂度）

### 建议
- 封装通用错误提取函数 `extractApiError(err)`
- 考虑使用 httpOnly Cookie 替代 localStorage 存储 token
- 添加基本的前端表单校验

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState
- `react-router-dom`: useNavigate, Link
- `../services/api`: authAPI
- `../components/ErrorAlert`: 错误提示组件
- `../components/ThemeToggle`: 主题切换组件
