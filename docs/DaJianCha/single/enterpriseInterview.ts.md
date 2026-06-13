# enterpriseInterview.ts (routes)

**文件路径**: backend/src/routes/enterpriseInterview.ts

## 职责概述
企业面试路由，管理企业发起的面试流程（创建、获取、进入面试室等）。

## 代码质量分析
- 面试完整流程管理
- 从 enterpriseInterviewService 导入服务函数
- 权限控制完整

### 依赖关系
- 导入 services: enterpriseInterviewService
- 导入 middleware: auth
