# hrAPI.ts

**文件路径**: frontend/src/services/hrAPI.ts

## 职责概述
HR 专属 API 服务层，封装了 HR 登录、投递管理、面试管理、消息和设置等接口。

## 代码质量分析

### 优点
- 独立的 axios 实例，自动附加 token
- 从 api.ts 导入 ScoringConfig/InterviewConfig 类型
- 请求拦截器支持 hrToken 优先

### 问题
- 所有 API 返回类型未定义，调用方使用 `.data` 推断
- 请求参数手动拼接 URLSearchParams，不够简洁

## 依赖关系
- 被 HR 相关页面导入
