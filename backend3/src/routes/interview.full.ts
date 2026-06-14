import { Router, Request, Response } from 'express';
import { getPrisma } from '../index';
import axios from 'axios';
import { authenticateToken, requireUser, AuthRequest } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimit';
import { sanitizeError } from '../utils/sanitize';
import { extractApiError } from '../utils/extractError';
import { isMockMode, getMockFirstQuestion, getMockEvaluation, getMockReport, Answer } from './interview/mock';

const router = Router();

// ========== 获取面试列表（支持 ?type=PRACTICE|ENTERPRISE 过滤） ==========
router.get('/', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const typeFilter = req.query.type as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (typeFilter === 'ENTERPRISE') {
      where.type = 'ENTERPRISE';
      // 企业面试：求职者只返回基本信息，不暴露面试配置
      const [interviews, total] = await Promise.all([
        getPrisma().interview.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            status: true,
            type: true,
            createdAt: true,
          }
        }),
        getPrisma().interview.count({ where })
      ]);
      return res.json({
        interviews,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      });
    } else if (typeFilter === 'PRACTICE') {
      where.type = 'PRACTICE';
    }

    const [interviews, total] = await Promise.all([
      getPrisma().interview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { resume: { select: { title: true } } }
      }),
      getPrisma().interview.count({ where })
    ]);
    res.json({
      interviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('获取面试列表失败:', sanitizeError(error));
    res.status(500).json({ error: '获取面试列表失败' });
  }
});

// 创建面试
router.post('/', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { resumeId, title, position, difficulty, language, aiRole } = req.body;
    
    const interview = await getPrisma().interview.create({
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
    console.error('创建面试失败:', sanitizeError(error));
    res.status(500).json({ error: '创建面试失败' });
  }
});

// 获取单个面试
router.get('/:id', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    const interview = await getPrisma().interview.findFirst({
      where: { id, userId },
      include: { resume: true }
    });
    
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }
    
    res.json(interview);
  } catch (error) {
    console.error('获取面试详情失败:', sanitizeError(error));
    res.status(500).json({ error: '获取面试详情失败' });
  }
});

// 开始面试（生成第一个问题）
router.post('/:id/start', aiLimiter, authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    const interview = await getPrisma().interview.findFirst({
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
      
      // 更新面试状态（保留原始配置到feedback防止丢失）
      const qData = (interview.questions as any) || {};
      const updatedInterview = await getPrisma().interview.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
          questions: [firstQuestion],
          answers: [],
          feedback: { interviewConfig: qData?.config || {} }
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
    const rawResume = (interview.resume as any)?.content;
    const resumeText = (typeof rawResume === 'string' ? rawResume : typeof rawResume === 'object' ? JSON.stringify(rawResume) : '暂无简历内容') || '暂无简历内容';
    
    // 检测是否为企业面试
    const isEnterprise = (interview as any).type === 'ENTERPRISE';
    const questionsData = (interview.questions as any) || {};
    const enterpriseConfig = isEnterprise ? (questionsData.config || {}) : null;

    // 企业面试使用企业智能体，练习面试使用求职者智能体
    const appid = isEnterprise ? process.env.YUANQI_ENTERPRISE_APPID : process.env.YUANQI_APPID;
    const appkey = isEnterprise ? process.env.YUANQI_ENTERPRISE_APPKEY : process.env.YUANQI_APPKEY;
    
    if (!appid || !appkey) {
      const label = isEnterprise ? 'YUANQI_ENTERPRISE_APPID/APPKEY' : 'YUANQI_APPID/APPKEY';
      return res.status(500).json({ error: `服务器配置错误：缺少 ${label} 环境变量` });
    }

    // 企业面试的 prompt
    const systemPrompt = isEnterprise ? `【任务：企业定制面试-开始】
你是一位专业的面试官，正在进行一场企业定制的面试，岗位是"${position}"。

## 面试要求
- 难度：${enterpriseConfig?.difficulty || '中级'}
${enterpriseConfig?.keywords?.length ? `- 考察关键词：${enterpriseConfig.keywords.join('、')}\n- 你的所有提问必须紧密围绕这些关键词展开！` : ''}
${enterpriseConfig?.abilities?.length ? `- 考察能力维度：${enterpriseConfig.abilities.join('、')}` : ''}
${enterpriseConfig?.customQuestions?.length ? `\n## 预设面试题（已由企业HR设定）\n${enterpriseConfig.customQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}\n\n请从预设题目中选择一题作为开场，后续提问可以围绕预设题目和相关关键词扩展。` : '请根据岗位关键词提出一个有针对性的开放性问题。'}

## 简历内容
${resumeText.substring(0, 4000)}

## 输出要求
请直接输出第一个面试问题，不要有任何前缀、解释或问候语。问题要简洁明了，一针见血。` : `【任务：模拟面试-开始】
你是一位${role}，正在进行一场${difficulty}难度的模拟面试，岗位是"${position}"。

## 面试规则
- 你需要基于候选人的简历，提出${difficulty === 'EASY' ? '基础' : difficulty === 'HARD' ? '高难度' : '中等难度'}的面试问题
- 问题应该是开放性的，能考察候选人的综合素质和专业能力
- 如果是技术岗位，可以问技术问题；如果是通用岗位，问行为面试问题
- 问题要具体，不要问"请介绍一下自己"这种太泛的问题

## 简历内容
${resumeText.substring(0, 4000)}

## 输出要求
请直接输出第一个面试问题，不要有任何前缀、解释或问候语。问题要简洁明了，一针见血。`;

    // 初始化消息历史（对话上下文）
    let messages: any[] = [
      {
        role: 'user',
        content: [{ type: 'text', text: systemPrompt }]
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
        'Authorization': `Bearer ${appkey}`,
        ...(isEnterprise ? { 'X-Source': 'openapi' } : {})
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
    // 企业面试：把原始配置备份到 feedback，因为 questions 会被覆盖为字符串数组
    const feedbackData = isEnterprise && enterpriseConfig ? { interviewConfig: enterpriseConfig } : {};

    const updatedInterview = await getPrisma().interview.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        questions: [firstQuestion],
        answers: [],
        feedback: feedbackData,
        messages: messages  // 保存消息历史
      }
    });
    
    res.json({
      message: '面试开始',
      interview: updatedInterview,
      firstQuestion: firstQuestion
    });
  } catch (error: any) {
    console.error('开始面试失败:', sanitizeError(error));
    res.status(500).json({ error: extractApiError(error, '开始面试失败') });
  }
});

// 提交回答（获取评价和下一个问题）
router.post('/:id/answer', aiLimiter, authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { answer } = req.body;
    
    const interview = await getPrisma().interview.findFirst({
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
    
    // 模拟模式：SSE 流式返回（模拟延迟 + 逐字输出）
    if (isMockMode()) {
      const position = interview.position || '通用岗位';
      const followUpCount = (answers as any[]).filter(a => a.type === 'follow_up').length;
      const feedback = (interview.feedback as any) || {};
      const maxQuestions = (feedback?.interviewConfig?.questionCount)
        || ((interview.questions as any)?.config?.questionCount)
        || 10;
      
      const mockEval = getMockEvaluation(
        answer,
        currentQuestionIndex - followUpCount,
        position,
        followUpCount,
        maxQuestions
      );

      // SSE 头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const sendSSE = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      sendSSE({ type: 'start', mode: 'mock' });

      // 模拟逐字输出：生成一个假的 JSON 回答 + 下一个问题
      const mockContent = `{\n  "score": ${mockEval.score},\n  "comment": "${mockEval.comment}",\n  "highlights": ${JSON.stringify(mockEval.highlights || [])},\n  "improvements": ${JSON.stringify(mockEval.improvements || [])},\n  "next_question": "${(mockEval.nextQuestion || '').replace(/"/g, '\\"')}"\n}`;
      
      // 逐字发送（每 30ms 一个字符，模拟流式效果）
      for (let i = 0; i < mockContent.length; i++) {
        sendSSE({ type: 'delta', content: mockContent[i] });
        await new Promise(r => setTimeout(r, 20 + Math.random() * 20));
      }

      // 保存
      const newAnswer = {
        question: currentQuestion,
        answer,
        score: mockEval.score,
        comment: mockEval.comment,
        highlights: mockEval.highlights || [],
        improvements: mockEval.improvements || [],
        type: mockEval.type || 'next_question',
        timestamp: new Date().toISOString(),
      };
      answers.push(newAnswer);
      if (mockEval.nextQuestion) questions.push(mockEval.nextQuestion);

      const updateData: any = { answers, questions };
      if (!mockEval.nextQuestion) {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();
        const totalScore = answers.reduce((sum: number, a: any) => sum + a.score, 0);
        updateData.score = Math.round(totalScore / answers.length);
      }

      const updatedInterview = await getPrisma().interview.update({
        where: { id },
        data: updateData,
      });

      sendSSE({
        type: 'done',
        evaluation: {
          score: mockEval.score,
          comment: mockEval.comment,
          highlights: mockEval.highlights || [],
          improvements: mockEval.improvements || [],
        },
        nextQuestion: mockEval.nextQuestion || '',
        questionType: mockEval.type || 'next_question',
        mock: true,
        interview: {
          id: updatedInterview.id,
          status: updatedInterview.status,
          score: updatedInterview.score,
          questions: updatedInterview.questions,
        },
      });

      return res.end();
    }
    
    // 真实模式：SSE 流式调用腾讯元器API
    // 读取消息历史
    let messages = (interview.messages as any[]) || [];
    
    // 检测是否为企业面试
    const isEnterprise = (interview as any).type === 'ENTERPRISE';

    // 读取面试配置
    const feedbackData = (interview.feedback as any) || {};
    const interviewConfig = feedbackData.interviewConfig || {};
    const questionsData = (interview.questions as any) || {};
    const enterpriseConfig = isEnterprise
      ? (interviewConfig || questionsData.config || {})
      : null;

    const maxQuestions = isEnterprise
      ? (enterpriseConfig?.questionCount || 5)
      : 10;

    const appid = isEnterprise ? process.env.YUANQI_ENTERPRISE_APPID : process.env.YUANQI_APPID;
    const appkey = isEnterprise ? process.env.YUANQI_ENTERPRISE_APPKEY : process.env.YUANQI_APPKEY;
    if (!appid || !appkey) {
      return res.status(500).json({ error: '服务器配置错误' });
    }

    const isLastQuestion = answers.length >= maxQuestions - 1;
    const enterprisePrompt = isEnterprise ? `【任务：企业面试-评估回答】你是一位企业招聘面试官，正在评估候选人。

## 面试背景
- 岗位：${interview.position || '通用'}
- 考察关键词：${enterpriseConfig?.keywords?.join('、') || '无'}
- 考察能力：${enterpriseConfig?.abilities?.join('、') || '综合能力'}
- 当前题号：第${answers.length + 1}题 / 共${maxQuestions}题
- 当前问题：${currentQuestion}

## 候选人回答
${answer}

## 你的任务
1. 评估回答质量（1-10分），重点考察是否覆盖了考察关键词和能力维度
2. 给出具体评价（100字以内）
3. 决定下一个问题：${isLastQuestion ? `这已经是最后一题（第${maxQuestions}题），next_question必须为空字符串，面试结束` : '围绕考察关键词提出有深度的问题'}
${enterpriseConfig?.customQuestions?.length ? `\n## 企业预设题目\n${enterpriseConfig.customQuestions.join('\n')}` : ''}

## 输出格式（严格JSON）
{
  "score": <1-10>,
  "comment": "<评价>",
  "highlights": ["亮点"],
  "improvements": ["改进"],
  "next_question": "<下一题或空>"
}` : `【任务：模拟面试-评估回答】你是一位${interview.aiRole === 'STRICT' ? '严厉挑剔、追求完美的资深' : interview.aiRole === 'FRIENDLY' ? '友好温和、鼓励性的' : '专业严谨、注重细节的'}面试官。

## 当前面试信息
- 岗位：${interview.position || '通用'}
- 难度：${interview.difficulty}
- 当前题号：第${answers.length + 1}题 / 共${maxQuestions}题
- 当前问题：${currentQuestion}

## 候选人回答
${answer}

## 你的任务
1. 评估这个回答的质量（1-10分）
2. 给出具体的评价
3. 决定是否有下一个问题：${isLastQuestion ? `这是最后一题，next_question必须为""` : '生成有深度的下一个问题'}

## 输出格式（严格JSON）
{"score":<1-10>,"comment":"<评价>","highlights":["亮点"],"improvements":["改进"],"next_question":"<下一题或空>"}
不要输出JSON以外的任何内容`;

    const userMessage = {
      role: 'user',
      content: [{ type: 'text', text: enterprisePrompt }]
    };
    messages.push(userMessage);

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendSSE = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendSSE({ type: 'start', mode: 'real' });

      // 调用元器 API（流式）
      const apiResponse = await fetch('https://yuanqi.tencent.com/openapi/v1/agent/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${appkey}`,
          ...(isEnterprise ? { 'X-Source': 'openapi' } : {}),
        },
        body: JSON.stringify({
          assistant_id: appid,
          user_id: userId,
          stream: true,
          messages,
        }),
      });

      if (!apiResponse.ok || !apiResponse.body) {
        throw new Error(`元器 API 错误: ${apiResponse.status}`);
      }

      // 读取流式响应
      const reader = (apiResponse.body as any).getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // 解析 SSE 行（元器返回 OpenAI 兼容格式：data: {...}）
        const lines = chunk.split('\n').filter((l: string) => l.startsWith('data: '));
        for (const line of lines) {
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              sendSSE({ type: 'delta', content: delta });
            }
          } catch { /* skip unparseable */ }
        }
      }

      reader.releaseLock();

      // 解析完整的 AI 返回
      let evaluation: any;
      try {
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : fullContent);
        if (!evaluation.highlights) evaluation.highlights = [];
        if (!evaluation.improvements) evaluation.improvements = [];
      } catch {
        evaluation = { score: 5, comment: '评价解析失败', highlights: [], improvements: [], next_question: '' };
      }

      // 保存消息历史
      messages.push({
        role: 'assistant',
        content: [{ type: 'text', text: evaluation.next_question || '' }],
      });

      // 保存回答
      const newAnswer = {
        question: currentQuestion,
        answer,
        score: evaluation.score,
        comment: evaluation.comment,
        highlights: evaluation.highlights || [],
        improvements: evaluation.improvements || [],
        timestamp: new Date().toISOString(),
      };
      answers.push(newAnswer);

      const nextQuestion = evaluation.next_question || '';
      // P1-4: 硬上限兜底——AI 不按 prompt 返回空时强制结束
      if (nextQuestion && answers.length >= maxQuestions) {
        // 已达到配置题数，忽略 AI 返回的额外题目
        if (nextQuestion) questions.push(nextQuestion); // 仍记录但不继续
      } else if (nextQuestion) {
        questions.push(nextQuestion);
      }

      const updateData: any = { answers, questions, messages };
      // 面试结束条件：没有下一题 或 已达上限
      if (!nextQuestion || answers.length >= maxQuestions) {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();
        const totalScore = answers.reduce((sum: number, a: any) => sum + a.score, 0);
        updateData.score = Math.round(totalScore / answers.length);
      }

      const updatedInterview = await getPrisma().interview.update({
        where: { id },
        data: updateData,
      });

      // 发送完成事件
      sendSSE({
        type: 'done',
        evaluation: {
          score: evaluation.score,
          comment: evaluation.comment,
          highlights: evaluation.highlights || [],
          improvements: evaluation.improvements || [],
        },
        nextQuestion,
        interview: {
          id: updatedInterview.id,
          status: updatedInterview.status,
          score: updatedInterview.score,
          questions: updatedInterview.questions,
        },
      });

      res.end();
    } catch (error: any) {
      console.error('SSE 流式响应失败:', sanitizeError(error));
      try {
        sendSSE({ type: 'error', message: extractApiError(error, '提交回答失败') });
      } catch { /* connection already closed */ }
      res.end();
    }
  } catch (error: any) {
    console.error('提交回答失败:', sanitizeError(error));
    res.status(500).json({ error: extractApiError(error, '提交回答失败') });
  }
});

// 结束面试（手动结束）
router.post('/:id/end', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    const interview = await getPrisma().interview.findFirst({
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
    
    const updatedInterview = await getPrisma().interview.update({
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
    console.error('结束面试失败:', sanitizeError(error));
    res.status(500).json({ error: '结束面试失败' });
  }
});

// 生成面试报告 (SSE流式返回)
router.post('/:id/report', aiLimiter, authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  // 设置SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // 发送SSE事件
  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    // 进度：开始
    sendEvent({ type: 'progress', step: 'init', percent: 0, message: '开始生成报告...' });

    const interview = await getPrisma().interview.findFirst({
      where: { id, userId },
      include: { resume: true }
    });
    
    if (!interview) {
      sendEvent({ type: 'error', error: '面试不存在' });
      return res.end();
    }
    
    // 企业面试不允许求职者生成报告
    if ((interview as any).type === 'ENTERPRISE') {
      sendEvent({ type: 'error', error: '企业面试报告仅企业端可见' });
      return res.end();
    }
    
    if (interview.status !== 'COMPLETED') {
      sendEvent({ type: 'error', error: '面试未完成，无法生成报告' });
      return res.end();
    }
    
    const answers = interview.answers as unknown as Answer[] || [];
    
    if (answers.length === 0) {
      sendEvent({ type: 'error', error: '没有面试回答记录' });
      return res.end();
    }
    
    // 模拟模式：返回模拟报告（不调用真实API）
    if (isMockMode()) {
      sendEvent({ type: 'progress', step: 'generating', percent: 30, message: '生成模拟报告中...' });
      await new Promise(resolve => setTimeout(resolve, 800));
      sendEvent({ type: 'progress', step: 'parsing', percent: 60, message: '解析报告数据...' });
      const mockReport = getMockReport(interview, answers);
      sendEvent({ type: 'progress', step: 'saving', percent: 90, message: '保存报告...' });
      const updatedInterview = await getPrisma().interview.update({
        where: { id },
        data: { feedback: mockReport }
      });
      sendEvent({ type: 'complete', report: mockReport, interview: updatedInterview });
      return res.end();
    }
    
    // 真实模式：调用元器API生成报告
    const appid = process.env.YUANQI_APPID;
    const appkey = process.env.YUANQI_APPKEY;
    if (!appid || !appkey) {
      sendEvent({ type: 'error', error: '服务器配置错误：缺少 YUANQI_APPID 或 YUANQI_APPKEY 环境变量' });
      return res.end();
    }
    
    sendEvent({ type: 'progress', step: 'calling_ai', percent: 20, message: '调用AI生成报告...' });
    
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

### 9. 优化建议（新增）
针对候选人的表现，给出3-5条具体的简历优化和面试准备建议，帮助候选人提升竞争力。

### 10. 面试模拟记录回顾（新增）
简要回顾本次面试的模拟过程，包括总题数、总时长、主要考察点，让候选人对整场模拟有整体认知。

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
  "optimization_suggestions": [
    "建议在简历中增加量化成果描述，如'提升性能30%'、'服务10万用户'等",
    "准备3-5个STAR法则的行为面试故事，覆盖团队合作、冲突解决、压力应对等场景",
    "深入研究目标公司的技术栈和业务，准备2-3个能体现你价值的具体案例"
  ],
  "interview_review": {
    "total_questions": 5,
    "total_duration": 1800,
    "main_topics": ["项目经验", "技术深度", "团队协作", "职业规划"],
    "summary": "本次模拟面试涵盖了项目经验、技术深度等核心考察点，整体表现良好。建议在行为面试方面加强准备。"
  },
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
- optimization_suggestions 和 interview_review 是新增字段，必须包含
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
    
    sendEvent({ type: 'progress', step: 'parsing', percent: 80, message: '解析报告数据...' });
    
    // 解析AI返回的报告
    const content = (response as any).data.choices[0].message.content;
    let report;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      report = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('报告解析失败:', sanitizeError(e));
      sendEvent({ type: 'error', error: '报告生成失败，JSON解析错误' });
      return res.end();
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
    
    sendEvent({ type: 'progress', step: 'saving', percent: 90, message: '保存报告...' });
    
    // 更新面试记录，保存报告
    const updatedInterview = await getPrisma().interview.update({
      where: { id },
      data: {
        feedback: report
      }
    });
    
    sendEvent({ type: 'complete', report, interview: updatedInterview });
    res.end();
  } catch (error: any) {
    console.error('生成报告失败:', sanitizeError(error));
    sendEvent({ type: 'error', error: extractApiError(error, '生成报告失败') });
    res.end();
  }
});

// AI评估面试（企业端）- 使用企业智能体生成HR评估报告
router.post('/:id/ai-evaluate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // 仅限企业用户和HR用户访问
    if (userRole !== 'ENTERPRISE' && userRole !== 'HR') {
      return res.status(403).json({ error: '仅企业用户和HR可进行AI评估' });
    }

    const interview = await getPrisma().interview.findUnique({
      where: { id },
      include: { resume: true, user: true }
    });

    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }

    if (interview.status !== 'COMPLETED') {
      return res.status(400).json({ error: '面试未完成，无法评估' });
    }

    const answers = (interview.answers as any) || [];
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: '没有面试回答记录' });
    }

    // 构建面试历史文本
    const interviewHistory = answers.map((a: any, index: number) => {
      return `第${index + 1}题：${a.question || ''}
候选人回答：${a.answer || '(未回答)'}
评分：${a.score || 0}分
评价：${a.comment || ''}`;
    }).join('\n\n---\n\n');

    // 模拟模式
    if (isMockMode()) {
      const mockResult = {
        recommendation: 'RECOMMEND',
        recommendationLabel: '推荐录用',
        overallScore: 78,
        dimensionScores: {
          '技术能力': 82,
          '沟通能力': 75,
          '逻辑思维': 80,
          '压力应对': 70,
          '学习能力': 78,
          '团队协作': 85
        },
        strengths: [
          '技术基础扎实，对核心知识点掌握较好',
          '逻辑思维清晰，分析问题有条理',
          '沟通表达自然，能清楚阐述观点'
        ],
        weaknesses: [
          '部分回答缺乏实际案例支撑',
          '在面对压力性问题时略有紧张',
          '对行业最新趋势了解不够深入'
        ],
        suggestions: [
          '建议补充更多量化成果和实际项目案例',
          '准备STAR法则的行为面试答案',
          '加强对目标行业技术栈的深入了解'
        ],
        summary: '候选人整体表现良好，技术能力达标，沟通表达清晰。具备基本岗位胜任力，建议进入下一轮面试。'
      };

      // 存入 feedback
      await getPrisma().interview.update({
        where: { id },
        data: {
          feedback: {
            ...(interview.feedback as any || {}),
            enterpriseEvaluation: mockResult,
            evaluatedAt: new Date().toISOString()
          }
        }
      });

      return res.json({ success: true, evaluation: mockResult });
    }

    // 真实模式：调用企业智能体
    const appid = process.env.YUANQI_ENTERPRISE_APPID;
    const appkey = process.env.YUANQI_ENTERPRISE_APPKEY;
    if (!appid || !appkey) {
      return res.status(500).json({ error: '企业AI智能体未配置，请在 .env 中设置 YUANQI_ENTERPRISE_APPID 和 YUANQI_ENTERPRISE_APPKEY' });
    }

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
              text: `【任务：AI面试评估报告】你是一位资深招聘专家，请根据以下面试记录，生成一份专业的面试评估报告，用于企业HR的录用决策参考。

## 面试信息
- 岗位：${interview.position || '通用'}
- 难度：${interview.difficulty}
- 总体评分：${interview.score || 0}分
- 候选人：${interview.user?.name || '未知'}
- 面试时长：${interview.startedAt && interview.completedAt ? Math.round((new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000) + '秒' : '未知'}

## 面试过程
${interviewHistory}

## 你的任务
从HR决策角度评估候选人，生成以下内容：

### 1. 推荐等级
从以下选择其一：STRONGLY_RECOMMEND（强烈推荐）、RECOMMEND（推荐）、PENDING（待定）、NOT_RECOMMEND（不推荐）

### 2. 综合评分（0-100分）
基于所有面试回答的加权综合评分。

### 3. 维度评分（0-100分）
- 技术能力
- 沟通能力
- 逻辑思维
- 压力应对
- 学习能力
- 团队协作

### 4. 优势分析（3-5条）
总结候选人最突出的优势，每条要有具体说明。

### 5. 不足分析（3-5条）
指出候选人的明显不足和风险点。

### 6. 改进建议（3-5条）
给候选人具体的提升建议。

### 7. 综合评价（100-200字）
一段总结性评价，帮助HR快速了解候选人是否适合该岗位。

## 输出格式（严格JSON，不要输出其他内容）
{
  "recommendation": "RECOMMEND",
  "recommendationLabel": "推荐录用",
  "overallScore": 78,
  "dimensionScores": {
    "技术能力": 82,
    "沟通能力": 75,
    "逻辑思维": 80,
    "压力应对": 70,
    "学习能力": 78,
    "团队协作": 85
  },
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["建议1", "建议2"],
  "summary": "综合评价文字..."
}

注意：
- 评分要客观、有依据，基于面试实际表现
- 建议要具体、可操作
- recommendationLabel 对应中文：STRONGLY_RECOMMEND→"强烈推荐"、RECOMMEND→"推荐录用"、PENDING→"待定"、NOT_RECOMMEND→"不推荐"
- 不要输出JSON以外的任何内容`
            }
          ]
        }
      ]
    }, {
      headers: {
        'X-Source': 'openapi',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appkey}`
      },
      timeout: 120000
    });

    // 解析AI返回
    const rawText = (response.data as any)?.choices?.[0]?.message?.content || '';
    let evaluation;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch (e) {
      console.error('AI评估解析失败:', sanitizeError(e));
      return res.status(500).json({ error: 'AI评估结果解析失败' });
    }

    // 存入 feedback
    await getPrisma().interview.update({
      where: { id },
      data: {
        feedback: {
          ...(interview.feedback as any || {}),
          enterpriseEvaluation: evaluation,
          evaluatedAt: new Date().toISOString()
        }
      }
    });

    return res.json({ success: true, evaluation });

  } catch (error: any) {
    console.error('AI评估面试失败:', sanitizeError(error));
    const apiError = error.response?.data?.error || error.response?.data?.message || error.message;
    res.status(500).json({ error: apiError || 'AI评估失败' });
  }
});

// 删除面试
router.delete('/:id', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    
    const interview = await getPrisma().interview.findFirst({
      where: { id, userId }
    });
    
    if (!interview) {
      return res.status(404).json({ error: '面试不存在' });
    }
    
    await getPrisma().interview.delete({
      where: { id }
    });
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除面试失败:', sanitizeError(error));
    res.status(500).json({ error: '删除面试失败' });
  }
});

export default router;
