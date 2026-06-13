# HRSettings.tsx

**文件路径**: frontend/src/pages/HRSettings.tsx

## 职责概述
HR 设置页面，支持修改姓名和密码。

## 代码质量分析

### 优点
- 使用 Modal 弹窗管理修改姓名和修改密码
- 内联 SVG 图标命名清晰
- 功能聚焦，设计简洁（229 行）

### 问题
- hr 用户信息通过 JSON.parse localStorage 直接获取，无错误处理
- 内联 SVG 图标重复定义
- 缺少头像上传功能

### 建议
- 封装 localStorage 读取 HR 信息的方法
- 提取内联 SVG 为公共组件
- 添加头像和联系方式编辑

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState
- `react-router-dom`: useNavigate
- `../services/hrAPI`: hrAPI
- `../components/ThemeToggle`
