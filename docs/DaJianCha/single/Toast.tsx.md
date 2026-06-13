# Toast.tsx

**文件路径**: frontend/src/components/Toast.tsx

## 职责概述
Toast 消息提示系统，提供全局的消息提示功能，支持 success/error/info 三种类型。

## 代码质量分析

### 优点
- 使用 Context 模式全局共享 Toast 功能
- 自动 3 秒消失
- 支持多种类型颜色区分

### 问题
- 不支持手动关闭按钮
- 不支持自定义消失时间

## 依赖关系
- 被多个页面使用 useToast 钩子
