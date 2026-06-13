# 用户认证功能

## 功能概述
实现用户（求职者）的注册、登录、JWT 认证、角色权限控制、头像上传与密码修改。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| authSchema.ts | frontend/src/schemas/authSchema.ts | 注册/登录表单的 Zod 校验规则定义 |
| Login.tsx | frontend/src/pages/Login.tsx | 用户登录页面，调用 authAPI.login |
| Register.tsx | frontend/src/pages/Register.tsx | 用户注册页面，调用 authAPI.register |
| api.ts | frontend/src/services/api.ts | 集中管理 authAPI（login/register/getProfile/updateProfile/changePassword/uploadAvatar） |
| NavigationBar.tsx | frontend/src/components/NavigationBar.tsx | 根据角色（USER/ENTERPRISE/ADMIN/HR）显示不同导航菜单 |
| App.tsx | frontend/src/App.tsx | 路由配置，保护需认证的路由 |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| auth.ts | backend/src/routes/auth.ts | 实现注册、登录、获取/更新用户信息、修改密码、上传头像等接口 |
| middleware/auth.ts | backend/src/middleware/auth.ts | JWT Token 验证、角色权限中间件（requireAdmin/requireEnterprise/requireUser/requireHR） |
| config/index.ts | backend/src/config/index.ts | JWT 密钥、过期时间、密码策略、文件上传限制等全局配置 |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/auth', authRoutes)` |
| middleware/rateLimit.ts | backend/src/middleware/rateLimit.ts | 登录/注册的速率限制 |

## 数据流图（文字描述）

```
用户输入表单 → Login.tsx/Register.tsx → authSchema.ts 校验 → api.ts (authAPI.login/register)
→ POST /api/auth/login|register → auth.ts 路由处理 → bcrypt 密码哈希/比对 → Prisma CRUD
→ jwt.sign() 生成 Token → 返回 { token, user } → 前端 localStorage 存储 Token → NavigationBar 根据 role 渲染导航
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| GET | /api/auth/me | 获取当前用户信息 | 是 |
| PUT | /api/auth/me | 修改用户名 | 是 |
| PUT | /api/auth/me/password | 修改密码 | 是 |
| POST | /api/auth/me/avatar | 上传头像 | 是 |
