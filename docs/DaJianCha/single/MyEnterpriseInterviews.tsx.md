# MyEnterpriseInterviews.tsx

**文件路径**: frontend/src/pages/MyEnterpriseInterviews.tsx

## 职责概述
求职者端企业面试列表，展示企业发起的面试，支持按状态查看和进入面试。

## 代码质量分析

### 优点
- EnterpriseInterview 接口定义清晰
- STATUS_CONFIG 常量管理面试状态映射，包括 label/color/bg/icon
- 使用 heroicons 图标配合状态展示，视觉清晰

### 问题
- 缺少面试类型区分（技术面/HR面）
- 没有面试时间或日程安排信息
- 缺少面试倒计时提醒

### 建议
- 添加面试类型和面试时间字段
- 集成日历或日程提醒功能
- 在面试即将开始前推送通知

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../services/api`: interviewAPI
- `@heroicons/react/24/outline`: ArrowLeftIcon, PlayCircleIcon 等
- `../components/Loading`
- `../components/EmptyState`
