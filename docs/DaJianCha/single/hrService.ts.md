# hrService.ts

**文件路径**: `backend/src/services/hrService.ts`

## 功能概述

HR 子账号系统的业务逻辑层，覆盖 HR 登录、Dashboard 信息获取、申请管理、个人设置，以及企业组长对 HR 账号的增删改管理。

## 导出函数列表

| 函数 | 签名 | 简述 |
|------|------|------|
| `hrLogin` | `(email: string, password: string): Promise<{ token, hr }>` | HR 登录，验证邮箱、密码、角色、封禁状态、账号活跃状态 |
| `getHRDashboard` | `(userId: string): Promise<DashboardData>` | 获取 HR 工作台信息，含关联企业、绑定职位、各状态申请数量统计 |
| `getHRApplications` | `(userId, pagination?): Promise<{ applications, pagination }>` | 获取 HR 绑定职位的申请列表（分页） |
| `getHRApplicationResume` | `(userId, applicationId): Promise<{ resume, application }>` | 获取申请详情及简历，含 AI 分析结果 |
| `updateHRApplicationStatus` | `(userId, applicationId, status): Promise<Application>` | 更新申请状态（通过/拒绝等） |
| `updateHRProfile` | `(userId, data): Promise<User>` | 更新 HR 个人信息和密码，同步更新 HRAccount 名称 |
| `createHRAccount` | `(enterpriseUserId, jobId, hrEmail, hrPassword, hrName): Promise<{ hrAccount, email }>` | 企业组长创建 HR 子账号，一个职位只能绑定一个 HR |
| `getEnterpriseHRs` | `(enterpriseUserId, pagination?): Promise<{ hrs, pagination }>` | 企业组长查看旗下所有 HR 账号（分页） |
| `toggleHRActive` | `(enterpriseUserId, hrAccountId, isActive): Promise<HRAccount>` | 启用/停用 HR 账号 |
| `reassignHRJob` | `(enterpriseUserId, hrAccountId, newJobId): Promise<HRAccount>` | 将 HR 重新分配到其他职位 |

## 关键逻辑

- **职位隔离**：HR 只负责绑定的单个职位，所有查询和操作均受 `hrAccount.jobId` 约束
- **状态校验**：登录时检查 `user.status !== 'BANNED'` 和 `hrAccount.isActive` 双重校验
- **权限分层**：`createHRAccount`、`getEnterpriseHRs`、`toggleHRActive`、`reassignHRJob` 四个管理函数仅限企业组长（ENTERPRISE 角色）调用
- **唯一约束**：一个职位只能绑定一个活跃的 HR 账号

## 依赖关系

- `prisma`（从 `../index` 导入）：数据查询与写入
- `bcryptjs`：密码哈希
- `jsonwebtoken`：JWT 签发
- `../utils/pagination`：`parsePagination`、`buildPagination`
- `../config`：`JWT_SECRET`、`BCRYPT_SALT_ROUNDS`
