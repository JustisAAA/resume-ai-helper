# types/pdf-parse.d.ts

**文件路径**: `backend/src/types/pdf-parse.d.ts`

## 职责概述

为第三方 PDF 解析库 `pdf-parse` 提供 TypeScript 类型声明。由于该库原生不含类型定义，此文件确保 TypeScript 编译器能正确识别其导入和调用签名。

## 核心功能

### 类型导出
- **`PDFParseResult` 接口**: 定义解析结果的结构
  - `text: string` — 提取的纯文本内容
  - `numpages: number` — PDF 总页数
  - `numrender: number` — 实际渲染页数
  - `info: any` — 文档元信息
  - `metadata: any` — 元数据
  - `version: string` — PDF 版本号

### 模块声明
- 使用 `declare module 'pdf-parse'` 为 npm 包声明类型
- 函数签名: `pdfParse(dataBuffer: Buffer): Promise<PDFParseResult>`
- 使用 `export = pdfParse`（兼容 CommonJS 导出方式）

## 外部依赖

- `pdf-parse`（npm 包）

## 调用关系

- 被简历解析相关服务（如 `resumeService`）引用，用于从上传的 PDF 文件中提取文本
