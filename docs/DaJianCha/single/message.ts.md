# message.ts (routes)

**文件路径**: backend/src/routes/message.ts

## 职责概述
消息系统路由，管理会话列表、消息发送、已读状态等。

## 代码质量分析
- 支持获取会话列表、发送消息、获取历史消息
- 使用 prisma 进行消息持久化
- 代码简洁（111 行）

### 依赖关系
- 导入 middleware: auth
