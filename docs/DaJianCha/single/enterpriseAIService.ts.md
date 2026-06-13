# enterpriseAIService.ts

**文件路径**: `backend/src/services/enterpriseAIService.ts`

## 功能概述

对接腾讯元启 AI 智能体 API，为 HR 提供自定义评分标准下的简历智能分析服务，支持按照岗位要求逐一打分并生成综合评价。

## 导出类型与函数

| 导出项 | 签名 | 简述 |
|--------|------|------|
| `ScoringConfig` | `interface` | 评分配置：及格线、优秀线、得分点列表、评分标准说明、考察要点 |
| `AIAnalysisResult` | `interface` | 分析结果：总分、是否通过、等级、得分点详情、优势/劣势、总结 |
| `analyzeResumeWithConfig` | `(resumeContent, jobTitle, config, userId): Promise<AIAnalysisResult>` | 核心函数，按 HR 自定义评分标准调用 AI 分析简历 |
| `analyzeApplicationResume` | `(applicationId, config, enterpriseUserId): Promise<AIAnalysisResult>` | 高阶函数，从数据库获取申请关联简历，调用 AI 分析后结果持久化到 `aiAnalysis` 字段 |

## 关键逻辑

- **Prompt 模板**：动态构建包含岗位名称、得分点列表、评分标准、考察要点、及格/优秀线的结构化提示词
- **AI 响应解析**：`extractJson` 工具函数从 AI 返回文本中提取第一个 JSON 对象，兼容 markdown 代码块和非标准输出
- **结果持久化**：`analyzeApplicationResume` 在 AI 分析后将结果存入数据库 `application.aiAnalysis` 字段
- **安全配置**：APPID 和 APPKEY 从环境变量读取，缺失时抛出明确错误

## 依赖关系

- `axios`：HTTP 客户端调用元启 API
- `prisma`（从 `../index` 导入）：查询申请、简历、职位数据并写入 AI 分析结果
- 腾讯元启开放平台 API：`https://yuanqi.tencent.com/openapi/v1/agent/chat/completions`
