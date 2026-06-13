# data/templates.ts

**文件路径**: `frontend/src/data/templates.ts`

## 职责概述

简历模板数据定义模块。声明简历模板的类型接口并提供预置模板数据集，供模板选择页面展示和用户选择使用。

## 核心功能

### 1. `ResumeTemplate` 接口
- `id: string` — 唯一标识
- `name: string` — 模板中文名称
- `description: string` — 适用场景描述
- `thumbnail: string` — 预览图标识
- `category: 'minimal' | 'modern' | 'business' | 'creative' | 'simple'` — 风格分类
- `color: string` — 主题色 Tailwind 渐变类
- `bgGradient: string` — 预览背景渐变

### 2. `RESUME_TEMPLATES` 常量数组
预置 5 套模板：

| ID | 名称 | 风格 | 适用场景 |
|----|------|------|---------|
| minimal | 简约经典 | 传统 | 传统行业、国企 |
| modern | 现代时尚 | 现代 | 互联网、创意行业 |
| business | 商务专业 | 商务 | 金融、咨询 |
| creative | 创意个性 | 创意 | 设计、广告、传媒 |
| simple | 极简清新 | 极简 | 应届生、管培生 |

## 外部依赖

- 无（纯数据类型定义）

## 调用关系

- 被 `Templates.tsx` 和 `TemplateApply.tsx` 页面引用
- 与新简历上传/创建流程配合，允许用户在提交简历前选择模板风格
