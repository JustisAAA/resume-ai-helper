# ToolsOptimize.tsx

**文件路径**: frontend/src/pages/ToolsOptimize.tsx

## 职责概述
简历优化工具页面，提供简历内容输入、目标岗位设定和 AI 自动优化功能，包含匹配分析和导出 PDF 能力。

## 代码质量分析

### 优点
- 类型定义完善：MatchAnalysis、OptimizeRequest、OptimizeResult 等接口定义清晰
- 使用了 exportResumeDataToPdf 导出功能，结果可打印
- Toast 组件的 useToast 用于操作反馈

### 问题
- 依赖列表缺少一些 key
- 文件较大（574 行），包含表单 UI、结果展示、PDF 导出等混合逻辑
- 优化结果的数据结构可能过于复杂（嵌套的 MatchAnalysis 等）

### 建议
- 将优化结果展示和 PDF 导出逻辑拆分为子组件
- 考虑添加优化进度的加载动画

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useRef
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../components/Toast`: useToast
- `../utils/exportPdf`: exportResumeDataToPdf
- `../services/api`: toolsAPI
- `../components/Loading`: ButtonSpinner
