# mygo 项目代码审查报告

> 审查日期：2026-06-14
> 审查范围：backend3/src/ 和 frontend/src/
> 严重程度说明：高 = 可能导致运行时错误或数据不一致；中 = 功能可能受影响但不至于崩溃；低 = 编码规范/可维护性问题

---

## 一、后端严重问题 (HIGH)

### 1.1 路由重复注册 — interview 路由冲突
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\routes\interview\index.ts (第15-19行)
- **描述**: interview/index.ts 同时挂载了 listRouter（GET /）、createRouter（POST /）和 fullRouter（同样包含 GET / 和 POST /）。这意味着 /api/interviews 的 GET 和 POST 路由被注册了两次，可能产生不可预知的行为（取决于 Express 路由处理顺序，可能后注册的覆盖先注册的）。
- **建议**: interview/index.ts 应该只加载子路由，不要同时加载 fullRouter，或者将 fullRouter 中尚未拆分的路由搬家到子路由文件中，删除 fullRouter 的导入。

### 1.2 (req as any).user 类型不安全
- **文件**: 
  - D:\university\competition\soft_design\mygo\backend3\src\routes\application.ts (第49, 130, 184, 225, 274, 276行)
  - D:\university\competition\soft_design\mygo\backend3\src\routes\enterpriseInterview.ts (第19, 78, 79, 122, 123行)
- **描述**: 这些文件使用 (req as any).user.userId 而不是 req.user!.userId。虽然 express.d.ts 已声明 Request.user 可选属性，但这些路由 handler 的参数类型声明为 Request（普通类型）而不是 AuthRequest（扩展类型），导致无法直接访问 req.user，只能通过 as any 绕过类型检查。这会丢失 TypeScript 类型保护和 IDE 智能提示。
- **建议**: 将这些路由的 handler 参数类型从 Request 改为 AuthRequest，并使用 req.user!.userId 替代 (req as any).user.userId。

### 1.3 Serverless 模式下上传目录可能失败
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\index.ts (第69-88行)
- **描述**: 第70-72行只在非 Serverless 模式下创建 uploadPath 根目录。但第75-81行无条件地使用 fs.mkdirSync 创建 jobs, avatars, logos 子目录，且注册 express.static 静态服务。在 Serverless 云函数环境下（只读文件系统），这些操作会导致运行时错误。
- **建议**: 应在 Serverless 模式下跳过文件系统操作和静态文件服务，或者使用内存/云存储替代。

### 1.4 前端 enterpriseAPI.aiAnalyze 路由不匹配
- **文件**: 
  - D:\university\competition\soft_design\mygo\frontend\src\services\api.ts (第926-928行)
  - D:\university\competition\soft_design\mygo\backend3\src\routes\hr.ts (第66-78行)
- **描述**: 前端调用 getApiUrl('/applications//ai-analyze')，但后端路由是在 POST /api/hr/applications/:id/ai-analyze（hr.ts），而不是在 /api/applications/ 下。这会导致 404 错误。
- **建议**: 前端应使用 hrAPI.aiAnalyze() 替代 enterpriseAPI.aiAnalyze()，或者后端在 application 路由下添加对应的路由。

### 1.5 前端 ScoringConfig 类型与后端不匹配
- **文件**: 
  - D:\university\competition\soft_design\mygo\frontend\src\services\api.ts (第185-192行)
  - D:\university\competition\soft_design\mygo\backend3\src\services\enterpriseAIService.ts (第10-16行)
- **描述**: 前端 ScoringConfig 定义包含 criteria: Array<{name, weight, description}>，但后端 ScoringConfig 包含 scoringPoints: string[], criteria: string, keyPoints: string。形状完全不同，前端传的数据到后端会完全缺失 scoringPoints 等必要字段。
- **建议**: 统一前后端的 ScoringConfig 类型定义。

### 1.6 前端 enterpriseAPI.getDashboardStats 返回类型不匹配
- **文件**: 
  - D:\university\competition\soft_design\mygo\frontend\src\services\api.ts (第863-873行)
  - D:\university\competition\soft_design\mygo\backend3\src\services\enterpriseService.ts (第294-303行)
- **描述**: 前端期望 funnel: { applied, screened, interviewed, hired }，但后端返回 funnel: { jobs, applications, interviews, hired }。applied/screened 与 jobs/applications 字段名不同，导致前端不可用。
- **建议**: 对齐前后端的字段名。

---

## 二、后端中等问题 (MEDIUM)

### 2.1 uploadMiddleware.ts 使用相对路径
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\middleware\uploadMiddleware.ts (第6, 39, 62行)
- **描述**: 上传目录使用 'uploads/jobs', 'uploads/resumes', 'uploads/logos' 相对路径，而不是基于 process.cwd() 的绝对路径。当进程启动目录发生变化时，文件可能保存到错误位置。
- **建议**: 使用 path.resolve(process.cwd(), 'uploads/jobs') 等绝对路径。

### 2.2 BANNED 状态字段不一致
- **文件**: 
  - D:\university\competition\soft_design\mygo\backend3\src\middleware\auth.ts (第40行)
  - D:\university\competition\soft_design\mygo\backend3\src\services\creditService.ts (第40行)
- **描述**: auth.ts 中检查 user.status === 'BANNED'，但 creditService.ts 中使用 user.isBanned。如果 Prisma schema 中 User 模型使用 isBanned 字段，则 status 字段可能不存在 BANNED 枚举值。两者引用不一致可能导致状态检查失败。
- **建议**: 统一使用一种封禁状态表示方式。

### 2.3 SSE 流式调用未设置超时
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\routes\interview.full.ts (第491-503行)
- **描述**: 使用 fetch() 调用 AI API 时没有设置超时参数，如果 AI 服务响应缓慢或无响应，SSE 连接可能一直挂起，导致 HTTP 连接泄漏。
- **建议**: 使用 AbortController 配合 setTimeout 添加超时控制。

### 2.4 企业面试配置同步问题
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\routes\enterpriseInterview.ts (第17行)
- **描述**: 后端创建面试时只接收 applicationId，不接受 interviewConfig（如难度、题目数等）。但前端 api.ts 中 createInterview 传入了 interviewConfig，这些配置会被忽略。
- **建议**: 后端扩展 createInterview 接口以接收并存储面试配置。

### 2.5 HR创建面试调用企业路由
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\services\hrAPI.ts (第60-61行)
- **描述**: hrAPI.createInterview 调用 POST /enterprise/interviews，但 HR 用户角色是 HR 而非 ENTERPRISE。后端 requireEnterprise 中间件会拒绝 HR 用户的请求（只有 HR 角色通过 requireEnterpriseOrHR 才允许）。第60行 post 请求使用了 hrToken 但路由只允许 ENTERPRISE 角色。
- **建议**: 后端 enterpriseInterview.ts POST 路由应使用 requireEnterpriseOrHR 替代 requireEnterprise。

---

## 三、后端低等问题 (LOW)

### 3.1 mock 中字段拼写错误
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\routes\interview\mock.ts (第118行)
- **描述**: strengts 应为 strengths。虽然仅用于模拟数据，但可能会误导前端开发者。
- **建议**: 修正拼写为 strengths。

### 3.2 求职者端不能查看企业面试报告但路由已注册
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\routes\interview.full.ts (第693-696行)
- **描述**: 企业面试报告检查逻辑正确，但由于路由重复注册问题（问题1.1），求职者仍然可以绕过限制，通过另一个路由实例访问。

### 3.3 await 循环效率低 — 面试报告生成
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\routes\interview.full.ts (第346-348行)
- **描述**: 模拟模式下 SSE 逐字发送使用 for 循环 + await new Promise(r => setTimeout(r, ...))，每发一个字符就 await 一次，总耗时随内容长度线性增长。虽然这是模拟模式，但大内容时延迟明显。

---

## 四、前端严重问题 (HIGH)

### 4.1 企业面试路由不完整 — 企业端面试链接错误
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\routes\enterpriseInterview.ts (第44行)
- **描述**: 面试邀请链接生成 :///interview/，但这个路径在 App.tsx 中没有对应的前端路由。前端路由是 /interviews/:id/enterprise-room，不是 /interview/:id。
- **建议**: 更正链接为 :///interviews//enterprise-room。

### 4.2 EnterpriseInterviewRoom 超时自动提交的闭包问题
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\pages\EnterpriseInterviewRoom.tsx (第166-170行)
- **描述**: useEffect 监听 questionTimeLeft，当倒计时归零时调用 handleSubmit()。但由于 useEffect 的依赖列表中缺少 handleSubmit，handleSubmit 内部使用的 answer state 可能是过时的（stale closure），导致提交空内容或不完整的回答。
- **建议**: useEffect 的依赖列表应包含 handleSubmit，或者使用 useRef 保存最新的 answer 值。

### 4.3 前端多个 enterpriseAPI 方法直接从 localStorage 读取 token
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\services\api.ts (第868, 889, 903, 914, 925, 936, 947, 961行)
- **描述**: enterpriseAPI.getDashboardStats, getApplications, updateStatus, getResume, aiAnalyze, createInterview, getInterviews, getReport 等方法内部直接 localStorage.getItem('token') 而不是接收 token 参数。这与 authAPI, resumeAPI, interviewAPI 等显式要求 token 参数的做法不一致，不灵活且不利于单元测试。
- **建议**: 统一为从参数接收 token 的风格。

### 4.4 InterviewRoom 中错误使用 react-hook-form
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\pages\InterviewRoom.tsx (第21-29行)
- **描述**: 同时维护 answer state 和 react-hook-form 的 watchedAnswer/setValue，并在 useEffect 中同步两者。这种双重状态管理容易导致同步问题。特别是 onSubmitAnswer 中 data.answer.trim() 使用的是表单数据，而语音识别更新的是 answer state 再触发 setValue，中间可能存在竞态条件。
- **建议**: 移除独立的 answer state，完全通过 react-hook-form 管理输入值。

### 4.5 Login 与 Register 页面路由守卫
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\App.tsx (第192-193行)
- **描述**: /register 和 /login 路由使用 GuestRoute，逻辑正确。但 GuestRoute 没有处理 HR 角色，如果 HR 用户已登录访问 /login，会被重定向到 /dashboard，但并不存在 HR 专用 Dashboard 跳转。

---

## 五、前端中等问题 (MEDIUM)

### 5.1 getImageUrl 未处理 API_BASE 为空的场景
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\utils\image.ts (第6-14行)
- **描述**: 当 API_BASE 为空且 url 以 / 开头时返回 url 本身。但如果 API_BASE 是 '' 且 url 是相对路径（不以 / 开头），代码会尝试拼接 /，结果为 /，这可能不是正确的静态资源路径。不过同源模式下资源路径通常以 / 开头，影响有限。
- **建议**: 增加对空 API_BASE 和有/无前导 / 的统一处理逻辑。

### 5.2 interview.full.ts 中使用 fetch 但其他地方用 axios
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\routes\interview.full.ts (第491行)
- **描述**: 后端代码在 interview.full.ts 的 SSE 实现中使用了 fetch API（Node.js 内置），而其他所有 API 调用使用 axios。fetch 在较旧 Node.js 版本不可用，且错误处理模式与 axios 不同。
- **建议**: 统一使用 axios 并配置 responseType: 'stream' 来实现流式读取。

### 5.3 ai-limiter 对 start/answer/report 都生效
- **文件**: D:\university\competition\soft_design\mygo\backend3\src\routes\interview.full.ts (第118, 289, 663行)
- **描述**: aiLimiter（每分钟20次）应用在 start, answer, report 三个接口上。如果用户快速进行多次面试，可能在 report 阶段被限流。但总体影响中等。

### 5.4 前端没有统一的错误处理拦截器
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\services\api.ts (全局)
- **描述**: api.ts 中没有配置 axios 响应拦截器来处理全局错误（如 401 自动登出、网络错误提示等），每个调用方需要单独处理错误。hrAPI.ts 和 messageAPI.ts 使用了 axios instance 但没有错误拦截器。
- **建议**: 添加统一的 axios 响应拦截器处理 401/403/500 等常见错误。

---

## 六、前端低等问题 (LOW)

### 6.1 InterviewRoom 中 ThemeToggle 缩进问题
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\pages\InterviewRoom.tsx (第491行)
- **描述**: ThemeToggle 组件前后有空行和缩进问题，不影响功能但影响代码整洁度。

### 6.2 InterviewRoom 中 import 优化
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\pages\InterviewRoom.tsx (第8行)
- **描述**: 导入了 getImageUrl 但只在第676行使用一次。

### 6.3 企业面试房间中未使用 ThemeToggle
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\pages\EnterpriseInterviewRoom.tsx (全局)
- **描述**: 企业面试房间（EnterpriseInterviewRoom）没有像 InterviewRoom 那样集成 ThemeToggle 组件，用户无法在该页面切换主题。

### 6.4 reportAPI.ts 中 ScoringConfig 再次导出不一致
- **文件**: D:\university\competition\soft_design\mygo\frontend\src\services\reportAPI.ts (全局)
- **描述**: 根据 hrAPI 的 import 推断类型不一致问题同样存在。

---

## 七、总结统计

| 严重程度 | 后端 | 前端 | 合计 |
|---------|------|------|------|
| 高      | 6    | 5    | 11   |
| 中      | 5    | 4    | 9    |
| 低      | 3    | 4    | 7    |
| **合计** | **14** | **13** | **27** |

### 最紧急修复优先级：
1. **路由重复注册** — 导致路由行为不可预知（1.1）
2. **前端 enterpriseAPI.aiAnalyze 路由不匹配** — 导致 404（1.4）
3. **企业面试链接错误** — 面试链接无法访问（4.1）
4. **前端 ScoringConfig 类型不匹配** — AI分析功能不可用（1.5）
5. **Dashboard stats 字段不匹配** — 企业首页无法展示数据（1.6）
6. **(req as any).user 类型不安全** — 可能运行时崩溃（1.2）

---

*本报告由代码审查工具生成，建议对每个标记的问题进行人工二次确认。*
