# reportService.ts

**文件路径**: `backend/src/services/reportService.ts`

## 功能概述

用户举报系统的业务逻辑，包括提交举报、管理员查看举报列表、通过举报（联动信用分扣除）、驳回举报。

## 导出函数列表

| 函数 | 签名 | 简述 |
|------|------|------|
| `submitReport` | `(reporterId, targetId, reason, description?): Promise<Complaint>` | 提交举报，校验举报原因合法性、防自举报、防重复举报 |
| `getReports` | `(status?, pagination?): Promise<{ reports, pagination }>` | 获取举报列表，支持按状态筛选，含举报人/被举报人/处理人关联信息 |
| `approveReport` | `(reportId, handlerId): Promise<Complaint>` | 通过举报，事务中更新举报状态并调用 `deductCreditScore` 扣除被举报人 20 分 |
| `rejectReport` | `(reportId, handlerId): Promise<Complaint>` | 驳回举报，仅更新状态为 REJECTED |

## 关键逻辑

- **防重复举报**：`submitReport` 检查同一举报人对同一被举报人是否已有 PENDING 状态的举报，防止骚扰性重复举报
- **事务联动**：`approveReport` 在数据库事务中同步执行举报通过 + 信用分扣除，保证一致性
- **原因枚举**：仅允许 `['虚假信息', '骚扰', '欺诈', '其他']` 四种举报原因
- **双人关联**：举报记录同时存储 `reporterId` 和 `targetId`，查询时附带回举报人和被举报人的基础信息

## 依赖关系

- `prisma`（从 `../index` 导入）：数据查询与写入
- `./creditService`：`deductCreditScore` 函数
- `../utils/pagination`：`parsePagination`、`buildPagination`
