# AI 工具集功能

## 功能概述
为求职者提供 AI 驱动的求职辅助工具：简历优化、岗位匹配分析、面试问题生成、简历评分、面试辅导与职业趋势预测。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| ToolsOptimize.tsx | frontend/src/pages/ToolsOptimize.tsx | 简历优化工具页 |
| ToolsMatch.tsx | frontend/src/pages/ToolsMatch.tsx | 岗位匹配分析工具页 |
| ToolsQuestions.tsx | frontend/src/pages/ToolsQuestions.tsx | 面试问题生成工具页 |
| ToolsScore.tsx | frontend/src/pages/ToolsScore.tsx | 简历评分工具页 |
| ToolsGuide.tsx | frontend/src/pages/ToolsGuide.tsx | 面试辅导工具页 |
| api.ts | frontend/src/services/api.ts | 定义 toolsAPI（match/questions/guide/parseFile/optimize/trend） |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| tools.ts | backend/src/routes/tools.ts | 工具路由：简历优化、岗位匹配（含语义相似度和过度包装词检测）、面试题生成、面试辅导、文件解析、岗位趋势预测（AI 驱动+本地 Fallback） |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/tools', toolsRoutes)` |
| middleware/auth.ts | backend/src/middleware/auth.ts | 用户权限校验（requireUser） |
| middleware/rateLimit.ts | backend/src/middleware/rateLimit.ts | AI 调用限流 |
| utils/extractError.ts | backend/src/utils/extractError.ts | API 错误信息提取 |

## 数据流图（文字描述）

```
ToolsOptimize.tsx → api.ts (toolsAPI.optimize) → POST /api/tools/optimize
→ tools.ts → 调用腾讯元器 AI → AI 返回优化后简历 JSON → 前端展示

ToolsMatch.tsx → api.ts (toolsAPI.match) → POST /api/tools/match
→ tools.ts → 腾讯元器 AI 分析匹配度 + Embedding 语义相似度计算 + 过度包装词检测 → 返回匹配报告

ToolsQuestions.tsx → api.ts (toolsAPI.questions) → POST /api/tools/questions
→ tools.ts → 腾讯元器 AI 根据简历/JD 生成面试题 → 返回问题列表

ToolsGuide.tsx → api.ts (toolsAPI.guide) → POST /api/tools/guide
→ tools.ts → 腾讯元器 AI 生成求职攻略 → 返回 Markdown/JSON

ToolsScore.tsx → 依赖 resumeAPI.score → POST /api/resumes/:id/score
→ resume.ts → 腾讯元器 AI 评分 → 返回评分结果
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/tools/optimize | 简历优化 | 是（USER） |
| POST | /api/tools/match | 岗位匹配分析 | 是（USER） |
| POST | /api/tools/questions | 面试问题生成 | 是（USER） |
| POST | /api/tools/guide | 面试辅导 | 是（USER） |
| POST | /api/tools/trend | 岗位趋势预测 | 是（USER） |
| POST | /api/tools/parse-file | 文件解析（PDF/DOCX 转文本） | 是（USER） |
