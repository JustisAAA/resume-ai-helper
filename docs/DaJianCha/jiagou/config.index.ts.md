# config/index.ts

**文件路径**: `backend/src/config/index.ts`

## 职责概述

应用配置集中管理模块，统一封装所有环境变量、默认值和常量，消除各模块重复的配置读取代码。在服务启动时做致命校验，缺少关键配置（如 JWT_SECRET）直接阻止启动。

## 核心功能

### 1. JWT 认证配置
- 从环境变量读取 `JWT_SECRET`，缺失则抛出致命错误
- 令牌过期时间固定为 `7d`

### 2. 密码策略
- `BCRYPT_SALT_ROUNDS = 10`
- `PASSWORD_MIN_LENGTH = 8`

### 3. 分页配置
- 默认每页 `20` 条
- 最大每页 `100` 条

### 4. 文件上传限制
- 头像 2MB、职位图片 5MB、简历 10MB、Logo 2MB

### 5. AI API 配置
- **腾讯元器** (`YUANQI_CONFIG`): baseURL、appId、appKey 两套（通用 + 企业），均从环境变量读取
- **硅基流动** (`SILICONFLOW_CONFIG`): apiKey、baseURL，作为备用 AI 服务

### 6. 模拟模式
- `isMockMode()` 函数返回 `MOCK_MODE` 环境变量是否为 `"true"`

## 外部依赖

- 无第三方包依赖，仅使用 `process.env`

## 调用关系

- 所有后端模块通过 `import { JWT_SECRET, ... } from '../config'` 引用配置
