# enterprise.ts (routes)

**文件路径**: backend/src/routes/enterprise.ts

## 职责概述
企业管理路由，处理企业注册、登录、资料获取/更新和仪表盘数据。

## 代码质量分析

### 优点
- 从 enterpriseService 导入服务层函数，架构分层清晰
- 参数校验细致（邮箱格式、密码长度、行业/规模枚举）
- 使用 uploadLogo 中间件处理 Logo 上传

### 问题
- 注册校验逻辑在前端和后端重复
- 部分错误处理未统一

## 依赖关系
- 导入 services: enterpriseService
- 导入 middleware: auth, uploadMiddleware
