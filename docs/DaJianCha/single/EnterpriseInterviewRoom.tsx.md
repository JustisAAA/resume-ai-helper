# EnterpriseInterviewRoom.tsx

**文件路径**: frontend/src/pages/EnterpriseInterviewRoom.tsx

## 职责概述
企业端面试房间页面，企业面试官可以查看候选人面试过程、进行提问和评分，与 AIInterviewerAvatar 组件配合使用。

## 代码质量分析

### 优点
- ChatBubble 内部组件拆分为独立函数，职责清晰
- 消息动画使用 fadeInUp + 交错延迟（index * 0.05s），交互体验好
- AIInterviewerAvatar 作为独立组件引入，组件化思维好

### 问题
- 文件较大（561 行），面试流程和聊天 UI 混合在一起
- 缺少 WebSocket 重连等异常处理
- ChatBubble 组件每次渲染都重新创建函数对象，建议移至组件外部

### 建议
- 将 ChatBubble 定义为组件外部的独立组件或使用 React.memo
- 添加 WebSocket 重试机制和网络异常提示
- 考虑提取通用面试聊天 Hook

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState, useRef
- `react-router-dom`: useParams, useNavigate
- `../services/api`: interviewAPI, Interview
- `../components/Toast`: useToast
- `../components/AIInterviewerAvatar`
- `../components/Loading`: ButtonSpinner
- `../components/ErrorAlert`
