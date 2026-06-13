# HRMessages.tsx

**文件路径**: frontend/src/pages/HRMessages.tsx

## 职责概述
HR 消息管理页面，使用路由模式管理会话列表和聊天窗口。

## 代码质量分析

### 优点
- 路由切换模式（HRConversationList / HRChatWindow）设计良好
- 使用 hrAPI 管理消息数据
- 使用 ThemeToggle 支持暗黑模式

### 问题
- convs 使用 `any[]`，类型安全差
- 与企业消息页面存在重复代码
- 缺少 WebSocket 实时消息推送

### 建议
- 为 Conversation 定义类型接口
- 与 EnterpriseMessages 共享消息组件
- 集成 WebSocket 实现实时通信

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect, useRef
- `react-router-dom`: useNavigate, useSearchParams
- `../services/hrAPI`: hrAPI
- `../utils/image`: getImageUrl
- `../components/Toast`: useToast
- `@heroicons/react/24/outline`: BuildingOffice2Icon
- `../components/ThemeToggle`
- `../components/Loading`
- `../components/EmptyState`
