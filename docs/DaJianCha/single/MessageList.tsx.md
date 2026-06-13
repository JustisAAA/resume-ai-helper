# MessageList.tsx

**文件路径**: frontend/src/pages/MessageList.tsx

## 职责概述
消息列表页面，展示用户的所有会话列表。

## 代码质量分析

### 优点
- 使用独立的 messageAPI 服务，关注点分离
- 使用 getImageUrl 处理用户和企业头像
- 使用 EmptyState、ErrorAlert、Loading 组件处理各种状态

### 问题
- conversations 状态使用 `any[]` 类型，完全丧失类型安全
- 缺少未读消息数量标记
- 没有下拉刷新或 WebSocket 实时更新机制

### 建议
- 为 conversation 定义专用类型接口
- 添加未读消息红点标记
- 考虑集成 WebSocket 实现消息实时到达

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../services/messageAPI`: messageAPI
- `../utils/image`: getImageUrl
- `@heroicons/react/24/outline`: ChatBubbleLeftEllipsisIcon 等
- `../components/Loading`
- `../components/ErrorAlert`
- `../components/EmptyState`
