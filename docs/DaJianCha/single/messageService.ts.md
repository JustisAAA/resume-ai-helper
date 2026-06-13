# messageService.ts

**文件路径**: `backend/src/services/messageService.ts`

## 功能概述

站内信（消息）系统的业务逻辑层，支持角色间定向通信、消息列表获取、未读数统计、已读标记、会话列表聚合。

## 导出函数列表

| 函数 | 签名 | 简述 |
|------|------|------|
| `sendMessage` | `(senderId, receiverId, content, jobId?, senderRole?): Promise<Message>` | 发送消息，包含内容校验（非空、1000 字符上限、自发送禁止）、角色通信规则校验、职位隔离 |
| `getMessages` | `(userId, partnerId, jobId?, after?, pagination?): Promise<{ messages, pagination }>` | 获取与某用户的聊天记录，支持按职位过滤、按最后消息 ID 增量拉取 |
| `getUnreadCount` | `(userId: string): Promise<number>` | 查询当前用户未读消息总数 |
| `markAsRead` | `(userId, partnerId, jobId?): Promise<void>` | 批量标记与某用户的未读消息为已读，支持按职位隔离 |
| `getConversations` | `(userId, role?, pagination?): Promise<{ conversations, pagination }>` | 获取会话列表，按 partnerId + jobId 分组去重，自动补充企业 Logo |

## 关键逻辑

- **角色通信规则**：`ALLOWED_COMMUNICATION` 定义了角色间的通信拓扑——USER 只能与 HR 通信，HR 可与 USER 和 ENTERPRISE 通信，ENTERPRISE 只能与 HR 通信，ADMIN 不可参与站内信
- **职位隔离**：所有操作都支持 `jobId` 参数，确保不同职位的消息互不干扰；`getConversations` 以 `partnerId_jobId` 为分组键
- **增量拉取**：`getMessages` 支持 `after` 参数（某消息 ID 之后），用于前端滚动刷新场景
- **会话聚合**：`getConversations` 获取所有相关消息后在内存中分组排序，仅保留每个会话的最新消息，并自动为 ENTERPRISE 和 HR 角色补充企业 Logo

## 依赖关系

- `prisma`（从 `../index` 导入）：数据查询与写入
- `../utils/pagination`：`parsePagination`、`buildPagination`
