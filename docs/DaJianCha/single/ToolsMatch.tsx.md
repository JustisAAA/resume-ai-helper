# ToolsMatch.tsx

**文件路径**: frontend/src/pages/ToolsMatch.tsx

## 职责概述
简历-职位匹配度分析工具，支持输入简历内容和职位描述，使用 AI 进行多维度匹配分析并展示结果。

## 代码质量分析

### 优点
- MatchResult 类型定义完整（score 分数、keyword 匹配、skill_matrix、overpackaging 检测等）
- 提供示例简历和职位描述，降低用户使用门槛
- 输出结果维度丰富：总体评分、技能矩阵、过度包装检测、模块分析等

### 问题
- 文件较大（443 行），输入表单和结果展示混合
- 内联示例数据（EXAMPLE_RESUME / EXAMPLE_JD）增加了文件体积
- 类型定义中大量可选字段 `?`，对前端渲染缺少空值保护

### 建议
- 将示例数据移至单独的常量文件
- 拆分结果展示组件（ScoreCard, SkillMatrixCard, SectionAnalysisCard 等）
- 提供空值/undefined 的 fallback UI

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useRef
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../services/api`: toolsAPI
- `../components/Loading`: ButtonSpinner
