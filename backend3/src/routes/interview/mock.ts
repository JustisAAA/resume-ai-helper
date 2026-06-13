/**
 * 面试模拟数据函数（MOCK_MODE 模式保底）
 */
export { isMockMode } from '../../config';

/** 面试回答记录 */
export interface Answer {
  question: string;
  answer: string;
  score: number;
  comment: string;
  highlights: string[];
  improvements: string[];
  timestamp: string;
}

// isMockMode 从 config/index.ts 导入

// 模拟数据：第一个面试问题（根据岗位返回）
export function getMockFirstQuestion(position: string): string {
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
export function getMockEvaluation(answer: string, questionCount: number, position: string, followUpCount: number = 0, maxQuestions: number = 10): any {
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

  const shouldFollowUp = answerLen < 20 && followUpCount < 2;
  
  if (shouldFollowUp) {
    const followUpQuestions = [
      '能否举一个具体的例子来说明？',
      '可以再展开谈谈你在这个过程中的具体做法吗？',
      '你觉得这个过程中最大的挑战是什么？',
      '能详细说说你是如何解决这个问题的吗？',
      '有没有相关的项目经验可以分享一下？',
    ];
    const followUp = followUpQuestions[followUpCount % followUpQuestions.length];
    return { score, comment, highlights, improvements, nextQuestion: followUp, type: 'follow_up' };
  }

  const baseQuestions = [
    '如果能重新设计这个项目，你会在哪些方面做改进？',
    '在团队协作中，你是如何保证代码质量的？',
    '你对未来3年的职业规划是什么？',
    '你平时是如何学习新技术的？能举个例子吗？',
    '请描述一个你解决过的最复杂的技术问题。',
    '你是如何做技术选型的？有哪些考量因素？',
    '面对紧急需求变更时，你通常如何处理？',
    '你在这份工作中最大的收获是什么？',
    '介绍一下你使用过的重要工具或框架及其特点。',
    '你对技术债务怎么看？如何处理？'
  ];
  const noMoreQuestions = questionCount >= maxQuestions - 1;
  const nextQuestion = noMoreQuestions ? '' : baseQuestions[questionCount % baseQuestions.length];
  
  return { score, comment, highlights, improvements, nextQuestion, type: 'next_question' };
}

// 模拟数据：面试报告
export function getMockReport(interview: any, answers: any[]): any {
  const totalScore = answers.reduce((sum: number, a: any) => sum + (a.score || 0), 0);
  const avgScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;
  const overallScore = Math.round(avgScore * 10);
  
  return {
    overall_score: overallScore,
    pass_probability: overallScore >= 60 ? "75%" : "40%",
    dimension_scores: {
      "技术能力": Math.min(100, overallScore + 5),
      "沟通能力": Math.min(100, overallScore + 2),
      "逻辑思维": Math.min(100, overallScore + 8),
      "压力应对": Math.min(100, overallScore - 5),
      "职业规划": Math.min(100, overallScore - 10),
      "语言表达": Math.min(100, overallScore + 3),
      "专业知识": Math.min(100, overallScore + 7)
    },
    question_reviews: answers.map((a: any, i: number) => ({
      question_num: i + 1,
      question: a.question,
      answer: a.answer,
      score: a.score,
      comment: a.comment,
      highlights: a.highlights || [],
      improvements: a.improvements || []
    })),
    strengts: [
      "技术栈匹配度高，有实战经验",
      "沟通表达清晰，逻辑思维较强",
      "对项目有深入思考"
    ],
    improvements: [
      "建议准备更多量化案例，用数据证明能力",
      "可以提前准备STAR法则的行为面试答案",
      "加强对行业趋势的了解"
    ],
    optimization_suggestions: [
      "建议在简历中增加量化成果描述，如'提升性能30%'、'服务10万用户'等",
      "准备3-5个STAR法则的行为面试故事，覆盖团队合作、冲突解决、压力应对等场景",
      "深入研究目标公司的技术栈和业务，准备2-3个能体现你价值的具体案例",
      "练习清晰简洁地表达自己的项目经验，确保在2-3分钟内讲清楚核心技术点",
      "准备一些行业趋势的见解，展现你对领域的深度思考"
    ],
    interview_review: {
      total_questions: answers.length,
      total_duration: interview.startedAt && interview.completedAt ? 
        Math.max(0, Math.round((new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000)) : 1800,
      main_topics: ["项目经验", "技术深度", "团队协作", "职业规划"],
      summary: "本次模拟面试涵盖了项目经验、技术深度等核心考察点，整体表现良好。建议在行为面试方面加强准备，多准备STAR法则的案例。"
    },
    interview_stats: {
      total_questions: answers.length,
      total_duration: interview.startedAt && interview.completedAt ? 
        Math.max(0, Math.round((new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000)) : 1800,
      avg_answer_length: Math.round(answers.reduce((sum: number, a: any) => sum + (a.answer || '').length, 0) / answers.length),
      high_score_questions: answers.filter((a: any) => a.score >= 8).length,
      low_score_questions: answers.filter((a: any) => a.score <= 5).length
    },
    final_advice: "整体表现良好，技术能力突出。建议在后续面试中多准备量化案例，并提前用STAR法则梳理行为面试答案。同时可以加强对行业趋势的了解，展现更广阔的视野。"
  };
}
