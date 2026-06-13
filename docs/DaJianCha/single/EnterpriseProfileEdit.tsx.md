# EnterpriseProfileEdit.tsx

**文件路径**: frontend/src/pages/EnterpriseProfileEdit.tsx

## 职责概述
企业资料编辑页面，支持企业信息修改、Logo 上传、信用积分查看。

## 代码质量分析

### 优点
- 内联 SVG 图标组件（BuildingIcon, CameraIcon）命名规范
- CreditRecord 和 CreditInfo 类型定义清晰
- 使用 enterpriseAPI 获取和更新企业信息
- 支持 Logo 上传预览功能

### 问题
- 文件较大（485 行），企业信息编辑和信用积分展示混合
- 内联 SVG 图标在其他页面也会用到，未能复用
- 表单编辑未使用 react-hook-form，校验较弱

### 建议
- 将内联 SVG 提取为公共图标组件
- 将信用积分部分拆为子组件
- 引入表单校验库提升编辑体验

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState, useEffect
- `react-router-dom`: useNavigate
- `../components/ThemeToggle`
- `../services/api`: enterpriseAPI
- `../utils/api`: getApiBaseUrl
- `../utils/image`: getImageUrl
- `../components/Loading`
- `../components/ErrorAlert`
