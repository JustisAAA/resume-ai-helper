# 文件上传功能

## 功能概述
支持多种类型文件上传：企业职位图片上传、企业 Logo 上传、简历文件上传、用户头像上传。不同类型的文件使用不同的上传中间件和存储路径。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| api.ts | frontend/src/services/api.ts | 包含多个上传相关调用：authAPI.uploadAvatar（头像上传）、enterpriseAPI（通过 uploadJobImage 等） |
| hrAPI.ts | frontend/src/services/hrAPI.ts | HR 端可能涉及的上传操作 |

前端页面中涉及上传的组件：
- 企业 Logo 上传：EnterpriseProfileEdit.tsx（通过 enterpriseAPI.updateProfile 上传）
- 职位图片上传：EnterpriseJobEdit.tsx（通过 jobAPI.create/update 传入 images）
- 简历文件上传：ResumeUpload.tsx（通过 resumeAPI.upload）
- 头像上传：Profile.tsx（通过 authAPI.uploadAvatar）

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| upload.ts | backend/src/routes/upload.ts | 职位图片上传接口（POST /api/upload/job-image） |
| uploadMiddleware.ts | backend/src/middleware/uploadMiddleware.ts | 统一 Multer 上传中间件：uploadJobImage（职位图片/5MB/JPG-PNG-WebP）、uploadResumeFile（简历/10MB/PDF-DOCX）、uploadLogo（Logo/2MB/JPG-PNG-WebP-SVG） |
| config/index.ts | backend/src/config/index.ts | 上传限制配置：UPLOAD_LIMITS（avatar/jobImage/resume/logo 各文件类型大小限制） |
| index.ts | backend/src/index.ts | 静态文件服务配置：公开静态资源（uploads/jobs、uploads/avatars）和需认证的简历文件（uploads/resumes） |
| middleware/auth.ts | backend/src/middleware/auth.ts | 简历文件访问需 authenticateToken 认证，岗位图片/头像可公开访问 |

## 数据流图（文字描述）

```
前端选择文件 → FormData 构建 → API 调用
├── POST /api/upload/job-image → upload.ts → uploadMiddleware.uploadJobImage → 存至 uploads/jobs/ → 返回 URL
├── POST /api/enterprise/profile → enterprise.ts → uploadMiddleware.uploadLogo → 存至 uploads/logos/ → 返回 URL
├── POST /api/resumes/upload → resume.ts → multer → 存至 uploads/ → Prisma 创建记录
└── POST /api/auth/me/avatar → auth.ts → multer → 存至 uploads/avatars/ → Prisma 更新用户 avatar 字段

静态文件访问：
├── /uploads/jobs/* → 公开访问，7天缓存
├── /uploads/avatars/* → 公开访问，7天缓存
└── /uploads/resumes/* → 需 JWT 认证访问，无缓存
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/upload/job-image | 上传职位图片 | 是（ENTERPRISE） |
| POST | /api/auth/me/avatar | 上传用户头像 | 是 |
| POST | /api/resumes/upload | 上传简历文件 | 是（USER） |
| PUT | /api/enterprise/profile | 更新企业资料（含 Logo 上传） | 是（ENTERPRISE） |

## 文件存储目录结构

```
uploads/
├── avatars/     # 用户头像（公开访问）
├── jobs/        # 职位图片（公开访问）
├── logos/       # 企业 Logo（公开访问）
├── resumes/     # 简历文件（需认证访问）
└── temp/        # 临时文件（AI 工具集文件解析使用，处理后即删除）
```
