# resume.ts (routes)

**文件路径**: backend/src/routes/resume.ts

## 职责概述
简历管理路由，支持简历上传、列表查询、删除和 AI 评分。

## 代码质量分析

### 优点
- 使用 multer 处理文件上传
- 支持 PDF 解析（pdf-parse）和 Word 解析（mammoth）
- AI 评分功能对接了大模型 API

### 问题
- 文件较大（519 行），文件上传、AI 分析和 CRUD 混合
- 硬编码了部分上传路径

## 依赖关系
- 导入 middleware: auth
- 导入 utils: sanitize, extractError
