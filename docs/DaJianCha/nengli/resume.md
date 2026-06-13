# 简历管理功能

## 功能概述
求职者上传 PDF/DOCX 简历文件、查看简历列表、浏览简历详情、触发 AI 分析与评分、应用模板生成格式化简历。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| ResumeList.tsx | frontend/src/pages/ResumeList.tsx | 简历列表展示，支持删除与状态筛选 |
| ResumeUpload.tsx | frontend/src/pages/ResumeUpload.tsx | 简历文件上传页面，支持 PDF/DOCX |
| ResumeDetail.tsx | frontend/src/pages/ResumeDetail.tsx | 简历详情查看，展示 AI 分析结果与评分 |
| api.ts | frontend/src/services/api.ts | 定义 resumeAPI（list/upload/getDetail/delete/analyze/score/applyTemplate） |
| schemas/resumeSchema.ts | frontend/src/schemas/resumeSchema.ts | 简历标题的 Zod 校验规则 |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| resume.ts | backend/src/routes/resume.ts | 简历 CRUD、文件上传与解析（pdf-parse/mammoth）、AI 分析评分与模板生成接口 |
| uploadMiddleware.ts | backend/src/middleware/uploadMiddleware.ts | Multer 配置：简历文件过滤（PDF/DOCX）、大小限制（10MB） |
| config/index.ts | backend/src/config/index.ts | 上传限制、腾讯元器 API 配置等 |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/resumes', resumeRoutes)` |

## 数据流图（文字描述）

```
ResumeUpload.tsx → 选择文件 → api.ts (resumeAPI.upload) → POST /api/resumes/upload
→ resume.ts → multer 接收文件 → pdf-parse/mammoth 解析文本 → Prisma 创建记录 → 返回简历

ResumeList.tsx → api.ts (resumeAPI.list) → GET /api/resumes → resume.ts → Prisma 查询 → 返回列表

ResumeDetail.tsx → api.ts (resumeAPI.getDetail/analyze/score) → GET|POST /api/resumes/:id
→ resume.ts → 调用腾讯元器 API 分析/评分 → 回写数据库 → 返回分析结果
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/resumes | 获取简历列表 | 是（USER） |
| POST | /api/resumes/upload | 上传简历文件 | 是（USER） |
| POST | /api/resumes | 手动创建简历 | 是（USER） |
| GET | /api/resumes/:id | 获取简历详情 | 是（USER） |
| PUT | /api/resumes/:id | 更新简历 | 是（USER） |
| DELETE | /api/resumes/:id | 删除简历 | 是（USER） |
| POST | /api/resumes/:id/analyze | AI 分析简历 | 是（USER） |
| POST | /api/resumes/:id/score | AI 评分简历 | 是（USER） |
| POST | /api/resumes/:id/apply-template | 应用模板生成简历 | 是（USER） |
