# enterpriseService.ts

**文件路径**: `backend/src/services/enterpriseService.ts`

## 功能概述

企业账号的完整生命周期管理，涵盖注册、登录、资料查询/更新及 Dashboard 数据统计。

## 导出类型与函数

| 导出项 | 签名 | 简述 |
|--------|------|------|
| `EnterpriseRegisterData` | `interface` | 企业注册数据：邮箱、密码、名称、描述、Logo、网址、行业、规模、位置等 |
| `EnterpriseLoginData` | `interface` | 企业登录数据：邮箱、密码 |
| `EnterpriseUpdateData` | `interface` | 企业资料更新数据：可选字段，所有字段均可部分更新 |
| `registerEnterprise` | `(data: EnterpriseRegisterData): Promise<{ enterprise, user, token }>` | 企业注册，事务中同时创建 User 和 Enterprise 记录，返回 JWT |
| `loginEnterprise` | `(data: EnterpriseLoginData): Promise<{ enterprise, user, token }>` | 企业登录，验证密码和角色后返回企业信息和 JWT |
| `getEnterpriseProfile` | `(userId: string): Promise<Enterprise>` | 根据企业负责人用户 ID 查询企业资料 |
| `updateEnterpriseProfile` | `(userId: string, data: EnterpriseUpdateData): Promise<Enterprise>` | 部分更新企业资料 |
| `getDashboardStats` | `(enterpriseId: string): Promise<DashboardStats>` | 获取 Dashboard 统计数据，含招聘漏斗、近 7 天申请趋势、职位热度排行 |

## 关键逻辑

- **事务注册**：`registerEnterprise` 在同一事务中创建 `User`（role=ENTERPRISE）和 `Enterprise`，确保原子性
- **招聘漏斗**：`getDashboardStats` 统计职位数 → 申请数 → 面试数 → 录用数四级漏斗数据
- **趋势分析**：手动计算近 7 天每日申请量，用于前端趋势图渲染
- **热度排行**：按申请数对职位排序并截取 Top 5

## 依赖关系

- `bcryptjs`：密码哈希与验证
- `jsonwebtoken`：JWT 签发
- `prisma`（从 `../index` 导入）：数据查询与写入
- `../config`：`JWT_SECRET`、`JWT_EXPIRES_IN`、`BCRYPT_SALT_ROUNDS` 配置常量
