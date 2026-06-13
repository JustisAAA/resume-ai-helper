# utils/api.ts

**文件路径**: frontend/src/utils/api.ts

## 职责概述
API 配置工具，管理 API 基础地址并生成完整 URL。

## 代码质量分析

### 优点
- 支持环境变量配置（VITE_API_URL）
- 导出 getApiUrl（带 /api 前缀）和 getApiBaseUrl（不带前缀）
- 代码简洁（41 行），关注点单一

## 依赖关系
- 被所有 API 服务和多个页面导入
