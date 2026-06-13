# creditService.ts

**文件路径**: `backend/src/services/creditService.ts`

## 功能概述

管理用户信用分系统，提供信用分扣除、信用分详情查询、公开信用分查询三个核心能力，支持事务嵌套调用。

## 导出函数列表

| 函数 | 签名 | 简述 |
|------|------|------|
| `deductCreditScore` | `(userId: string, points?: number, reason: string, complaintId?: string, tx?: TransactionClient): Promise<{ isBanned, newScore }>` | 扣除用户信用分，分数最低为 0，若降至 0 则自动封禁用户；支持外部事务传入 |
| `getCreditInfo` | `(userId: string): Promise<{ creditScore, isBanned, records[] }>` | 获取用户的信用分信息及最近 20 条变更记录 |
| `getUserCreditScore` | `(userId: string): Promise<{ creditScore, isBanned }>` | 公开接口，仅返回分数和封禁状态，不含变更记录 |

## 关键逻辑

- **事务支持**：`deductCreditScore` 支持传入外部事务客户端 `tx`，允许被其他模块（如 `reportService.approveReport`）在同一个数据库事务中调用，保证数据一致性
- **自动封禁**：信用分降为 0 时自动设置 `isBanned = true`，系统级封禁机制
- **计分规则**：新分值 = `max(0, 当前分 - 扣分)`，确保不出现负数
- **记录追溯**：每次扣分均写入 `creditRecord` 表，关联 `complaintId` 实现举报溯源

## 依赖关系

- `prisma`（从 `../index` 导入）：Prisma ORM 客户端
