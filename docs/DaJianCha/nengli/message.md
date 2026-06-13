# 消息通信功能

## 功能概述
求职者、企业、HR 之间的即时通信，支持基于职位的消息隔离、会话列表分组、未读消息计数与标记已读。

## 前端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| MessageList.tsx | frontend/src/pages/MessageList.tsx | 求职者端会话列表页 |
| MessageWindow.tsx | frontend/src/pages/MessageWindow.tsx | 求职者端消息窗口（与 HR 聊天） |
| EnterpriseMessages.tsx | frontend/src/pages/EnterpriseMessages.tsx | 企业端消息管理 |
| HRMessages.tsx | frontend/src/pages/HRMessages.tsx | HR 端消息管理 |
| MessageBubble.tsx | frontend/src/components/MessageBubble.tsx | 消息气泡组件 |
| messageAPI.ts | frontend/src/services/messageAPI.ts | 消息 API 封装（getConversations/getMessages/sendMessage/getUnreadCount/markAsRead） |
| hrAPI.ts | frontend/src/services/hrAPI.ts | HR 端消息相关接口（getConversations/getMessages/sendMessage/markAsRead） |

## 后端文件依赖

| 文件 | 路径 | 职责 |
|------|------|------|
| message.ts | backend/src/routes/message.ts | 消息路由：发送消息、获取会话列表、获取未读数、获取消息列表、标记已读 |
| services/messageService.ts | backend/src/services/messageService.ts | 消息业务逻辑：发送（含角色通信规则校验）、获取消息（按职位隔离）、未读计数、标记已读、会话分组 |
| index.ts | backend/src/index.ts | 路由注册：`app.use('/api/messages', messageRoutes)`、`app.use('/api/hr', hrRoutes)` |
| middleware/auth.ts | backend/src/middleware/auth.ts | 认证中间件：管理员禁止使用消息功能 |

## 数据流图（文字描述）

```
MessageList.tsx → messageAPI.getConversations() → GET /api/messages/conversations
→ message.ts → messageService.ts (getConversations) → Prisma 查询消息 → 按(partnerId+jobId)分组 → 返回会话列表

MessageWindow.tsx → messageAPI.getMessages(partnerId, jobId)
→ GET /api/messages?partnerId=xxx&jobId=xxx → message.ts → messageService.ts → 返回按职位隔离的消息

消息发送 → messageAPI.sendMessage(receiverId, content, jobId)
→ POST /api/messages → message.ts → messageService.ts (sendMessage)
→ 角色通信规则校验（USER↔HR / HR↔ENTERPRISE） → Prisma 创建消息 → 返回

未读计数 → messageAPI.getUnreadCount() → GET /api/messages/unread-count
→ message.ts → messageService.ts → Prisma 统计未读消息数

标记已读 → messageAPI.markAsRead(partnerId, jobId)
→ PUT /api/messages/read?partnerId=xxx&jobId=xxx → messageService.ts → 批量更新 isRead
```

## 关键接口

| 方法 | 端点 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/messages | 发送消息 | 是（非 ADMIN） |
| GET | /api/messages/conversations | 获取会话列表 | 是（非 ADMIN） |
| GET | /api/messages | 获取消息列表 | 是（非 ADMIN） |
| GET | /api/messages/unread-count | 获取未读消息数 | 是（非 ADMIN） |
| PUT | /api/messages/read | 标记消息已读 | 是（非 ADMIN） |
