# HRLogin.tsx

**文件路径**: frontend/src/pages/HRLogin.tsx

## 职责概述
HR 登录页面，使用独立的 hrAPI 进行认证，存储 hrToken。

## 代码质量分析

### 优点
- 代码简洁（79 行）
- 使用独立的 hrAPI 服务
- token 和用户信息分别存储为 hrToken/hrUser，与普通用户区分

### 问题
- 错误处理使用 `any` 类型
- 没有使用通用组件（如无 ErrorAlert 之外的主题切换）
- 登录后无角色校验

### 建议
- 统一错误提取方式
- 与其他登录页共享 AuthForm 组件
- 添加登录失败次数限制

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState
- `react-router-dom`: useNavigate
- `../services/hrAPI`: hrAPI
- `../components/ErrorAlert`
