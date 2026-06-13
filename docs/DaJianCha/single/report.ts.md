# report.ts (routes)

**文件路径**: backend/src/routes/report.ts

## 职责概述
举报系统路由，支持提交举报和查询举报列表。

## 代码质量分析
- 功能简洁（70 行）
- CRUD 操作使用 prisma
- 支持分页查询

### 依赖关系
- 导入 middleware: auth, requireAdmin
