# Profile.tsx

**文件路径**: frontend/src/pages/Profile.tsx

## 职责概述
用户个人资料页面，展示和编辑用户信息，查看信用积分记录。

## 代码质量分析

### 优点
- CreditInfo / CreditRecord 类型定义明确
- 使用 authAPI 获取用户信息和更新资料
- 支持头像上传和用户信息编辑
- 信用积分展示逻辑完整（含 isBanned 封禁状态判断）

### 问题
- 文件较大（414 行），个人资料编辑和信用记录展示混合
- PencilIcon 等内联 SVG 图标可复用
- 头像上传缺乏裁剪功能

### 建议
- 将信用记录列表拆分为子组件
- 提取内联 SVG 图标为公共组件
- 添加头像裁剪功能

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useEffect, useState
- `react-router-dom`: useNavigate
- `../context/ThemeContext`: useTheme
- `../services/api`: authAPI, UserProfile
- `../utils/api`: getApiBaseUrl
- `../components/Toast`: useToast
- `../components/Loading`
- `../components/ErrorAlert`
- `../components/ThemeToggle`
