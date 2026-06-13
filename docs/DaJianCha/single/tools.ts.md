# tools.ts (routes)

**文件路径**: backend/src/routes/tools.ts

## 职责概述
AI 工具路由模块，提供简历匹配、问题生成、简历评分、求职指南和趋势预测功能。

## 代码质量分析

### 优点
- 对接大模型 API 实现简历优化、匹配分析等
- 加载 Stack Overflow 2024 真实数据用于趋势预测
- 文件较大（632 行）但功能模块划分清晰

### 问题
- 所有 AI 功能集中在一个文件，可拆分
- 大量使用 `any` 类型

## 依赖关系
- 导入 middleware: auth
- 导入 utils: sanitize, extractError
