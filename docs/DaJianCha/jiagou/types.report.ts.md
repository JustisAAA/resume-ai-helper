# types/report.ts

**文件路径**: `frontend/src/types/report.ts`

## 职责概述

前端面试报告相关 TypeScript 类型定义文件。集中管理面试维度得分、题目回顾、统计数据以及完整报告的数据结构，确保前后端数据交互的类型安全。

## 核心类型

### DimensionScore
- `Record<string, number>` — 维度名称到分数的映射

### QuestionReview
单题回顾，包含题号、题目、回答、评分、评语、亮点和改进建议

### InterviewStats
面试统计摘要：题目总数、总耗时、平均回答长度、高分/低分题数

### ReportData
完整面试报告的数据结构：
- `overall_score` — 总体评分
- `pass_probability` — 通过概率描述
- `dimension_scores` — 各维度得分
- `question_reviews` — 逐题回顾
- `strengths / improvements` — 优缺点
- `optimization_suggestions` — 优化建议
- `interview_review` — 面试总览（题数、时长、主题、总结）
- `interview_stats` — 统计数据
- `final_advice` — 最终建议

### InterviewData
面试数据结构，包含 ID、标题、岗位、难度、状态、分数、时长、问题列表、回答列表和反馈报告

### AnswerData
单条回答记录，含题目、回答文本、分数、评语和亮点

## 外部依赖

- 无（纯 TypeScript 类型声明）

## 调用关系

- 被所有面试报告相关的前端组件引用（InterviewReport.tsx、EnterpriseInterviewReport.tsx 等）
- 与后端 `reportService` 返回的 JSON 结构对应
