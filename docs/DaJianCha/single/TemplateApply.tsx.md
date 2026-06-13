# TemplateApply.tsx

**文件路径**: frontend/src/pages/TemplateApply.tsx

## 职责概述
简历模板应用页面，选择已有简历后应用模板生成美化后的简历 HTML，支持预览。

## 代码质量分析

### 优点
- stripMarkdownCodeBlock 工具函数设计合理，处理了 AI 返回的 markdown 包裹
- TEMPLATE_NAMES 映射表管理模板中文名称
- 与 resumeAPI 对接获取用户简历列表

### 问题
- 本地定义了 TEMPLATE_NAMES，与 Templates.tsx 中的值重复
- 模板生成的 HTML 直接通过 dangerouslySetInnerHTML 渲染，存在 XSS 风险
- 没有展示生成效果预览图或示例

### 建议
- 将 TEMPLATE_NAMES 抽取为共享常量
- 对模板 HTML 进行消毒处理（sanitize）后再渲染
- 添加应用前后的对比功能

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `react-router-dom`: useParams, useNavigate
- `../components/ThemeToggle`
- `../services/api`: resumeAPI, Resume
- `../components/Loading`
- `../components/ErrorAlert`
- `../components/EmptyState`
