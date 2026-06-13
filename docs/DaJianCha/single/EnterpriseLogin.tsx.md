# EnterpriseLogin.tsx

**文件路径**: frontend/src/pages/EnterpriseLogin.tsx

## 职责概述
企业端登录页面，提供企业用户邮箱密码登录功能。

## 代码质量分析

### 优点
- 代码简洁（116 行），逻辑清晰
- 使用 enterpriseAPI.login 独立的企业登录 API
- 登录后跳转到企业仪表盘

### 问题
- 与 Login.tsx 存在大量重复代码，可提取公共 AuthForm 组件
- 错误捕获类型断言冗余
- 使用 localStorage 存储 token 存在安全风险
- 无"记住密码"功能

### 建议
- 提取 AuthForm 公共组件供所有登录页面复用
- 封装错误提取工具函数
- 考虑使用 httpOnly Cookie

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState
- `react-router-dom`: useNavigate, Link
- `../services/api`: enterpriseAPI
- `../components/ThemeToggle`
- `../components/ErrorAlert`
