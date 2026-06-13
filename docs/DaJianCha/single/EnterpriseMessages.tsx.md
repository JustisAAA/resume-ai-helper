# EnterpriseMessages.tsx

**文件路径**: frontend/src/pages/EnterpriseMessages.tsx

## 职责概述
企业消息管理页面，使用路由模式切换会话列表和聊天窗口。

## 代码质量分析

### 优点
- 设计优秀：使用 EnterpriseMessageRouter 组件根据 URL 参数动态切换列表/聊天窗口
- 从 messageAPI 导入了 Conversation 和 Message 类型
- useRef 管理消息列表滚动

### 问题
- 文件很大（553 行），EnterpriseMessageList 和 EnterpriseMessageWindow 在同一个文件中
- 与企业前台 MessageWindow.tsx 存在大量重复
- 类型使用可能不一致（Converstion vs Conversation？文件名中的"v"问题）

### 建议
- 将 EnterpriseMessageList 和 EnterpriseMessageWindow 拆分为独立文件
- 与企业端前台共享消息组件
- 统一消息数据类型

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect, useRef
- `react-router-dom`: useNavigate, useParams, useSearchParams
- `../services/messageAPI`: messageAPI, Conversation, Message
- `../utils/api`: getApiBaseUrl
- `../utils/image`: getImageUrl
- `../components/Loading`: Loading, ButtonSpinner
- `../components/Toast`: useToast
- `../components/EmptyState`
- `../components/ErrorAlert`
- `@heroicons/react/24/outline`: ChatBubbleLeftEllipsisIcon 等
- `../components/ThemeToggle`
