# index.css

**文件路径**: frontend/src/index.css

## 职责概述
全局样式文件，整合 Tailwind 指令并定义三套角色主题（求职者 Indigo / 企业端 Violet / HR 端 Emerald）的 CSS 变量。

## 代码质量分析
- 优点：
  - 通过 `data-role` 属性驱动主题切换，无需 JS 运行时动态注入样式
  - CSS 变量（RGB 值）设计可配合 Tailwind 的 `rgba()` 函数实现透明度控制
  - 默认主题与求职者一致，保证未登录用户的体验
- 问题：
  - 文件较短，仅 82 行，主题变量部分高度重复（可抽象）
  - 无暗色模式（dark mode）相关变量定义
- 建议：
  - 可考虑使用 CSS 预处理或 `@apply` 指令进一步减少重复

## 依赖关系
- 导入此文件的文件：
  - frontend/src/main.tsx
- 此文件导入的模块：
  - （无）
