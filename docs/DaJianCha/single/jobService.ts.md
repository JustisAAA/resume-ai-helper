# jobService.ts

**文件路径**: `backend/src/services/jobService.ts`

## 功能概述

职位管理的完整业务逻辑，包括职位的创建（自动绑定 HR）、列表查询、详情查看、更新、删除（软删除）、状态变更。

## 导出类型与函数

| 导出项 | 签名 | 简述 |
|--------|------|------|
| `JobCreateData` | `interface` | 职位创建数据 + 内嵌 HR 配置（姓名、邮箱、密码） |
| `JobUpdateData` | `interface` | 职位更新数据，所有字段可选 |
| `createJob` | `(enterpriseId, data: JobCreateData): Promise<{ job, hrResult }>` | 创建职位，事务中同时创建 Job、HR User、HRAccount 三条记录 |
| `getJobs` | `(enterpriseId?, status?, pagination?): Promise<{ jobs, pagination }>` | 查询职位列表，支持按企业/状态筛选，默认排除 DELETED |
| `getJobById` | `(jobId: string): Promise<Job>` | 获取职位详情，含企业信息、HR 信息、所有申请及申请人 |
| `updateJob` | `(jobId, enterpriseId, data): Promise<Job>` | 更新职位信息，校验职位归属 |
| `deleteJob` | `(jobId, enterpriseId): Promise<{ message }>` | 软删除职位，仅将状态设为 DELETED，保留关联数据 |
| `updateJobStatus` | `(jobId, enterpriseId, status): Promise<Job>` | 更新职位状态（如 ACTIVE/CLOSED） |

## 关键逻辑

- **职位+HR 一起创建**：`createJob` 在单个事务中执行 Job 创建 + HR User 创建 + HRAccount 创建，保证数据一致性；HR 密码在校验长度后 bcrypt 哈希
- **软删除**：`deleteJob` 不实际删除数据，仅标记 `status = 'DELETED'`，保护面试记录和申请历史
- **权限校验**：`updateJob`、`deleteJob`、`updateJobStatus` 均检查 `job.enterpriseId === enterpriseId` 确保企业只能操作自己的职位
- **排重**：创建 HR 时检查邮箱唯一性

## 依赖关系

- `prisma`（从 `../index` 导入）：数据查询与写入
- `@prisma/client`：`JobStatus` 枚举
- `bcryptjs`：HR 用户密码哈希
- `../utils/pagination`：`parsePagination`、`buildPagination`
- `../config`：`BCRYPT_SALT_ROUNDS`
