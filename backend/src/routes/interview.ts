import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';
import axios from 'axios';

/** 面试回答记录 */
interface Answer {
  question: string;
  answer: string;
  score: number;
  comment: string;
  highlights: string[];
  improvements: string[];
  timestamp: string;
}

const router = Router();

// ========== 模拟模式：返回模拟数据（演示保底，不依赖外部API） ==========
const isMockMode = () => process.env.MOCK_MODE === 'true';

// 模拟数据：第一个面试问题（根据岗位返回）
function getMockFirstQuestion(position: string): string {
  const questions: Record<string, string> = {
    '前端开发工程师': '请介绍一下你最近做的一个前端项目，重点说说你遇到的技术难点和解决方案。',
    '后端开发工程师': '设计一个高并发的秒杀系统，你会考虑哪些技术方案？',
    '全栈开发工程师': '如果让你从零开始搭建一个电商网站，你会如何选择技术栈？为什么？',
    '算法工程师': '请解释一下梯度消失问题，以及你在实践中是如何解决的？',
    '数据分析师': '给你一份用户行为数据，你会如何从数据中发现业务问题？',
    '通用岗位': '请描述一次你在团队中解决冲突的经历，你是如何处理的？'
  };
  return questions[position] || questions['通用岗位'];
}

// 模拟数据：评价回答（根据回答长度动态生成评分）
function getMockEvaluation(answer: string, questionCount: number, position: string): any {
  const answerLen = answer.trim().length;
  let score: number, comment: string, highlights: string[], improvements: string[];
  
  if (answerLen < 3) {
    score = 2;
    comment = '回答过于简略，没有展现任何专业能力。建议详细阐述你的思路和具体案例。';
    highlights = [];
    improvements = ['补充具体案例', '增加数据支撑', '明确回答问题'];
  } else if (answerLen < 20) {
    score = 5;
    comment = '回答思路基本清晰，但缺乏具体案例和数据支撑，建议补充实际项目经验。';
    highlights = ['回答基本切题'];
    improvements = ['补充具体案例', '增加数据支撑'];
  } else if (answerLen < 100) {
    score = 7;
    comment = '回答结构清晰，有具体案例支撑，展现了较好的专业能力和思维深度。建议在技术细节上再深入一些。';
    highlights = ['回答结构清晰', '有具体案例'];
    improvements = ['技术细节可以更深入', '可以提及遇到的挑战'];
  } else {
    score = 9;
    comment = '回答非常出色，既有理论深度又有实践案例，展现了优秀的专业素养和思维能力。继续保持这种回答质量！';
    highlights = ['回答结构清晰', '有具体案例和数据', '展现深度思考', '表达流畅'];
    improvements = ['可以提及团队协作经验'];
  }
  
  // 根据题号生成下一个问题（第5题结束）
  const nextQuestions = [
    '如果能重新设计这个项目，你会在哪些方面做改进？',
    '在团队协作中，你是如何保证代码质量的？',
    '你对未来3年的职业规划是什么？',
    '你平时是如何学习新技术的？能举个例子吗？'
  ];
  const nextQuestion = questionCount >= 4 ? '' : nextQuestions[questionCount] || '';
  
  return { score, comment, highlights, improvements, nextQuestion };
}

// 模拟数据：面试报告
function getMockReport(interview: any, answers: any[]): string {
  const totalScore = answers.reduce((sum: number, a: any) => sum + (a.score || 0), 0);
  const avgScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;
  
  return `# 模拟面试报告

## 总体评价
恭喜你完成了"${interview.title || '模拟面试'}"！你的综合得分是 **${avgScore}分**（满分10分）。

## 分项评价
${answers.map((a: any, i: number) => `### 第${i+1}题（得分：${a.score}/10）
**问题**：${a.question}
**你的回答**：${a.answer.substring(0, 100)}${a.answer.length > 100 ? '...' : ''}
**评价**：${a.comment}
**亮点**：${a.highlights?.join('、') || '无'}
**改进建议**：${a.improvements?.join('、') || '无'}
`).join('\n')}

## 综合建议
你在本次面试中展现了${avgScore >= 8 ? '优秀的' : avgScore >= 6 ? '良好的' : '基本的'}专业能力。建议：
1. ${avgScore >= 8 ? '继续保持高质量回答，注意时间控制' : '增加具体案例和数据支撑'}
2. 多练习行为面试问题（STAR法则）
3. 准备1-2个深入的项目案例

---
*本报告由AI生成，仅供参考。*`;
}

// ========== 结束：模拟模式函数和数据 ==========

// 从API错误中提取可读的错误信息（处理JSON字符串和对象两种情况）
function extractApiError(error: any, fallback: string): string {
  if (error.response?.data) {
    let data = error.response.data;
    // 如果data是JSON字符串，先解析
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        return data;
      }
    }
    if (typeof data === 'object' && data !== null) {
      if (typeof data.message === 'string') return data.message;
      if (typeof data.error === 'string') return data.error;
      return JSON.stringify(data);
    }
    return String(data);
  }
  if (error.message) return error.message;
  return fallback;
}

// 认证中间件
const authMiddleware = async (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId! = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: '认证失败' });
  }
};

// 获取面试列表
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const interviews = await prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { resume: { select: { title: true } } }
    });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: '获取面试列表失败' });
  }
});

// 创建面试
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { resumeId, title, position, difficulty, language, aiRole } = req.body;
    
    const interview = await prisma.interview.create({
      data: {
        userId,
        resumeId,
        title: title || `${position || '模拟'}面试`,
        position,
        difficulty: difficulty || 'MEDIUM',
        language: language || 'ZH_CN',
        aiRole: aiRole || 'PROFESSIONAL',
        questions: [],
        status: 'CREATED'
      }
    });
    
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ error: '创建面试失败' });
  }
});

// 获取单个面试
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    const interview = await prisma.interview.findFirst({
      where: { id, userId },
      include: { resume: true }
    });
    
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }
    
    res.json(interview);
  } catch (error) {
    res.status(500).json({ error: '获取面试详情失败' });
  }
});

// 开始面试（生成第一个问题）
router.post('/:id/start', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    const interview = await prisma.interview.findFirst({
      where: { id, userId },
      include: { resume: true }
    });
    
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }
    
    // 模拟模式：返回模拟数据（不调用真实API）
    if (isMockMode()) {
      const position = interview.position || '通用岗位';
      const firstQuestion = getMockFirstQuestion(position);
      
      // 更新面试状态
      const updatedInterview = await prisma.interview.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          questions: [firstQuestion],
          answers: [],
          feedback: {}
        }
      });
      
      return res.json({
        message: '面试开始（模拟模式）',
        interview: updatedInterview,
        firstQuestion: firstQuestion,
        mock: true
      });
    }

    // 真实模式：调用腾讯元器API生成第一个问题
    const position = interview.position || '通用岗位';
    const difficulty = interview.difficulty || 'MEDIUM';
    const role = interview.aiRole === 'STRICT' ? '严厉的资深面试官' : interview.aiRole === 'FRIENDLY' ? '友好的面试官' : '专业的面试官';
    const resumeText = (interview.resume as any)?.content || '暂无简历内容';

    const appid = process.env.YUANQI_APPID;
    const appkey = process.env.YUANQI_APPKEY;
    if (!appid || !appkey) {
      return res.status(500).json({ error: '服务器配置错误：缺少 YUANQI_APPID 或 YUANQI_APPKEY 环境变量' });
    }

    // 初始化消息历史（对话上下文）
    let messages: any[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `【任务：模拟面试-开始】
你是一位${role}，正在进行一场${difficulty}难度的模拟面试，岗位是"${position}"。

## 面试规则
- 你需要基于候选人的简历，提出${difficulty === 'EASY' ? '基础' : difficulty === 'HARD' ? '高难度' : '中等难度'}的面试问题
- 问题应该是开放性的，能考察候选人的综合素质和专业能力
- 如果是技术岗位，可以问技术问题；如果是通用岗位，问行为面试问题
- 问题要具体，不要问"请介绍一下自己"这种太泛的问题

## 简历内容
${resumeText.substring(0, 4000)}

## 输出要求
请直接输出第一个面试问题，不要有任何前缀、解释或问候语。问题要简洁明了，一针见血。`
          }
        ]
      }
    ];

    const response = await axios.post('https://yuanqi.tencent.com/openapi/v1/agent/chat/completions', {
      assistant_id: appid,
      user_id: userId,
      stream: false,
      messages: messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appkey}`
      },
      timeout: 30000
    });

    let firstQuestion = (response as any).data.choices[0].message.content.trim();

    // 如果AI返回了JSON格式（包含next_question字段），提取真正的问题文本
    try {
      const jsonMatch = firstQuestion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.next_question) {
          firstQuestion = parsed.next_question;
        } else if (parsed.question) {
          firstQuestion = parsed.question;
        }
      }
    } catch (e) {
      // 不是JSON格式，保持原样
    }

    // 清理可能的Markdown代码块标记
    firstQuestion = firstQuestion.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    
    // 把AI的回复追加到消息历史
    messages.push({
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: firstQuestion
        }
      ]
    });
    
    // 更新面试状态
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        questions: [firstQuestion],
        answers: [],
        feedback: {},
        messages: messages  // 保存消息历史
      }
    });
    
    res.json({
      message: '面试开始',
      interview: updatedInterview,
      firstQuestion: firstQuestion
    });
  } catch (error: any) {
    console.error('开始面试失败:', error);
    res.status(500).json({ error: extractApiError(error, '开始面试失败') });
  }
});

// 提交回答（获取评价和下一个问题）
router.post('/:id/answer', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { answer } = req.body;
    
    const interview = await prisma.interview.findFirst({
      where: { id, userId }
    });
    
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }
    
    if (interview.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: '面试未在进行中' });
    }
    
    const questions = interview.questions as string[];
    const answers = interview.answers as unknown as Answer[];
    const currentQuestionIndex = answers.length;
    const currentQuestion = questions[currentQuestionIndex];
    
    // 模拟模式：返回模拟评价（不调用真实API）
    if (isMockMode()) {
      const position = interview.position || '通用岗位';
      const mockEval = getMockEvaluation(answer, currentQuestionIndex, position);
      
      // 保存回答和评价
      const newAnswer = {
        question: currentQuestion,
        answer,
        score: mockEval.score,
        comment: mockEval.comment,
        highlights: mockEval.highlights || [],
        improvements: mockEval.improvements || [],
        timestamp: new Date().toISOString()
      };
      answers.push(newAnswer);
      
      // 如果有下一个问题，添加到questions数组
      if (mockEval.nextQuestion) {
        questions.push(mockEval.nextQuestion);
      }
      
      // 更新面试
      const updateData: any = {
        answers,
        questions
      };
      
      // 如果面试结束（没有下一个问题）
      if (!mockEval.nextQuestion) {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();
        
        // 计算总分
        const totalScore = answers.reduce((sum: number, a: any) => sum + a.score, 0);
        updateData.score = Math.round(totalScore / answers.length);
      }
      
      const updatedInterview = await prisma.interview.update({
        where: { id },
        data: updateData
      });
      
      return res.json({
        message: mockEval.nextQuestion ? '回答已记录（模拟模式）' : '面试结束（模拟模式）',
        interview: updatedInterview,
        evaluation: {
          score: mockEval.score,
          comment: mockEval.comment,
          highlights: mockEval.highlights || [],
          improvements: mockEval.improvements || []
        },
        nextQuestion: mockEval.nextQuestion,
        mock: true
      });
    }
    
    // 真实模式：调用腾讯元器API评价回答并生成下一个问题
    let score: number, comment: string, highlights: string[], improvements: string[], nextQuestion: string;
    
    // 读取消息历史（对话上下文）
    let messages = (interview.messages as any[]) || [];
    
    const appid = process.env.YUANQI_APPID;
    const appkey = process.env.YUANQI_APPKEY;
    if (!appid || !appkey) {
      return res.status(500).json({ error: '服务器配置错误：缺少 YUANQI_APPID 或 YUANQI_APPKEY 环境变量' });
    }
    
    // 构建当前用户消息（包含回答和评估请求）
    const userMessage = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `【任务：模拟面试-评估回答】你是一位${interview.aiRole === 'STRICT' ? '严厉挑剔、追求完美的资深' : interview.aiRole === 'FRIENDLY' ? '友好温和、鼓励性的' : '专业严谨、注重细节的'}面试官。

## 当前面试信息
- 岗位：${interview.position || '通用'}
- 难度：${interview.difficulty}
- 当前题号：第${answers.length + 1}题
- 当前问题：${currentQuestion}

## 候选人回答
${answer}

## 你的任务
1. 评估这个回答的质量（1-10分）
2. 给出具体的评价（100字以内，要指出回答中的亮点、不足、可以改进的地方）
3. 决定是否有下一个问题：
   - 如果这是第5题，next_question必须为""
   - 如果有下一个问题，要生成一个有深度、能进一步考察的问题（可以是追问，也可以是新方向）

## 输出格式（严格JSON，不要输出其他内容）
{
  "score": <1-10整数，评分>,
  "comment": "<评价文本，100字左右，具体指出优缺点>",
  "highlights": ["回答中的亮点1", "亮点2"],
  "improvements": ["可以改进的地方1", "改进建议2"],
  "next_question": "<下一个问题，如果是最后一题则为空字符串>"
}

## 评分标准（严格执行，不要放水）
- 10分：回答完美，有具体案例、数据支撑，展现深度思考和专业能力
- 8-9分：回答很好，结构清晰，有案例或数据，少量可改进
- 6-7分：回答尚可，有基本思路，但缺乏深度、案例或数据支撑
- 4-5分：回答一般，思路不清晰，或过于简略（少于20字），或没有正面回答问题
- 1-3分：回答质量很差，包括：完全离题、答非所问、只有几个字的无效回答（如"出错"、"不知道"）、或内容与问题完全无关

## 特别注意
- 如果回答只有2-5个字，且没有任何实质内容（如"出错"、"不知道"、"嗯"），必须给1-2分
- 如果回答完全没有回应问题（如问"有没有经验"，回答"我喜欢打游戏"），必须给1-3分
- 不要因为"态度好"或"格式工整"就给高分，要看实质内容

注意：
- highlights和improvements数组要具体，不要泛泛而谈
- next_question要有深度，能继续考察候选人
- 不要输出JSON以外的任何内容`
        }
      ]
    };
    
    // 追加当前用户消息到消息历史
    messages.push(userMessage);
    
    const response = await axios.post('https://yuanqi.tencent.com/openapi/v1/agent/chat/completions', {
      assistant_id: appid,
      user_id: userId,
      stream: false,
      messages: messages
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appkey}`
      },
      timeout: 30000
    });
    
    // 解析AI返回
    const content = (response as any).data.choices[0].message.content;
    let evaluation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      // 兼容旧格式（只有score和comment）
      if (!evaluation.highlights) evaluation.highlights = [];
      if (!evaluation.improvements) evaluation.improvements = [];
    } catch (e) {
      evaluation = { score: 5, comment: '评价解析失败', highlights: [], improvements: [], next_question: '' };
    }
    
    // 把AI的回复追加到消息历史
    messages.push({
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: evaluation.next_question  // 下一个问题文本
        }
      ]
    });
    
    // 保存回答和评价
    const newAnswer = {
      question: currentQuestion,
      answer,
      score: evaluation.score,
      comment: evaluation.comment,
      highlights: evaluation.highlights || [],
      improvements: evaluation.improvements || [],
      timestamp: new Date().toISOString()
    };
    answers.push(newAnswer);
    
    // 如果有下一个问题，添加到questions数组
    nextQuestion = evaluation.next_question || '';
    if (nextQuestion) {
      questions.push(nextQuestion);
    }
    
    // 更新面试
    const updateData: any = {
      answers,
      questions,
      messages  // 保存消息历史
    };
    
    // 如果面试结束（没有下一个问题）
    if (!nextQuestion) {
      updateData.status = 'COMPLETED';
      updateData.completedAt = new Date();
      
      // 计算总分
      const totalScore = answers.reduce((sum: number, a: any) => sum + a.score, 0);
      updateData.score = Math.round(totalScore / answers.length);
    }
    
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      message: nextQuestion ? '回答已记录' : '面试结束',
      interview: updatedInterview,
      evaluation: {
        score: evaluation.score,
        comment: evaluation.comment,
        highlights: evaluation.highlights || [],
        improvements: evaluation.improvements || []
      },
      nextQuestion
    });
  } catch (error: any) {
    console.error('提交回答失败:', error);
    res.status(500).json({ error: extractApiError(error, '提交回答失败') });
  }
});

// 结束面试（手动结束）
router.post('/:id/end', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    const interview = await prisma.interview.findFirst({
      where: { id, userId }
    });
    
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }
    
    // 计算总分
    const answers = interview.answers as unknown as Answer[] || [];
    let totalScore = 0;
    if (answers.length > 0) {
      totalScore = answers.reduce((sum: number, a: any) => sum + (a.score || 0), 0);
    }
    
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        score: answers.length > 0 ? Math.round(totalScore / answers.length) : null
      }
    });
    
    res.json({
      message: '面试已结束',
      interview: updatedInterview
    });
  } catch (error) {
    res.status(500).json({ error: '结束面试失败' });
  }
});

// 生成面试报告
router.post('/:id/report', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    const interview = await prisma.interview.findFirst({
      where: { id, userId },
      include: { resume: true }
    });
    
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }
    
    if (interview.status !== 'COMPLETED') {
      return res.status(400).json({ error: '面试未完成，无法生成报告' });
    }
    
    const answers = interview.answers as unknown as Answer[] || [];
    
    if (answers.length === 0) {
      return res.status(400).json({ error: '没有面试回答记录' });
    }
    
    // 模拟模式：返回模拟报告（不调用真实API）
    if (isMockMode()) {
      const mockReport = getMockReport(interview, answers);
      return res.json({
        report: mockReport,
        mock: true
      });
    }
    
    // 真实模式：调用元器API生成报告
    const appid = process.env.YUANQI_APPID;
    const appkey = process.env.YUANQI_APPKEY;
    if (!appid || !appkey) {
      return res.status(500).json({ error: '服务器配置错误：缺少 YUANQI_APPID 或 YUANQI_APPKEY 环境变量' });
    }
    
    // 构建面试历史文本
    const interviewHistory = answers.map((a: any, index: number) => {
      return `第${index + 1}题：${a.question}
候选人回答：${a.answer}
评分：${a.score}分
评价：${a.comment}
亮点：${(a.highlights || []).join('; ')}
改进点：${(a.improvements || []).join('; ')}`;
    }).join('\n\n---\n\n');
    
    const response = await axios.post('https://yuanqi.tencent.com/openapi/v1/agent/chat/completions', {
      assistant_id: appid,
      user_id: userId,
      stream: false,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `【任务：生成面试报告】你是一位资深招聘专家，请根据以下面试过程，生成一份专业、详细、有洞察力的面试报告。

## 面试信息
- 岗位：${interview.position || '通用'}
- 难度：${interview.difficulty}
- 总体评分：${interview.score || 0}分
- 开始时间：${interview.startedAt}
- 结束时间：${interview.completedAt}

## 面试过程
${interviewHistory}

## 你的任务
生成一份专业的面试报告，包含以下部分：

### 1. 总体评分（0-100分）
综合评估候选人的整体表现。

### 2. 面试通过概率
基于表现，估算该候选人在真实面试中通过的概率（如"75%"）。

### 3. 能力维度评分（7个维度，每维度0-100分）
- 技术能力：专业技能和知识掌握程度
- 沟通能力：表达清晰度和逻辑性
- 逻辑思维：分析问题的方法和思路
- 压力应对：面对挑战性问题的反应
- 职业规划：对自身发展的思考
- 语言表达：语言组织和叙述能力
- 专业知识：岗位相关知识的深度

### 4. 各题表现分析
对每一题的回答进行详细点评，包括得分原因、亮点、不足。

### 5. 优势分析
总结候选人最突出的3-5个优势，每个优势要有具体说明。

### 6. 改进建议
给出3-5条具体、可操作的改进建议，每条建议要有针对性。

### 7. 面试数据统计
- 总题数、总时长、平均回答长度
- 高分题目数（≥8分）、低分题目数（≤5分）

### 8. 最终建议
一段总结性的建议文字（100-200字），给候选人指明后续努力方向。

## 输出格式（严格JSON，不要输出其他内容）
{
  "overall_score": 78,
  "pass_probability": "70%",
  "dimension_scores": {
    "技术能力": 82,
    "沟通能力": 75,
    "逻辑思维": 80,
    "压力应对": 70,
    "职业规划": 65,
    "语言表达": 78,
    "专业知识": 72
  },
  "question_reviews": [
    {
      "question_num": 1,
      "question": "请简要介绍自己",
      "answer": "用户回答内容",
      "score": 75,
      "comment": "结构清晰但缺少量化成果",
      "highlights": ["表达流畅", "结构合理"],
      "improvements": ["缺少具体数据支撑", "可以加入量化成果"]
    }
  ],
  "strengths": [
    "技术栈匹配度高，有微服务实战经验",
    "沟通表达清晰，逻辑思维较强"
  ],
  "improvements": [
    "建议准备更多量化案例，用数据证明能力",
    "可以提前准备STAR法则的行为面试答案"
  ],
  "interview_stats": {
    "total_questions": 5,
    "total_duration": "<根据实际开始时间和结束时间计算，单位秒>",
    "avg_answer_length": 120,
    "high_score_questions": 2,
    "low_score_questions": 1
  },
  "final_advice": "整体表现良好，技术能力突出。建议在后续面试中多准备量化案例，并提前用STAR法则梳理行为面试答案。同时可以加强对行业趋势的了解，展现更广阔的视野。"
}

注意：
- 所有评分要客观、有依据
- 建议要具体、可操作
- total_duration 必须根据面试开始时间(startedAt)和结束时间(completedAt)计算真实时长（秒），严禁使用示例中的占位值
- 不要输出JSON以外的任何内容`
            }
          ]
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appkey}`
      },
      timeout: 60000
    });
    
    // 解析AI返回的报告
    const content = (response as any).data.choices[0].message.content;
    let report;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      report = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('报告解析失败:', e);
      return res.status(500).json({ error: '报告生成失败，JSON解析错误' });
    }

    // 用真实的 startedAt/completedAt 重新计算 total_duration，覆盖 AI 可能抄的示例值
    if (interview.startedAt && interview.completedAt) {
      const realDuration = Math.max(0, Math.round(
        (new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000
      ));
      if (report.interview_stats) {
        report.interview_stats.total_duration = realDuration;
      }
    }
    
    // 更新面试记录，保存报告
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        feedback: report
      }
    });
    
    res.json({
      message: '报告生成成功',
      interview: updatedInterview,
      report
    });
  } catch (error: any) {
    console.error('生成报告失败:', error);
    res.status(500).json({ error: extractApiError(error, '生成报告失败') });
  }
});

// 删除面试
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    const interview = await prisma.interview.findFirst({
      where: { id, userId }
    });
    
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }
    
    await prisma.interview.delete({
      where: { id }
    });
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除面试失败' });
  }
});

export default router;
