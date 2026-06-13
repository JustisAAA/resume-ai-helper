# hr.ts (routes)

**文件路径**: backend/src/routes/hr.ts

## 职责概述
HR 管理路由，支持 HR 登录/注册、投递管理、面试管理和消息功能。

## 代码质量分析
- CRUD 操作覆盖完整
- 使用了 authenticateToken 和 requireEnterprise 权限
- HR 专属业务逻辑清晰

### 依赖关系
- 导入 services: hrService
- 导入 middleware: auth
