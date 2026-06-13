# messageAPI.ts

**文件路径**: frontend/src/services/messageAPI.ts

## 职责概述
消息系统 API 服务层，管理会话列表、消息发送/获取等接口。

## 代码质量分析

### 优点
- Message 和 Conversation 类型定义完整
- 自动授权拦截器
- 函数式封装清晰

### 问题
- 未定义所有 API 返回类型的泛型
- 会话列表和消息操作间缺少 WebSocket 集成

## 依赖关系
- 被 MessageList、MessageWindow、EnterpriseMessages 等导入
