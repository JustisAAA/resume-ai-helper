# 信用分系统

## 功能概述
用户信用分管理，当举报被管理员通过时自动扣除被举报用户信用分，信用分归零则自动封禁账号。

## 前端文件依赖

无独立前端页面。信用分功能作为举报系统（complaint）的后置流程自动执行，不涉及独立的前端交互页面。
信用分信息通过用户资料等页面间接展示（依赖 `AdminUsers.tsx` / `Profile.tsx` 等页面展示用户状态）。

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| services/creditService.ts | backend/src/services/creditService.ts | 信用分核心逻辑：扣除信用分（含事务保护）、查询用户信用分与封禁状态、查询他人信用分（公开接口） |
| services/reportService.ts | backend/src/services/reportService.ts | 举报业务中调用 creditService.deductCreditScore 触发扣分 |
| index.ts | backend/src/index.ts | Prisma 客户端初始化，被 creditService 引用 |

## 数据流图（文字描述）

```
管理员通过举报 → reportService.approveReport() → 开启事务
→ 1. 更新 complaint 状态为 APPROVED
→ 2. 调用 deductCreditScore(targetId, 20, reason, complaintId, tx)
→ creditService.ts → 计算新分数（max(0, 当前分 - 20)）→ 判断是否封禁（<=0）
→ 更新 user.creditScore 和 user.isBanned
→ 创建 creditRecord 记录（含 change=-20, reason）
→ 返回 { isBanned, newScore }
```

## 关键接口

信用分系统不暴露独立的 HTTP API 端点，通过以下内部函数调用：

| 函数 | 所在文件 | 说明 | 调用方 |
|------|---------|------|--------|
| deductCreditScore | creditService.ts | 扣除信用分（支持事务） | reportService.approveReport |
| getCreditInfo | creditService.ts | 获取用户信用分与记录 | 内部调用 |
| getUserCreditScore | creditService.ts | 获取他人信用分 | 内部调用 |
