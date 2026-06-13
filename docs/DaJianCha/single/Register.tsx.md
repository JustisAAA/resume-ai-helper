# Register.tsx

**文件路径**: frontend/src/pages/Register.tsx

## 职责概述
用户注册页面，提供邮箱/密码/姓名注册表单，注册成功后自动登录并跳转。

## 代码质量分析

### 优点
- 与 Login.tsx 结构一致，保持了代码风格统一
- 表单状态管理简洁，loading/error 状态覆盖完整

### 问题
- 与 Login.tsx 存在大量重复代码（表单样式、错误处理、主题切换等），可提取公共组件
- 注册时未做密码确认输入（confirm password）字段
- 错误类型断言同样存在冗余写法
- 注册后直接存储 token 到 localStorage，安全性一般

### 建议
- 提取 AuthForm 公共组件复用 Login 和 Register 的表单逻辑
- 添加确认密码字段和前端校验
- 注册成功后应提醒用户完善个人信息

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState
- `react-router-dom`: useNavigate, Link
- `../services/api`: authAPI
- `../components/ErrorAlert`: 错误提示组件
- `../components/ThemeToggle`: 主题切换组件
