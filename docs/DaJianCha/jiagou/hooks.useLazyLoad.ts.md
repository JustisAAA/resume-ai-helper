# hooks/useLazyLoad.ts

**文件路径**: `frontend/src/hooks/useLazyLoad.ts`

## 职责概述

自定义懒加载 Hook 集合，基于 Intersection Observer API 实现。提供通用元素可见性检测和图片懒加载两个 Hook，用于性能优化——延迟渲染/加载非视口内容。

## 核心功能

### 1. `useLazyLoad(options)`
通用懒加载 Hook，检测 DOM 元素是否进入视口

**参数**: `{ root?, rootMargin?, threshold?, enabled? }`（标准 IntersectionObserver 配置 + 开关）

**返回值**: `{ ref, isVisible, elementRef }`
- `ref` — 回调 ref，绑定到目标元素
- `isVisible` — 布尔值，元素是否已进入视口
- 元素进入视口后自动停止观察以节省性能

### 2. `useLazyLoadImage(src, options)`
图片懒加载 Hook，基于 `useLazyLoad` 封装

**返回值**: `{ ref, isLoaded, isVisible, src, onLoad }`
- `src` — 仅当元素可见时才返回实际图片地址（非可见时返回 `undefined`）
- `isLoaded` — 图片加载完成状态

## 外部依赖

- `react`（useEffect, useRef, useState, useCallback）

## 调用关系

- 被需要懒加载的大组件或图片列表页面引用
- 典型的适用场景：长列表、图片网格、大型图表组件
