# Pagination.tsx

**文件路径**: frontend/src/components/Pagination.tsx

## 职责概述
通用分页组件，支持页码导航、省略号显示。

## 代码质量分析

### 优点
- getPageNumbers 算法处理了页码省略逻辑（最多显示 7 个页码按钮）
- 导出 PaginationProps 接口便于父组件使用
- totalPages <= 1 时不渲染

### 问题
- 缺少跳转到指定页码功能
- 不支持每页条数选择

## 依赖关系
- 被 JobList、AdminReports、EnterpriseInterviewList 等页面导入
