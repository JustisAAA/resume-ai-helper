# ResumeUpload.tsx

**文件路径**: frontend/src/pages/ResumeUpload.tsx

## 职责概述
简历上传页面，支持选择简历文件并指定模板类型，上传后跳转到简历列表。

## 代码质量分析

### 优点
- 模板映射表 TEMPLATE_NAMES 使用 Record<string, string> 类型约束，写法规范
- URL query string 解析正确的 template 参数，实现了模板选择功能
- 文件上传使用 FormData，符合 RESTful API 规范

### 问题
- 文件类型未做校验，用户可上传非 PDF/Word 格式的文件
- 文件大小未做前端限制
- 无文件拖拽上传支持，用户体验不佳
- 无上传进度指示

### 建议
- 添加文件类型校验（仅允许 .pdf/.doc/.docx）
- 添加文件大小限制提示（如前端限制 10MB）
- 考虑添加拖拽上传区域和上传进度条

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState
- `react-router-dom`: useNavigate, useLocation
- `../components/ThemeToggle`
- `../components/ErrorAlert`
- `../services/api`: resumeAPI
