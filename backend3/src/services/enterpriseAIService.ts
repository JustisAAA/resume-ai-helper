import axios from 'axios';
import { getPrisma } from '../index';
import { sanitizeError } from '../utils/sanitize';

// 企业AI智能体配置
const APPID = process.env.YUANQI_ENTERPRISE_APPID || '';
const APPKEY = process.env.YUANQI_ENTERPRISE_APPKEY || '';
const API_URL = 'https://yuanqi.tencent.com/openapi/v1/agent/chat/completions';

// ---------- 类型定义 ----------

export interface ScoringConfig {
  passScore: number;
  excellentScore: number;
  scoringPoints: string[];
  criteria: string;
  keyPoints: string;
}

export interface AIAnalysisResult {
  totalScore: number;
  passed: boolean;
  verdict: '优秀' | '及格' | '不及格';
  scoringPoints: { name: string; score: number; comment: string }[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
  scoringConfig: ScoringConfig;
}

// ---------- 简历评分分析 ----------

/**
 * 调用企业AI智能体，按照HR自定义标准分析简历并打分
 */
export async function analyzeResumeWithConfig(
  resumeContent: string,
  jobTitle: string,
  config: ScoringConfig,
  userId: string
): Promise<AIAnalysisResult | null> {
  if (!APPID || !APPKEY) {
    throw new Error('企业AI智能体未配置，请在 .env 中设置 YUANQI_ENTERPRISE_APPID 和 YUANQI_ENTERPRISE_APPKEY');
  }

  const prompt = `
请按以下标准分析这份简历：

【岗位名称】${jobTitle}

【得分点】（逐一打分，0-100分）
${config.scoringPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

【评分标准说明】
${config.criteria || '（未提供详细评分标准）'}

【考察要点】
${config.keyPoints || '无特殊要点'}

【及格线】${config.passScore}分
【优秀线】${config.excellentScore}分

【简历内容】
${resumeContent}

## 重要规则
1. 如果【评分标准说明】为空或不具体，不要拒绝对话。请根据简历内容，从"与岗位的匹配度、专业技能、项目经历、教育背景、综合素质"等通用维度，结合岗位特点给每个得分点一个合理的基础评分（默认中等偏上，如60-80分），并在评分备注中说明"评分标准不明确，已按通用维度评估"。
2. 每个得分点都要给出具体的分数（0-100）和一句简短点评。
3. 总分 = 各得分点分数的加权平均（默认均权），必须在 0-100 之间。
4. 必须返回完整的JSON，包含所有字段：totalScore、passed、verdict、scoringPoints、strengths、weaknesses、summary。

请按照系统提示词中的JSON格式输出分析结果。只输出JSON，不要加任何其他文字。
`;

  try {
    const response = await axios.post(API_URL, {
      assistant_id: APPID,
      user_id: userId,
      stream: false,
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: prompt }]
        }
      ]
    }, {
      headers: {
        'X-Source': 'openapi',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APPKEY}`
      },
      timeout: 120000
    });

    const rawText = (response.data as any)?.choices?.[0]?.message?.content || '';
    const result = extractJson(rawText);

    if (!result) {
      throw new Error('AI返回格式异常，未能解析JSON');
    }

    return {
      ...result,
      scoringConfig: config, // 保存本次分析使用的评分标准
    };
  } catch (error: any) {
    console.error('企业AI分析简历失败:', sanitizeError(error));
    throw new Error(error.response?.data?.message || error.message || 'AI分析失败');
  }
}

/**
 * 将 applicationId 的简历发送给AI分析，结果存到 aiAnalysis 字段
 */
export async function analyzeApplicationResume(
  applicationId: string,
  config: ScoringConfig,
  enterpriseUserId: string
) {
  const app = await getPrisma().application.findUnique({
    where: { id: applicationId },
    include: {
      resume: true,
      job: true,
      user: true
    }
  });

  if (!app) throw new Error('申请不存在');
  if (!app.resume) throw new Error('该申请没有关联简历');

  // 提取简历文本
  const resumeText = app.resume.rawText
    || (typeof app.resume.content === 'string' ? app.resume.content : JSON.stringify(app.resume.content))
    || '';

  if (!resumeText || resumeText.trim() === '') {
    throw new Error('简历内容为空，无法分析');
  }

  const result = await analyzeResumeWithConfig(
    resumeText,
    app.job.title,
    config,
    enterpriseUserId
  );

  if (!result) throw new Error('AI分析未返回结果');

  // 存入数据库
  await getPrisma().application.update({
    where: { id: applicationId },
    data: { aiAnalysis: result as any }
  });

  return result;
}


// ---------- 工具函数 ----------

function extractJson(text: string): any {
  if (!text) return null;

  // 先去掉可能的 markdown 代码块标记
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // 找第一个 { 到最后一个 }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || start >= end) {
    // 可能整个文本就是 JSON
    try { return JSON.parse(cleaned); } catch { return null; }
  }

  const jsonStr = cleaned.substring(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}
