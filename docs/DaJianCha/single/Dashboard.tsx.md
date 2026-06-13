# Dashboard.tsx

**文件路径**: frontend/src/pages/Dashboard.tsx

## 职责概述
求职者用户首页/仪表盘，展示用户信息、功能导航入口，并根据角色进行路由分流。

## 代码质量分析

### 优点
- useEffect 中处理用户角色判断和路由重定向，逻辑清晰
- 用户头像支持本地和远程 URL 的区分处理
- 退出登录功能完善，清除 localStorage 并跳转到首页

### 问题
- `getApiBaseUrl` 从 `../utils/api` 导入，但 Dashboard 本身并不需要 BASE URL（仅在头像拼接时需要），耦合不当
- 角色判断逻辑简单，但硬编码了 'ADMIN' 和 'ENTERPRISE' 字符串，缺乏枚举
- 用户状态直接从 localStorage 解析，若数据格式异常（JSON.parse 失败）已做 try-catch 处理，但可改用全局状态管理

### 建议
- 将用户信息管理集中到 Context 或状态管理库中
- 使用枚举或常量替代角色字符串硬编码
- 可将头像 URL 拼接逻辑提取到工具函数

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`: 主题切换组件
- `../utils/api`: getApiBaseUrl
- `@heroicons/react/24/outline`: BoltIcon, BuildingOfficeIcon 等图标
