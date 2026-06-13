# 数据库设计报告

## 概述

本项目采用 **SQLite** 作为数据库引擎，通过 **Prisma ORM** 进行数据建模和操作。共定义 **11张数据表**、**10个枚举类型**，覆盖用户管理、简历管理、面试流程、企业招聘、消息沟通、举报投诉、信用体系等核心业务域。数据库文件位于 `backend/prisma/dev.db`。

## 详细分析

### 1. 实体关系图（ER 关系）

```
User (1) ──< Resume (N)
User (1) ──< Interview (N)
User (1) ──< InterviewReport (N)   [UserInterviewReports]
User (1) ──< Application (N)
User (1) ──1 Enterprise            [企业主账户]
User (1) ──< Enterprise (N)        [EnterpriseOwner]
User (1) ──1 HRAccount
User (1) ──< Message (N)           [SentMessages]
User (1) ──< Message (N)           [ReceivedMessages]
User (1) ──< Complaint (N)         [ComplaintsMade / ComplaintsReceived / ComplaintsHandled]
User (1) ──< CreditRecord (N)

Enterprise (1) ──< Job (N)
Enterprise (1) ──< HRAccount (N)
Job (1) ──< Application (N)
Job (1) ──< Message (N)
Job (1) ──1 HRAccount
Resume (1) ──< Interview (N)
Resume (1) ──< InterviewReport (N)
Resume (1) ──< Application (N)
Application (1) ──< Interview (N)
Interview (1) ──1 InterviewReport   [可选关联]
```

### 2. 表结构定义

#### 2.1 User（用户表）— `users`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| email | String | UNIQUE | 邮箱（登录凭证） |
| passwordHash | String | NOT NULL | bcrypt 哈希密码 |
| name | String? | - | 显示名称 |
| avatar | String? | - | 头像 URL |
| role | Role (Enum) | DEFAULT USER | 角色：USER/HR/ENTERPRISE/ADMIN |
| status | Status (Enum) | DEFAULT ACTIVE | 状态：ACTIVE/BANNED |
| creditScore | Int | DEFAULT 100 | 信用分 |
| isBanned | Boolean | DEFAULT false | 是否封禁 |

关联：resumes[], interviews[], reports[], enterprise?, ownedEnterprises[], hrAccount?, applications[], sentMessages[], receivedMessages[], complaintsMade[], complaintsReceived[], complaintsHandled[], creditRecords[]

#### 2.2 Resume（简历表）— `resumes`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| userId | String | FK → User(id) CASCADE | 所属用户 |
| title | String | NOT NULL | 简历标题 |
| content | JSON? | - | 结构化内容 |
| rawText | String? | - | 原始文本 |
| fileName / fileUrl / fileType | String? | - | 文件信息 |
| analysis | JSON? | - | AI 分析结果 |
| score | Int? | - | 评分 |
| status | ResumeStatus | DEFAULT DRAFT | DRAFT/ANALYZED/ARCHIVED |
| isDefault | Boolean | DEFAULT false | 是否为默认简历 |

#### 2.3 Interview（面试表）— `interviews`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| userId | String | FK → User(id) CASCADE | 所属用户 |
| resumeId | String? | FK → Resume(id) SET NULL | 关联简历 |
| applicationId | String? | FK → Application(id) SET NULL | 关联申请 |
| title | String | NOT NULL | 面试标题 |
| position | String? | - | 目标岗位 |
| difficulty | Difficulty | DEFAULT MEDIUM | EASY/MEDIUM/HARD |
| language | Language | DEFAULT ZH_CN | 语言 |
| aiRole | AIRole | DEFAULT PROFESSIONAL | AI角色 |
| questions / answers / messages / feedback | JSON? | - | 面试数据 |
| score | Int? | - | 总分 |
| status | InterviewStatus | DEFAULT CREATED | CREATED/IN_PROGRESS/COMPLETED/ABANDONED |
| type | InterviewType | DEFAULT PRACTICE | PRACTICE/ENTERPRISE |
| reportId | String? | UNIQUE | 关联报告ID |

#### 2.4 InterviewReport（面试报告表）— `reports`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| userId | String | FK → User(id) CASCADE | 所属用户 |
| resumeId | String? | FK → Resume(id) SET NULL | 关联简历 |
| interviewId | String? | UNIQUE FK → Interview(id) CASCADE | 关联面试 |
| type | ReportType | NOT NULL | RESUME_ANALYSIS/INTERVIEW_REPORT/COMPREHENSIVE |
| title / summary | String | NOT NULL | 标题/摘要 |
| content | JSON | NOT NULL | 报告内容 |
| score | Int? | - | 报告评分 |
| recommendations | JSON? | - | 推荐建议 |

#### 2.5 Enterprise（企业表）— `enterprises`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| userId | String | UNIQUE FK → User(id) CASCADE | 关联用户 |
| ownerId | String? | FK → User(id) SET NULL | 所有者（EnterpriseOwner） |
| name | String | NOT NULL | 企业名称 |
| description / logo / website / industry / size / location / contactEmail / contactPhone | String? | - | 企业信息 |

#### 2.6 Job（职位表）— `jobs`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| enterpriseId | String | FK → Enterprise(id) CASCADE | 所属企业 |
| title / description / requirements / salaryRange / location / type | String? | - | 职位信息 |
| status | JobStatus | DEFAULT ACTIVE | ACTIVE/CLOSED/DRAFT/DELETED |
| keywords / images | JSON | NOT NULL | 关键词/图片 |
| interviewConfig | JSON? | - | 面试配置 |

#### 2.7 HRAccount（HR子账号表）— `hr_accounts`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| userId | String | UNIQUE FK → User(id) CASCADE | 关联用户 |
| enterpriseId | String | FK → Enterprise(id) CASCADE | 关联企业 |
| jobId | String | UNIQUE FK → Job(id) CASCADE | 关联职位 |
| name | String | NOT NULL | HR名称 |
| isActive | Boolean | DEFAULT true | 是否启用 |

**特殊设计**：`userId` 和 `jobId` 都是 UNIQUE，意味着一个 HR 只能管理一个职位，且一个职位只有一个 HR — 这是"一岗一人"的约束设计。

#### 2.8 Application（申请表）— `applications`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| jobId | String | FK → Job(id) CASCADE | 关联职位 |
| userId | String | FK → User(id) CASCADE | 求职者 |
| resumeId | String? | FK → Resume(id) SET NULL | 简历 |
| status | ApplicationStatus | DEFAULT PENDING | PENDING/REVIEWING/ACCEPTED/REJECTED |
| coverLetter | String? | - | 求职信 |
| aiAnalysis | JSON? | - | AI 分析结果 |

**复合唯一约束**：`@@unique([jobId, userId])` — 同一用户对同一职位只能申请一次

#### 2.9 Message（消息表）— `messages`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| senderId | String | FK → User(id) CASCADE | 发送者 |
| receiverId | String | FK → User(id) CASCADE | 接收者 |
| jobId | String? | FK → Job(id) SET NULL | 关联职位 |
| content | String | NOT NULL | 消息内容 |
| isRead | Boolean | DEFAULT false | 是否已读 |

**索引**：`@@index([senderId, receiverId])`, `@@index([jobId])`, `@@index([createdAt])`

#### 2.10 Complaint（举报表）— `complaints`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| reporterId | String | FK → User(id) CASCADE | 举报者 |
| targetId | String | FK → User(id) CASCADE | 被举报者 |
| reason / description / status / handlerId | String? | - | 原因/描述/状态/处理人 |
| handledAt | DateTime? | - | 处理时间 |

**索引**：`@@index([status])`, `@@index([createdAt])`

#### 2.11 CreditRecord（信用分记录表）— `credit_records`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (UUID) | PK | 主键 |
| userId | String | FK → User(id) CASCADE | 用户 |
| score / change | Int | NOT NULL | 当前分/变动值 |
| reason | String | NOT NULL | 变动原因 |
| relatedComplaintId | String? | - | 关联举报ID |

**索引**：`@@index([userId, createdAt])`

### 3. 枚举类型

| 枚举名 | 取值 | 用途 |
|--------|------|------|
| Role | USER, HR, ENTERPRISE, ADMIN | 用户角色 |
| Status | ACTIVE, BANNED | 账号状态 |
| ResumeStatus | DRAFT, ANALYZED, ARCHIVED | 简历状态 |
| Difficulty | EASY, MEDIUM, HARD | 面试难度 |
| Language | ZH_CN, EN_US | 面试语言 |
| AIRole | PROFESSIONAL, FRIENDLY, STRICT | AI 面试官角色 |
| InterviewStatus | CREATED, IN_PROGRESS, COMPLETED, ABANDONED | 面试状态 |
| InterviewType | PRACTICE, ENTERPRISE | 面试类型 |
| ReportType | RESUME_ANALYSIS, INTERVIEW_REPORT, COMPREHENSIVE | 报告类型 |
| ApplicationStatus | PENDING, REVIEWING, ACCEPTED, REJECTED | 申请状态 |
| JobStatus | ACTIVE, CLOSED, DRAFT, DELETED | 职位状态 |

### 4. 设计决策

#### SQLite 选型
- **优势**：零配置、单文件部署、无需独立数据库服务器、开发/演示成本极低
- **劣势**：不支持并发写入、不支持存储过程、数据类型有限（无原生 JSON 类型，Prisma 转为 TEXT 存储）
- **适用场景**：单体应用、中小用户量、开发/演示环境；生产环境建议迁移至 PostgreSQL

#### 级联策略
| 关系 | 级联类型 | 原因 |
|------|---------|------|
| User → Resume | CASCADE | 用户删除则简历无意义 |
| User → Interview | CASCADE | 用户删除则面试无意义 |
| Resume → Interview | SET NULL | 简历删除后面试记录仍需保留 |
| Application → Interview | SET NULL | 申请删除后面试记录仍需保留 |
| Enterprise → Job | CASCADE | 企业删除则职位无意义 |
| User → Enterprise | CASCADE | 用户删除则企业无意义 |

#### Json 字段的使用
大量使用 Prisma 的 `Json` 类型存储非结构化数据：
- `Resume.content/analysis`：简历结构和 AI 分析
- `Interview.questions/answers/messages/feedback`：面试过程全量数据
- `Job.keywords/images`：职位附加信息
- `Application.aiAnalysis`：AI 评分结果
- `Report.content/recommendations`：报告内容

#### 命名规范
- 表名：snake_case 复数（通过 `@@map()` 映射）
- 字段名：Prisma 层 camelCase，映射到 DB 时 snake_case
- 枚举值：UPPER_CASE
- 主键：UUID（非自增 ID）

## 评价

### 优点
1. **ER 设计完整**：11 张表覆盖了求职、招聘、面试、消息、信用、举报全链条
2. **级联策略合理**：核心数据（用户/企业）CASCADE 删除，关联数据 SET NULL 保留历史
3. **JSON 字段灵活**：面试过程、AI 分析等非结构化数据用 JSON 存储，避免过度设计关系表
4. **复合约束防重复**：`@@unique([jobId, userId])` 防止同一用户重复申请
5. **索引设计完备**：Message 和 CreditRecord 等高频查询表建立了复合索引

### 不足
1. **SQLite 不适合生产**：无并发写入能力，Json 字段查询性能差，无法使用 Prisma 的部分高级特性
2. **大量 JSON 字段不可查询**：面试 answers/feedback 等数据存为 JSON，无法在 DB 层面做分析统计
3. **HRAccount 一岗一人限制**：`userId` 和 `jobId` 的 UNIQUE 约束过于刚性，不支持 HR 管理多岗
4. **缺少审计字段**：部分表缺少 `createdBy`/`updatedBy` 等审计字段

### 改进建议
1. 生产环境迁移至 **PostgreSQL**，利用其原生 JSONB 类型支持部分结构化查询
2. 对面试 answers 等高频分析数据建立独立的关系表替代 JSON 字段
3. 将 HRAccount 的 `jobId` 改为非 UNIQUE，支持 HR 多岗管理
4. 添加 `updatedBy` 审计字段和数据库触发器
5. 考虑添加 **soft delete**（软删除）替代物理删除
