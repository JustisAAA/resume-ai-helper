# interview.full.ts (routes)

**文件路径**: backend/src/routes/interview.full.ts

## 职责概述
面试核心路由模块（1157 行），管理 AI 面试的完整流程，包括创建、问答交互、评分、提交答案等。

## 代码质量分析
### 优点
- 功能全面：创建、回答、评分、历史查询
- 与 AI 模型对接实现智能问答和自动评分
- 支持面试状态流转

### 问题
- 文件极大（1157 行），核心面试逻辑过于集中
- 使用多个 `any` 类型断言
- AI 交互逻辑和路由处理混合

### 建议
- 拆分为多个文件：面试流、AI 对话、评分
- 为 AI 交互提取专门的服务层

## 依赖关系
- 导入 middleware: auth
- 导入 utils: sanitize, extractError
