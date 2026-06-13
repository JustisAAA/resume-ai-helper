# utils/exportPdf.ts

**文件路径**: frontend/src/utils/exportPdf.ts

## 职责概述
PDF 导出工具函数，支持文本导出和报告导出两种模式。

## 代码质量分析

### 优点
- 支持中文内容导出
- 自动处理分页和文字截断
- 三种导出功能：exportTextToPdf / exportReportToPDF / exportResumeDataToPdf

### 问题
- 使用 html2pdf.js + jsPDF + html2canvas 三个库，包较大
- CSS 样式通过 innerHTML 字符串拼接，维护性差

## 依赖关系
- 被 ToolsOptimize、ToolsQuestions、InterviewReport 等导入
