# 接口设计报告

## 概述

本项目后端提供 **RESTful API** 服务，所有接口统一挂载在 `/api` 前缀下。共 **15个路由模块**、约 **50+个端点**。认证方式以 JWT Bearer Token 为主，支持用户、企业、管理员、HR 四类角色的权限隔离。部分 AI 问答接口采用 SSE（Server-Sent Events）流式响应，实现实时交互。

## 详细分析

### 1. API 端点汇总（按模块分组）

#### 1.1 认证模块 — `/api/auth`

| 方法 | 路径 | 认证 | 限流 | 说明 |
|------|------|------|------|------|
| POST | /auth/register | 无 | registerLimiter | 用户注册 |
| POST | /auth/login | 无 | loginLimiter | 用户登录 |
| GET | /auth/me | Bearer Token | - | 获取当前用户信息 |
| PUT | /auth/me | Bearer Token | - | 修改用户名 |
| PUT | /auth/me/password | Bearer Token | - | 修改密码 |
| POST | /auth/me/avatar | Bearer Token | - | 上传头像（multipart） |

#### 1.2 简历模块 — `/api/resumes`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /resumes | Bearer Token | 获取简历列表 |
| POST | /resumes/upload | Bearer Token | 上传简历（multipart） |
| GET | /resumes/:id | Bearer Token | 获取简历详情 |
| DELETE | /resumes/:id | Bearer Token | 删除简历 |
| POST | /resumes/:id/analyze | Bearer Token | AI 分析简历 |
| POST | /resumes/:id/score | Bearer Token | AI 评分简历 |
| POST | /resumes/:id/apply-template | Bearer Token | 应用模板到简历 |

#### 1.3 面试模块 — `/api/interviews`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /interviews | Bearer Token | 面试列表（支持 ?type=PRACTICE\|ENTERPRISE） |
| POST | /interviews | Bearer Token | 创建面试 |
| GET | /interviews/:id | Bearer Token | 面试详情 |
| POST | /interviews/:id/start | Bearer Token | 开始面试（获取第一题） |
| POST | /interviews/:id/answer | Bearer Token | 提交回答（支持 SSE 流式） |
| POST | /interviews/:id/end | Bearer Token | 结束/退出面试 |
| POST | /interviews/:id/report | Bearer Token | 生成报告（SSE 流式） |
| DELETE | /interviews/:id | Bearer Token | 删除面试 |

**SSE 流式接口说明**：
- `POST /interviews/:id/answer`：请求返回 `data:` 事件流，类型包括 `delta`（文本片段）、`done`（完成，含评估结果）、`error`（错误）
- `POST /interviews/:id/report`：请求返回 `data:` 事件流，类型包括 `progress`（进度报告）、`complete`（报告完整数据）、`error`（错误）

#### 1.4 求职工具模块 — `/api/tools`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /tools/match | Bearer Token | 岗位匹配分析 |
| POST | /tools/questions | Bearer Token | 面试问题生成 |
| POST | /tools/guide | Bearer Token | 面试辅导 |
| POST | /tools/optimize | Bearer Token | 简历优化建议 |
| POST | /tools/trend | Bearer Token | 岗位趋势预测 |
| POST | /tools/parse-file | Bearer Token | 上传并解析文件（60s超时） |

#### 1.5 企业管理模块 — `/api/enterprise`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /enterprise/register | 无 | 企业注册 |
| POST | /enterprise/login | 无 | 企业登录 |
| GET | /enterprise/profile | Bearer Token | 获取企业资料 |
| PUT | /enterprise/profile | Bearer Token | 更新企业资料 |
| GET | /enterprise/dashboard/stats | Bearer Token | Dashboard 统计 |

#### 1.6 职位管理模块 — `/api/jobs`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /jobs | Bearer (Enterprise) | 创建职位 |
| GET | /jobs | 无 | 职位列表（支持 ?keyword/location/type/page/limit） |
| GET | /jobs/:id | 无 | 职位详情 |
| PUT | /jobs/:id | Bearer (Enterprise) | 更新职位 |
| DELETE | /jobs/:id | Bearer (Enterprise) | 删除职位 |
| PATCH | /jobs/:id/status | Bearer (Enterprise) | 更新职位状态 |
| GET | /jobs/:id/applications | Bearer (Enterprise) | 获取职位下的申请列表 |

#### 1.7 申请管理模块 — `/api/applications`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /applications | Bearer Token | 提交申请（投递简历） |
| GET | /applications/:id | Bearer Token | 申请详情 |
| PUT | /applications/:id/status | Bearer (Enterprise) | 更新申请状态 |
| GET | /applications/:id/resume | Bearer Token | 获取申请的简历详情 |
| POST | /applications/:id/ai-analyze | Bearer Token | AI 简历分析评分 |

#### 1.8 企业面试模块 — `/api/enterprise/interviews`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /enterprise/interviews | Bearer (Enterprise/HR) | 创建企业面试邀请 |
| GET | /enterprise/interviews | Bearer (Enterprise/HR) | 企业面试列表 |
| GET | /enterprise/interviews/:id/report | Bearer (Enterprise/HR) | 获取面试报告 |

#### 1.9 管理员模块 — `/api/admin`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /admin/stats | Bearer (Admin) | 系统统计数据 |
| GET | /admin/users | Bearer (Admin) | 用户列表（支持 ?page/pageSize/search/role/status） |
| PUT | /admin/users/:id | Bearer (Admin) | 更新用户（封禁/解封） |
| DELETE | /admin/users/:id | Bearer (Admin) | 删除用户 |

#### 1.10 HR 模块 — `/api/hr`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /hr/login | 无 | HR 登录（单独 Token） |
| GET | /hr/dashboard | Bearer (HR) | HR 仪表盘 |
| GET | /hr/applications | Bearer (HR) | HR 申请列表 |
| GET | /hr/applications/:id/resume | Bearer (HR) | 简历详情 |
| POST | /hr/applications/:id/ai-analyze | Bearer (HR) | AI 分析简历 |
| PUT | /hr/applications/:id/status | Bearer (HR) | 更新申请状态 |
| GET | /hr/messages/conversations | Bearer (HR) | 会话列表 |
| GET | /hr/messages | Bearer (HR) | 消息列表 |
| POST | /hr/messages | Bearer (HR) | 发送消息 |
| PUT | /hr/messages/read | Bearer (HR) | 标记已读 |
| PUT | /hr/settings | Bearer (HR) | 更新设置 |

#### 1.11 消息模块 — `/api/messages`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /messages/conversations | Bearer Token | 会话列表 |
| GET | /messages | Bearer Token | 消息列表（?partnerId/jobId/after） |
| POST | /messages | Bearer Token | 发送消息 |
| GET | /messages/unread-count | Bearer Token | 未读消息数 |
| PUT | /messages/read | Bearer Token | 标记已读 |

#### 1.12 举报模块 — `/api/reports`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /reports | Bearer Token | 提交举报 |
| GET | /reports | Bearer (Admin) | 举报列表（?status/page） |
| PUT | /reports/:id/approve | Bearer (Admin) | 通过举报 |
| PUT | /reports/:id/reject | Bearer (Admin) | 驳回举报 |

#### 1.13 上传/用户模块

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /upload/* | - | 文件上传（具体在 upload.ts 路由） |
| GET | /users/:id | Bearer Token | 获取用户信息 |

#### 1.14 系统模块

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /health | 无 | 健康检查 |

### 2. 认证方式

**JWT Bearer Token**：
```
Authorization: Bearer <token>
```

Token 生成（`POST /auth/login`、`POST /enterprise/login`、`POST /hr/login`）：
- JWT Payload：`{ userId: string, email: string, role: string }`
- 签名算法：HS256
- 过期时间：7天（`JWT_EXPIRES_IN = '7d'`）

Token 验证流程（`authenticateToken` 中间件）：
1. 从 `Authorization` 头提取 Token
2. `jwt.verify(token, JWT_SECRET)` 验证签名和过期
3. 从数据库查询用户，检查 `status !== 'BANNED'`
4. 将 `{ userId, email, role }` 挂载到 `req.user`

### 3. 请求/响应规范

**成功响应**：
```json
// 单资源
{ "user": { "id": "...", "email": "...", ... } }

// 列表 + 分页
{ "interviews": [...], "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 } }

// 操作消息
{ "message": "注册成功", "user": {...}, "token": "..." }
```

**错误响应**：
```json
// 简单错误
{ "error": "邮箱已注册" }

// 参数校验错误
{ "error": "参数校验失败", "details": [{ "field": "email", "message": "邮箱不能为空" }] }

// 认证错误（401）
{ "error": "未登录，请先登录" }

// 权限错误（403）
{ "error": "权限不足，需要管理员权限" }

// 未找到（404）
{ "error": "接口不存在" }

// 服务器错误（500）
{ "error": "服务器内部错误" }
```

### 4. 分页接口格式

**请求参数**（query string）：
- `page`：页码（从1开始），默认 1
- `limit`：每页条数，默认 20，最大 100

**响应格式**：
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**后端实现**：`parsePagination()` 解析参数，`buildPagination()` 构建元数据，Prisma 使用 `skip` + `take` 实现分页查询。

### 5. SSE 流式接口

两个端点使用 SSE 实现 AI 内容的流式传输：

**POST /interviews/:id/answer**（流式回答评估）：
```
data: {"type":"delta","content":"你的回答在..."}
data: {"type":"delta","content":"技术深度方面表现..."}
data: {"type":"done","evaluation":{"score":85,...},"nextQuestion":"请谈谈...","interview":{...}}
```

**POST /interviews/:id/report**（流式报告生成）：
```
data: {"type":"progress","step":"分析答题记录","percent":30,"message":"正在分析答题记录..."}
data: {"type":"progress","step":"生成综合评估","percent":60,"message":"正在生成综合评估..."}
data: {"type":"progress","step":"生成改进建议","percent":90,"message":"正在生成改进建议..."}
data: {"type":"complete","report":{...},"interview":{...}}
```

前端使用 `fetch` + `ReadableStream` 逐行读取 `data:` 前缀的事件数据，通过回调函数 `onDelta`、`onDone`、`onProgress` 实时渲染。

### 6. 错误响应格式

**HTTP 状态码使用**：
| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 200 | 成功 | GET/PUT/PATCH 请求 |
| 201 | 创建成功 | POST 请求 |
| 400 | 请求参数错误 | 参数校验失败、重复注册 |
| 401 | 未认证 | Token 缺失/过期/无效 |
| 403 | 权限不足 | 角色不符合要求、账号封禁 |
| 404 | 资源不存在 | 路由未匹配、数据未找到 |
| 429 | 请求过多 | 频率限制触发 |
| 500 | 服务器错误 | 未预期异常 |

## 评价

### 优点
1. **RESTful 风格统一**：资源路径、HTTP 方法、响应格式遵循 REST 规范
2. **分页格式标准化**：所有列表接口共用 `{ items, pagination }` 格式
3. **SSE 流式支持**：核心 AI 接口使用流式响应，提升用户体验
4. **权限粒度合理**：按角色、按资源、按操作类型分别控制权限
5. **错误码规范**：HTTP 状态码使用准确，错误消息中文化友好

### 不足
1. **接口文档缺失**：未使用 OpenAPI/Swagger 自动生成文档
2. **部分接口命名不一致**：`interview.full.ts` 混用了 `ENTERPRISE` 和 `PRACTICE` 类型逻辑
3. **HR 登录非同源**：`/api/hr/login` 没有独立的 HR 注册流程（由企业创建）
4. **缺少版本前缀**：当前 `/api/*` 无版本号（如 `/api/v1/*`），未来升级不兼容

### 改进建议
1. 集成 **Swagger/OpenAPI**，自动生成 API 文档和测试页面
2. 添加 URL 版本前缀 `/api/v1/*`
3. 统一所有 SSE 接口的事件格式命名规范
4. 在响应中添加 `X-Request-Id` 用于端到端追踪
