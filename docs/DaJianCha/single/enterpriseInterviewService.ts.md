# enterpriseInterviewService.ts

**文件路径**: `backend/src/services/enterpriseInterviewService.ts`

## 功能概述

企业端面试管理服务，提供面试邀请创建、企业面试列表查询、面试报告查看等功能，所有操作均需权限验证。

## 导出函数列表

| 函数 | 签名 | 简述 |
|------|------|------|
| `createInterview` | `(enterpriseId: string, applicationId: string): Promise<Interview>` | 基于申请创建面试邀请，检查申请职位归属后初始化面试记录（默认中等难度、中文、专业模式） |
| `getEnterpriseInterviews` | `(enterpriseId: string, jobId?: string): Promise<Interview[]>` | 查询企业下的所有面试，通过职位→申请→用户→面试的链路关联 |
| `getInterviewReport` | `(interviewId: string, enterpriseId: string): Promise<Report>` | 获取指定面试的评估报告，验证企业权限 |

## 关键逻辑

- **级联关联查询**：`getEnterpriseInterviews` 采用三级关联——先查企业职位，再查职位申请，最后查申请人面试，确保企业只能看到自己职位的候选人面试
- **权限验证**：`createInterview` 验证申请所属职位是否归企业所有；`getInterviewReport` 验证面试用户是否为该企业职位申请人
- **默认配置**：创建面试时设置 `Difficulty.MEDIUM`、`Language.ZH_CN`、`AIRole.PROFESSIONAL`，支持后续个性化调整

## 依赖关系

- `prisma`（从 `../index` 导入）：数据查询与写入
- `@prisma/client`：`InterviewStatus`、`Difficulty`、`Language`、`AIRole` 枚举
