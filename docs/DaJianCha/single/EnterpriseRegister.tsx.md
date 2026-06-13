# EnterpriseRegister.tsx

**文件路径**: frontend/src/pages/EnterpriseRegister.tsx

## 职责概述
企业注册页面，提供企业完整信息的注册表单。

## 代码质量分析

### 优点
- 注册字段全面（公司名、描述、网站、行业、规模、地址、联系方式等）
- enterpriseAPI.register 独立处理企业注册
- 表单状态管理集中

### 问题
- 没有使用 react-hook-form 或 zod 做表单校验（对比普通注册缺少校验）
- 文件较大（235 行），表单字段多但未拆分子组件
- 缺少字段级别的校验提示

### 建议
- 引入 react-hook-form + zod 进行表单校验
- 将企业基本信息字段拆分步骤
- 添加企业名称/邮箱的实时唯一性校验

## 依赖关系

### 导入此文件的文件
- (通过路由配置引用)

### 此文件导入的模块
- `react`: useState
- `react-router-dom`: useNavigate, Link
- `../services/api`: enterpriseAPI
- `../components/ThemeToggle`
- `../components/ErrorAlert`
