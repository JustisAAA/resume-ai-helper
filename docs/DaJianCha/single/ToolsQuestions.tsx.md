# ToolsQuestions.tsx

**文件路径**: frontend/src/pages/ToolsQuestions.tsx

## 职责概述
AI 面试题目生成工具，根据简历和目标岗位生成定制面试问题列表，支持导出 PDF。

## 代码质量分析

### 优点
- Question 和 QuestionsResult 类型定义清晰，包含 difficulty/category/tag 等字段
- 提供 exportTextToPdf 导出功能
- 使用 ErrorAlert 和 EmptyState 处理空数据和错误场景
- 同样提供了示例数据方便用户试用

### 问题
- 问题列表展示缺乏交互性（如展开查看详细分析）
- 示例数据与业务逻辑混合
- 生成了较多问题后缺少收藏或标记重点的功能

### 建议
- 添加问题展开/折叠功能以查看 intent_analysis 等详细分析
- 添加"收藏问题"功能
- 示例数据可提取到 JSON 常量文件

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../components/Toast`: useToast
- `../utils/exportPdf`: exportTextToPdf
- `../services/api`: toolsAPI
- `../components/Loading`: ButtonSpinner
- `../components/ErrorAlert`
- `../components/EmptyState`
