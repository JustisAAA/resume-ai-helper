# InterviewRoom.tsx

**文件路径**: frontend/src/pages/InterviewRoom.tsx

## 职责概述
AI 模拟面试室核心页面，管理面试问答交互流程，包含聊天历史、实时评分、语音输入和面试结束处理。

## 代码质量分析

### 优点
- 使用 react-hook-form + zod 管理答案表单，思路清晰
- chatHistory 数组类型定义详细（含 score, comment, highlights, improvements）
- 使用 useRef 管理 WebSocket 或定时任务引用

### 问题
- 文件体积大（872 行），一个组件承载了聊天 UI、评分展示、语音控制等多重职责
- useRef 管理 WebSocket 连接，但缺少断线重连逻辑
- 表单状态（answer）与 react-hook-form 通过 useEffect 同步，略显笨拙

### 建议
- 拆分为多个子组件：聊天区、评分面板、语音控制条
- 提取 WebSocket 连接逻辑为自定义 Hook
- 考虑 useWatch 替代手动同步 answer 状态

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState, useRef, useCallback
- `react-router-dom`: useParams, useNavigate
- `react-hook-form`: useForm
- `@hookform/resolvers/zod`: zodResolver
- `../context/ThemeContext`: useTheme
- `../services/api`: interviewAPI, Interview
- `../utils/api`: getApiBaseUrl
- `../schemas/answerSchema`: answerSchema, AnswerFormData
- `../components/Loading`: Loading, ButtonSpinner
- `../components/ErrorAlert`
- `../components/ThemeToggle`
