# MessageBubble.tsx

**文件路径**: frontend/src/components/MessageBubble.tsx

## 职责概述
消息气泡组件，展示单条聊天消息，区分自己和对方消息。

## 代码质量分析

### 优点
- 从 messageAPI 导入 Message 类型，类型安全
- 支持对方头像显示和加载失败回退
- 使用 getImageUrl 处理图片 URL

### 问题
- 缺少消息已读/未读状态
- 不支持消息内的链接或富文本展示

## 依赖关系
- 被 MessageWindow 和 EnterpriseMessages 等导入
