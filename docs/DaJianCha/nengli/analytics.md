# 数据统计功能

## 功能概述
管理员查看系统级统计数据（用户数、企业数、职位数、申请数、举报数等），企业查看自身 Dashboard 数据分析（招聘漏斗、申请趋势、职位热度）。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| AdminDashboard.tsx | frontend/src/pages/AdminDashboard.tsx | 管理员仪表盘页面，调用 adminAPI.getStats 展示系统统计数据 |
| EnterpriseAnalytics.tsx | frontend/src/pages/EnterpriseAnalytics.tsx | 企业数据分析页面，展示招聘漏斗、申请趋势图表、职位热度排行 |
| api.ts | frontend/src/services/api.ts | 定义 adminAPI（getStats/getUsers/updateUser/deleteUser）和 enterpriseAPI（getDashboardStats） |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| admin.ts | backend/src/routes/admin.ts | 管理员路由：获取系统统计（用户/企业/职位/面试/举报等计数+今日新增+角色分布）、用户管理（列表/搜索/更新/删除） |
| enterprise.ts | backend/src/routes/enterprise.ts | 企业路由：注册、登录、资料管理、Dashboard 统计数据获取 |
| services/enterpriseService.ts | backend/src/services/enterpriseService.ts | 企业业务逻辑：注册登录、资料管理、Dashboard 统计（招聘漏斗、申请趋势、职位热度） |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/admin', adminRoutes)`、`app.use('/api/enterprise', enterpriseRoutes)` |
| middleware/auth.ts | backend/src/middleware/auth.ts | 管理员/企业权限中间件（requireAdmin/requireEnterprise） |

## 数据流图（文字描述）

```
AdminDashboard.tsx → api.ts (adminAPI.getStats) → GET /api/admin/stats
→ admin.ts → Prisma 并行查询（user/enterprise/job/application/interview/complaint 各表 count）→ 返回统计 JSON

EnterpriseAnalytics.tsx → api.ts (enterpriseAPI.getDashboardStats)
→ GET /api/enterprise/dashboard/stats → enterprise.ts → enterpriseService.ts (getDashboardStats)
→ 计算招聘漏斗（职位数→申请数→面试数→录用数）、最近7天申请趋势、职位热度排行 → 返回
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/admin/stats | 获取系统统计数据 | 是（ADMIN） |
| GET | /api/admin/users | 获取用户列表（支持搜索/筛选/分页） | 是（ADMIN） |
| GET | /api/admin/users/:id | 获取用户详情 | 是（ADMIN） |
| PUT | /api/admin/users/:id | 更新用户状态（封禁/解封） | 是（ADMIN） |
| DELETE | /api/admin/users/:id | 删除用户 | 是（ADMIN） |
| GET | /api/enterprise/dashboard/stats | 获取企业 Dashboard 统计 | 是（ENTERPRISE） |
