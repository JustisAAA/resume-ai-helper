# uploadMiddleware.ts

**文件路径**: `backend/src/middleware/uploadMiddleware.ts`

## 功能概述

基于 `multer` 的文件上传中间件，支持职位图片、简历文件（PDF/DOCX）、企业 Logo 三类上传场景，包含目录自动创建、文件类型过滤、大小限制。

## 导出中间件列表

| 导出项 | 存储 | 大小限制 | 允许类型 | 简述 |
|--------|------|----------|----------|------|
| `uploadJobImage` | `uploads/jobs` | 5MB | JPG/PNG/WebP | 职位图片上传，单个文件 |
| `uploadResumeFile` | `uploads/resumes` | 10MB | PDF/DOCX | 简历文件上传，单个文件 |
| `uploadLogo` | `uploads/logos` | 2MB | JPG/PNG/WebP/SVG | 企业 Logo 上传，单个文件 |

## 关键逻辑

- **防重名**：文件名使用 `Date.now() + 随机字符串` 生成唯一名称，避免覆盖已上传文件
- **目录自创建**：启动时检查并自动创建 `uploads/jobs`、`uploads/resumes`、`uploads/logos` 目录
- **文件过滤**：通过 `fileFilter` 函数校验 MIME 类型，不匹配时抛出明确错误信息
- **差异化规则**：不同类型上传使用不同的存储路径、大小限制和文件类型白名单

## 依赖关系

- `multer`：Express 文件上传中间件
- `path`、`fs`：Node.js 内置模块，路径处理和目录检查
