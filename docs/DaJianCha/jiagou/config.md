# 配置管理报告

## 概述

本项目配置采用 **集中式管理** 策略，所有可配置项集中在 `backend/src/config/index.ts` 中统一导出，环境变量通过 `dotenv` 从 `.env` 文件加载。配置覆盖 **JWT 认证**、**密码策略**、**分页参数**、**文件上传限制**、**AI API 集成**、**Mock 模式** 六大领域。前端配置通过 Vite 环境变量（`VITE_` 前缀）管理。

## 详细分析

### 1. 配置架构

```
backend/src/config/index.ts     ← 后端核心配置（从 .env 读取）
backend/.env                     ← 环境变量文件（开发环境）
frontend/.env / .env.production   ← 前端 Vite 环境变量
```

后端配置在 `config/index.ts` 中集中定义，所有其他文件通过 `import { JWT_SECRET } from '../config'` 引用。

### 2. JWT 密钥配置

```typescript
// config/index.ts
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('【致命错误】JWT_SECRET 环境变量未设置，服务拒绝启动');
}
export const JWT_SECRET = jwtSecret;
export const JWT_EXPIRES_IN = '7d' as const;
```

| 配置项 | 值 | 来源 | 说明 |
|--------|-----|------|------|
| JWT_SECRET | `your-jwt-secret-key-change-in-production` | `.env` | 签名密钥，为空则拒绝启动 |
| JWT_EXPIRES_IN | `7d` | 硬编码 | Token 有效期（7天） |

**风险**：当前 `.env` 中的示例密钥 `your-jwt-secret-key-change-in-production` 应替换为强随机字符串。

### 3. 密码策略配置

```typescript
export const BCRYPT_SALT_ROUNDS = 10;
export const PASSWORD_MIN_LENGTH = 8;
```

| 配置项 | 值 | 说明 |
|--------|-----|------|
| BCRYPT_SALT_ROUNDS | 10 | bcrypt 哈希迭代次数 |
| PASSWORD_MIN_LENGTH | 8 | 密码最小长度 |

密码复杂度规则（硬编码在 `routes/auth.ts` 中）：必须同时包含大写字母、小写字母和数字。

### 4. 分页默认值

```typescript
export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;
```

| 配置项 | 值 | 说明 |
|--------|-----|------|
| PAGINATION_DEFAULT_LIMIT | 20 | 每页默认条数 |
| PAGINATION_MAX_LIMIT | 100 | 每页最大条数（防止过量查询） |

在 `utils/pagination.ts` 中通过 `parsePagination()` 使用这些默认值。

### 5. AI API 密钥配置

```typescript
export const YUANQI_CONFIG = {
  baseURL: process.env.YUANQI_BASE_URL || 'https://yuanqi.tencent.com/openapi/v1',
  appId: process.env.YUANQI_APPID || '',
  appKey: process.env.YUANQI_APPKEY || '',
  enterpriseAppId: process.env.YUANQI_ENTERPRISE_APPID || '',
  enterpriseAppKey: process.env.YUANQI_ENTERPRISE_APPKEY || '',
};

export const SILICONFLOW_CONFIG = {
  apiKey: process.env.SILICONFLOW_API_KEY || '',
  baseURL: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
};
```

**腾讯元器**（主 AI 平台）：

| 环境变量 | 当前值 | 说明 |
|---------|--------|------|
| YUANQI_APPID | `2047291498014477504` | 求职者端智能体 ID |
| YUANQI_APPKEY | `bIVToDNxA4s86cn2xe9FFs5jcOl3xWI4` | 求职者端智能体密钥 |
| YUANQI_ENTERPRISE_APPID | `2063433671104457792` | 企业端招聘 AI 助手 ID |
| YUANQI_ENTERPRISE_APPKEY | `gFipTXPk9YpEnICQCsRh4O2c6WPOq1Mi` | 企业端招聘 AI 助手密钥 |
| YUANQI_BASE_URL | `https://yuanqi.tencent.com/openapi/v1` | API 基础地址 |

**硅基流动**（备用 AI 平台）：

| 环境变量 | 当前值 | 说明 |
|---------|--------|------|
| SILICONFLOW_API_KEY | （空） | API 密钥，未配置 |
| SILICONFLOW_BASE_URL | `https://api.siliconflow.cn/v1` | API 基础地址 |

**安全性问题**：密钥直接存储在 `.env` 文件中，上传至 Git 仓库后存在泄露风险。当前 `.env` 已在 `.gitignore` 中排除。

### 6. 上传文件限制

```typescript
export const UPLOAD_LIMITS = {
  avatar: 2 * 1024 * 1024,      // 2MB
  jobImage: 5 * 1024 * 1024,     // 5MB
  resume: 10 * 1024 * 1024,      // 10MB
  logo: 2 * 1024 * 1024,         // 2MB
} as const;
```

这些配置与 `middleware/uploadMiddleware.ts` 中的 `multer({ limits: { fileSize: ... } })` 保持一致。

### 7. Mock 模式配置

```typescript
export const isMockMode = () => process.env.MOCK_MODE === 'true';
```

| 环境变量 | 值 | 说明 |
|---------|-----|------|
| MOCK_MODE | `true` | 开启模拟模式（返回模拟数据，不调用真实 AI API） |

Mock 模式用于：
- 开发阶段无需真实 AI API 密钥
- 演示环境保底方案（即使 API 调用失败也有数据返回）
- 降低开发成本和 API 调用费用

### 8. 前端 Vite 环境变量

```typescript
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3002';
export const API_URL = `${API_BASE}/api`;
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| VITE_API_URL | `http://localhost:3002` | 后端 API 基础地址 |

前端通过 `.env`、`.env.production`、`.env.development` 文件配置不同环境的 `VITE_API_URL`。

### 9. 其他配置

| 配置项 | 值 | 位置 |
|--------|-----|------|
| PORT | `3002`（默认） | `index.ts` 中 `process.env.PORT` |
| CORS_ORIGIN | `http://localhost:5173`（开发） | `index.ts` |
| NODE_ENV | `development`（默认） | 控制 CORS 和生产行为 |
| DATABASE_URL | `file:./prisma/dev.db` | `schema.prisma` 中引用 |

## 评价

### 优点
1. **配置集中管理**：所有可配置项集中到 `config/index.ts`，消除硬编码和重复配置
2. **启动安全性检查**：JWT_SECRET 为空时拒绝启动，防止未配置密钥上线
3. **分页上限约束**：`PAGINATION_MAX_LIMIT` 防止恶意大数量查询
4. **Mock 模式支持**：通过 `MOCK_MODE` 一键切换离线开发和生产模式
5. **TypeScript const 断言**：`as const` 保证配置值的类型精确

### 不足
1. **密钥硬编码到配置文件**：AI API 密钥虽然从 `.env` 读取，但 `.env` 文件的值在版本库中暴露
2. **缺少配置校验**：未对 AI 密钥格式、文件大小参数做校验
3. **前端配置不可动态**：`VITE_API_URL` 在构建时编译，运行时无法修改
4. **缺少环境区分**：`config/index.ts` 未区分 `development`/`production`/`test` 环境

### 改进建议
1. 使用 **Vault** 或 **环境变量注入** 替代 `.env` 文件管理生产密钥
2. 在 `config/index.ts` 中添加配置校验函数，启动时验证所有必要配置
3. 添加环境文件区分：`.env.development`、`.env.production`、`.env.test`
4. 前端 API 地址通过构建时的环境变量注入（CI/CD 步骤中设置），避免硬编码默认值
5. 考虑使用 **AWS Secrets Manager** 或类似服务管理生产环境密钥
