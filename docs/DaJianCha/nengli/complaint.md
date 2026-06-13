# 举报系统功能

## 功能概述
求职者/企业用户举报其他用户，管理员审核举报并决定通过（扣除被举报人信用分）或驳回。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| ReportModal.tsx | frontend/src/components/ReportModal.tsx | 举报弹窗组件，选择举报原因并提交 |
| AdminReports.tsx | frontend/src/pages/AdminReports.tsx | 管理员举报管理页面，查看/通过/驳回举报列表 |
| reportAPI.ts | frontend/src/services/reportAPI.ts | 举报 API 封装（submit/getList/approve/reject） |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| report.ts | backend/src/routes/report.ts | 举报路由：提交举报、获取举报列表、通过举报、驳回举报 |
| services/reportService.ts | backend/src/services/reportService.ts | 举报业务逻辑：提交（查重+校验）、获取列表（分页+状态筛选）、通过（事务调用 creditService）、驳回 |
| services/creditService.ts | backend/src/services/creditService.ts | 信用分扣除逻辑（被举报成立时调用）、信用分查询 |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/reports', reportRoutes)` |
| middleware/auth.ts | backend/src/middleware/auth.ts | 普通用户/管理员权限中间件 |

## 数据流图（文字描述）

```
用户 → ReportModal.tsx → reportAPI.submit(targetId, reason, description)
→ POST /api/reports → report.ts → reportService.ts (submitReport)
→ 校验（查重、不能自举报） → Prisma 创建举报记录 → 返回

管理员 → AdminReports.tsx → reportAPI.getList(status, page)
→ GET /api/reports?status=PENDING → report.ts → reportService.ts (getReports) → Prisma 查询

管理员 → 通过举报 → reportAPI.approve(id) → PUT /api/reports/:id/approve
→ report.ts → reportService.ts (approveReport) → 事务：更新举报状态 + deductCreditService
→ creditService.ts → 扣除信用分20 → 若信用分为0则封禁

管理员 → 驳回举报 → reportAPI.reject(id) → PUT /api/reports/:id/reject
→ report.ts → reportService.ts (rejectReport) → 更新举报状态为 REJECTED
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/reports | 提交举报 | 是（USER） |
| GET | /api/reports | 获取举报列表 | 是（ADMIN） |
| PUT | /api/reports/:id/approve | 通过举报 | 是（ADMIN） |
| PUT | /api/reports/:id/reject | 驳回举报 | 是（ADMIN） |
