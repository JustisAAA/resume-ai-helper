# AdminUsers.tsx

**文件路径**: frontend/src/pages/AdminUsers.tsx

## 职责概述
管理员用户管理页面，支持查看用户列表、搜索、封禁/解封操作。

## 代码质量分析

### 优点
- 使用 AdminLayout 统一布局
- 从 adminAPI 导入 AdminUser 和 AdminUserListResponse 类型
- statusColor 映射表管理状态显示颜色
- 支持搜索和用户操作

### 问题
- SearchIcon 和 TrashIcon 内联 SVG 在其他 Admin 页面也有定义
- 缺少用户详情弹窗
- 批量操作支持不足

### 建议
- 共享 Admin 页面的图标组件
- 添加用户详情查看弹窗
- 支持批量封禁/解封操作

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `../components/AdminLayout`
- `../services/api`: adminAPI, AdminUser, AdminUserListResponse
- `../components/ErrorAlert`
- `../components/Loading`
