# pagination.ts

**文件路径**: `backend/src/utils/pagination.ts`

## 功能概述

统一的分页参数解析与元信息构建工具，被所有需要分页查询的服务模块复用。

## 导出接口与函数

| 导出项 | 签名 | 简述 |
|--------|------|------|
| `PaginationParams` | `interface` | 输入参数：`{ page?, limit? }` |
| `PaginationResult` | `interface` | 解析结果：`{ page, limit, skip }` |
| `PaginationMeta` | `interface` | 分页元信息：`{ page, limit, total, totalPages }` |
| `parsePagination` | `(pagination?, maxLimit?): PaginationResult` | 解析分页参数，page 默认 1，limit 默认 20，上限 100；返回含 skip 的查询参数 |
| `buildPagination` | `(page, limit, total): PaginationMeta` | 根据当前页、每页条数和总数构建分页元信息，自动计算 totalPages |

## 关键逻辑

- **安全默认值**：page < 1 时默认 1，limit < 1 时默认 20，超过 maxLimit 时截断
- **skip 计算**：`skip = (page - 1) * limit`，直接适配 Prisma 的 `skip/take` 分页模式
- **复用模式**：所有服务模块统一调用 `parsePagination` + `buildPagination`，保证分页行为一致

## 依赖关系

- 无外部依赖
