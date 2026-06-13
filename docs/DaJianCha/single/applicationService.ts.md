# applicationService.ts

**文件路径**: `backend/src/services/applicationService.ts`

## 功能概述

提供企业端职位申请管理的业务逻辑，包括申请列表查询、申请状态更新、申请详情查看等操作，均包含企业权限验证。

## 导出函数列表

| 函数 | 签名 | 简述 |
|------|------|------|
| `getApplicationsByJobId` | `(jobId: string, enterpriseId: string): Promise<Application[]>` | 按职位 ID 获取申请列表，含用户、简历、职位关联数据，按创建时间倒序 |
| `updateApplicationStatus` | `(applicationId: string, enterpriseId: string, status: ApplicationStatus): Promise<Application>` | 更新指定申请的审核状态，验证申请所属职位是否属于当前企业 |
| `getApplicationResume` | `(applicationId: string, enterpriseId: string): Promise<Resume>` | 获取申请关联的简历完整信息（含原始文本和 AI 分析结果） |
| `getApplicationById` | `(applicationId: string, enterpriseId: string): Promise<Application>` | 获取单个申请的详细信息，含用户、简历、职位的关联数据 |

## 关键逻辑

- **权限验证**：每个函数均通过 `enterpriseId` 校验其与职位所属企业的一致性，确保企业只能操作自己职位的申请
- **关联数据查询**：使用 Prisma `include` 嵌套加载 `user`、`resume`、`job` 的关联字段，减少客户端多次请求
- **职责单一**：四个函数分别覆盖了列表、状态变更、简历详情、申请详情四个独立场景

## 依赖关系

- `prisma`（从 `../index` 导入）：Prisma ORM 客户端
- `@prisma/client`：`ApplicationStatus` 枚举类型
