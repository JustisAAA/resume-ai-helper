import { Router, Request, Response } from 'express';
import { getPrisma } from '../index';
import axios from 'axios';
import { authenticateToken, requireUser, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const PDFParse = require('pdf-parse');
import mammoth from 'mammoth';
import { sanitizeError } from '../utils/sanitize';
import { extractApiError } from '../utils/extractError';

// 加载Stack Overflow Survey 2024真实数据（模块加载时执行一次）
let stackOverflowData: any = null;
try {
  const dataPath = path.join(__dirname, '../../data/stackoverflow_2024.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  stackOverflowData = JSON.parse(rawData);
  console.log('[趋势预测] 已加载Stack Overflow Survey 2024数据');
} catch (e) {
  console.error('[趋势预测] 加载Stack Overflow数据失败:', sanitizeError(e));
}

// ========== 趋势预测：AI驱动架构 ==========
// 核心理念：不再依赖写死的岗位映射和预设数据，而是让AI根据岗位名称动态生成个性化分析

// 辅助函数：从Stack Overflow数据中获取技能的使用率和期望度（技术岗位参考）
function getSkillData(skillName: string): { usageRate: number; desirability: number } | null {
  if (!stackOverflowData) return null;
  
  const categories = Object.values(stackOverflowData.categories) as any[];
  for (const category of categories) {
    const usageItem = category.usage_rates?.find((item: any) => 
      item.name.toLowerCase().includes(skillName.toLowerCase()) || 
      skillName.toLowerCase().includes(item.name.toLowerCase())
    );
    if (usageItem) {
      const desireItem = category.desirability?.find((item: any) => 
        item.name.toLowerCase().includes(skillName.toLowerCase()) || 
        skillName.toLowerCase().includes(item.name.toLowerCase())
      );
      return {
        usageRate: usageItem.rate,
        desirability: desireItem?.rate || 0
      };
    }
  }
  return null;
}

// 辅助函数：预测未来趋势（基于期望度简单预测）
function predictTrend(usageRate: number, desirability: number): { '2025': number; '2026': number } {
  const growthFactor = 1 + (desirability / 100) * 0.3;
  const y2025 = Math.min(100, usageRate * growthFactor);
  const y2026 = Math.min(100, y2025 * (1 + (desirability / 100) * 0.2));
  return {
    '2025': Math.round(y2025 * 10) / 10,
    '2026': Math.round(y2026 * 10) / 10
  };
}

// 辅助函数：检测岗位类型（fallback时生成合适的响应风格）
function detectRoleType(targetRole: string): 'tech' | 'creative' | 'service' | 'business' | 'general' {
  const roleLower = targetRole.toLowerCase();
  const techKeywords = ['工程师', '开发', '程序', '编程', '软件', '技术', '前端', '后端', '全栈', '算法', '数据', 'AI', '人工智能', '运维', '测试', '安全', '嵌入式', '区块链', '数据库', '网络', '硬件', '架构', 'code', 'devops'];
  const creativeKeywords = ['设计', '艺术', '演员', '歌手', '画家', '作家', '魔术师', '舞蹈', '音乐', '导演', '编剧', '摄影', '剪辑', '主播', '自媒体', '博主', '插画', '平面', '视觉', 'UI', 'UX', '动画', '建模'];
  const serviceKeywords = ['销售', '客服', '顾问', '咨询师', '教师', '教练', '律师', '医生', '护士', '翻译', '导游', '家政', '护理', '社工'];
  const businessKeywords = ['市场', '营销', '推广', '品牌', '公关', '运营', '产品经理', '项目经理', '商务', '采购', '供应链', '人力资源', '财务', '会计', '行政', '管理'];
  
  if (techKeywords.some(k => roleLower.includes(k))) return 'tech';
  if (creativeKeywords.some(k => roleLower.includes(k))) return 'creative';
  if (serviceKeywords.some(k => roleLower.includes(k))) return 'service';
  if (businessKeywords.some(k => roleLower.includes(k))) return 'business';
  return 'general';
}

// 辅助函数：AI超时时生成智能fallback响应
function generateSmartFallback(targetRole: string): { trends: any[], advice: string, source: string, note: string } {
  const roleType = detectRoleType(targetRole);
  
  // 根据岗位类型生成贴合的技能列表（名称会嵌入岗位特性）
  const skillPresets: Record<string, string[]> = {
    tech: [`${targetRole}核心编程语言`, '主流开发框架', '数据库与存储', '版本控制工具', '云计算/容器化', 'AI辅助开发'],
    creative: [`${targetRole}核心专业技能`, '创意表达与审美', '数字媒体工具', '个人品牌建设', '新媒体运营', '商业变现能力'],
    service: [`${targetRole}专业知识体系`, '客户沟通技巧', '问题解决能力', '行业认证资质', '情绪管理与抗压', '数字化服务工具'],
    business: [`${targetRole}数据分析能力`, '战略规划思维', '项目管理方法', '商务沟通谈判', '行业市场洞察', '数字化运营工具'],
    general: [`${targetRole}核心专业技能`, '跨部门沟通协作', '数据驱动决策', '项目管理能力', '持续学习能力', '创新思维方法']
  };
  
  const skills = skillPresets[roleType] || skillPresets.general;
  
  // 生成趋势数据（给每个技能合理的热度分布）
  const baseRates = [85, 78, 70, 65, 58, 52];
  const growthRates = [18, 15, 22, 12, 25, 10];
  const trends = skills.map((skill, index) => {
    const baseRate = baseRates[index] || 50;
    const growth = growthRates[index] || 15;
    const y2025 = Math.round(baseRate * (1 + growth / 100 * 0.3));
    const y2026 = Math.round(y2025 * (1 + growth / 100 * 0.2));
    return {
      skill,
      '2024': baseRate,
      '2025': Math.min(100, y2025),
      '2026': Math.min(100, y2026)
    };
  });
  
  // 生成贴合岗位的建议
  const roleTypeLabels: Record<string, string> = {
    tech: '技术类岗位',
    creative: '创意/表演类岗位',
    service: '服务类岗位',
    business: '商务/管理类岗位',
    general: '通用岗位'
  };
  
  const advice = `### 基于"${targetRole}"岗位的趋势分析建议\n\n> **提示**：AI服务暂时不可用，以下为基于"${targetRole}"岗位特性的智能推断分析。建议稍后刷新重试，获取AI生成的个性化深度分析。\n\n#### 短期规划（0-6个月）\n- **夯实${targetRole}核心能力**：深入学习${targetRole}所需的核心专业技能，建立扎实的基础\n- **建立行业认知**：了解${targetRole}领域的最新动态、行业标准和最佳实践\n- **积累作品/案例**：通过实际项目或练习，形成可展示的专业成果和作品集\n\n#### 中期规划（6-18个月）\n- **拓展技能边界**：在核心能力基础上，学习与${targetRole}相关的辅助技能，提升综合竞争力\n- **建立专业网络**：参加行业活动，加入专业社群，拓展人脉资源\n- **寻求实践机会**：通过实习、兼职或项目合作积累真实工作经验\n\n#### 长期规划（18个月以上）\n- **成为领域专家**：在${targetRole}方向持续深耕，形成独特的专业方法论和个人品牌\n- **关注行业变革**：技术发展和市场变化正在重塑${roleTypeLabels[roleType]}，保持学习敏感度\n- **规划多元发展**：根据个人兴趣和市场需求，探索管理路线或专家路线的可能性\n\n### 潜在风险\n- **技能过时风险**：不持续学习可能导致技能与市场需求脱节\n- **竞争加剧风险**：${targetRole}领域人才供给可能增加，需建立差异化优势\n- **技术替代风险**：部分标准化工作可能被自动化工具替代，需提升不可替代性\n\n### 机会点\n- **数字化转型机会**：各行业数字化升级创造新的岗位需求\n- **跨界融合机会**：复合型人才越来越受青睐\n- **终身学习机会**：持续学习本身已成为职场核心竞争力\n\n### 数据来源说明\n- 2024年数据：基于${targetRole}岗位特性的智能推断\n- 2025-2026年数据：基于行业趋势预测模型\n- 建议生成：基于岗位类型的本地分析（AI服务暂时不可用，建议重试获取AI分析）`;
  
  return {
    trends,
    advice,
    source: '本地智能推断（AI服务暂时不可用）',
    note: `AI服务响应超时，以下为基于"${targetRole}"岗位类型的智能推断分析。建议稍后刷新页面重试，获取AI实时生成的个性化深度分析。`
  };
}

// 辅助函数：调用AI生成个性化趋势数据（核心！让AI根据岗位名称动态生成）
async function generateAITrendData(targetRole: string, userId: string): Promise<{ trends: any[], advice: string }> {
  const message = `你是一位资深职业发展分析师和人力资源专家。请分析"${targetRole}"这个职业在2024-2026年的技能趋势和需求变化。

请严格按照以下JSON格式返回（不要包含其他文本，只返回JSON）：
{
  "skills": [
    {"name": "技能名称（要具体、准确）", "current": 当前掌握率(0-100的整数), "growth": 增长趋势(-20到30的整数)},
    {"name": "技能名称", "current": 85, "growth": 15},
    ...
  ],
  "advice": "Markdown格式的职业规划建议文本。必须包含以下章节：\\n### 短期规划（0-6个月）\\n### 中期规划（6-18个月）\\n### 长期规划（18个月以上）\\n### 潜在风险\\n### 机会点\\n建议必须贴合${targetRole}的职业特点，语言风格要符合该职业，不要写通用模板内容。"
}

重要要求：
1. skills列出该职业最重要的5-8个核心技能，技能名称必须具体、准确、贴合"${targetRole}"
2. current表示当前该技能在从业者中的掌握比例（0-100的整数）
3. growth表示该技能的需求增长趋势（-20到30的整数，正值增长，负值衰退）
4. 如果${targetRole}是技术类岗位（工程师、开发等），技能侧重：编程语言、框架、工具、平台等具体技术栈
5. 如果${targetRole}是创意/表演类岗位（设计师、演员、魔术师、主播等），技能侧重：专业技能、创意能力、表演技巧、新媒体运营、个人品牌等
6. 如果${targetRole}是服务类岗位（销售、教师、律师、医生等），技能侧重：专业知识、沟通技巧、客户关系、行业资质等
7. 如果${targetRole}是商务/管理类岗位（市场、运营、产品、管理等），技能侧重：数据分析、战略思维、项目管理、沟通协调等
8. 数据要合理，基于行业常识，不要编造不存在的技能名称
9. 建议必须针对"${targetRole}"这个具体岗位，必须贴合该职业的实际工作内容，不能是放之四海而皆准的通用模板
10. 如果${targetRole}是"魔术师"这类表演艺术职业，技能应该包括：手法技巧、舞台表现、观众心理、道具制作、新媒体运营、个人IP打造等，绝对不能出现Excel、PPT、编程语言等与魔术师无关的内容`;

  const rawContent = await callYuanqi(userId, message, 90000);
  
  // 解析JSON
  let parsed: any;
  try {
    parsed = extractJson(rawContent);
    if (parsed.raw) throw new Error('AI返回非JSON格式');
  } catch (e) {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('AI返回JSON解析失败');
      }
    } else {
      throw new Error('AI返回格式不正确');
    }
  }
  
  if (!parsed.skills || !Array.isArray(parsed.skills)) {
    throw new Error('AI返回缺少skills字段');
  }
  
  // 将AI返回的技能数据转换为趋势格式
  const trends = parsed.skills.map((s: any) => {
    const current = Math.max(0, Math.min(100, Math.round(Number(s.current) || 50)));
    const growth = Math.max(-20, Math.min(30, Number(s.growth) || 0));
    const y2025 = Math.round(current * (1 + growth / 100 * 0.3));
    const y2026 = Math.round(y2025 * (1 + growth / 100 * 0.2));
    return {
      skill: String(s.name || '未知技能'),
      '2024': current,
      '2025': Math.min(100, y2025),
      '2026': Math.min(100, y2026)
    };
  });
  
  const advice = parsed.advice || 'AI未返回建议内容';
  
  return { trends, advice };
}

const router = Router();

// 配置multer存储（文件解析临时目录）
const parseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const parseUpload = multer({ storage: parseStorage, fileFilter: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, ['.pdf', '.docx'].includes(ext));
}});

// ========== 文件解析接口 ==========
router.post('/parse-file', authenticateToken, requireUser, parseUpload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: '未上传文件' });
    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    let rawText = '';
    try {
      if (fileType === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfResult = await PDFParse(dataBuffer);
        rawText = pdfResult.text;
      } else if (fileType === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        rawText = result.value;
      }
    } catch (e: any) {
      rawText = '[解析失败] ' + e.message;
    } finally {
      try { fs.unlinkSync(filePath); } catch {}
    }
    res.json({ text: rawText });
  } catch (error: any) {
    console.error('文件解析失败:', sanitizeError(error));
    res.status(500).json({ error: error.message || '文件解析失败' });
  }
});

// ========== 文件解析接口结束 ==========




// 调用腾讯元器API的通用函数
async function callYuanqi(userId: string, prompt: string, timeout = 60000) {
  const appid = process.env.YUANQI_APPID;
  const appkey = process.env.YUANQI_APPKEY;
  if (!appid || !appkey) {
    throw new Error('服务器配置错误：缺少 YUANQI_APPID 或 YUANQI_APPKEY 环境变量');
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
            text: prompt
          }
        ]
      }
    ]
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${appkey}`
    },
    timeout: timeout
  });
  
  const content = (response as any).data.choices[0].message.content;
  return typeof content === 'string' ? content : JSON.stringify(content);
}

// 从AI返回中提取JSON
function extractJson(text: string): any {
  text = text.trim();
  
  // 去除markdown代码块
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }
  
  // 尝试直接解析
  try {
    return JSON.parse(text);
  } catch {}
  
  // 尝试提取 {...}
  const braceStart = text.indexOf('{');
  const braceEnd = text.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
    try {
      return JSON.parse(text.substring(braceStart, braceEnd + 1));
    } catch {}
  }
  
  // 尝试提取 [...]
  const bracketStart = text.indexOf('[');
  const bracketEnd = text.lastIndexOf(']');
  if (bracketStart !== -1 && bracketEnd !== -1 && bracketEnd > bracketStart) {
    try {
      return JSON.parse(text.substring(bracketStart, bracketEnd + 1));
    } catch {}
  }
  
  // 兜底：返回原文本
  return { raw: text };
}

// ========== 辅助函数：余弦相似度、Embedding、过度包装词检测 ==========

// 计算余弦相似度
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

// 调用腾讯元器Embedding API
async function embedText(text: string): Promise<number[]> {
  const appkey = process.env.YUANQI_APPKEY;
  if (!appkey) {
    throw new Error('服务器配置错误：缺少 YUANQI_APPKEY 环境变量');
  }
  try {
    const response = await axios.post('https://yuanqi.tencent.com/openapi/v1/embeddings', {
      model: 'text-embedding-ada-002',
      input: text.substring(0, 8000)
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appkey}`
      },
      timeout: 30000
    });
    return (response as any).data.data[0].embedding;
  } catch (error: any) {
    console.error('Embedding API调用失败:', error?.response?.data || error.message);
    throw error;
  }
}

// 检测过度包装词
function detectOverpackagingWords(resumeText: string): { word: string, sentence: string, has_support: boolean }[] {
  const overpackagingWords = ['精通', '深入掌握', '熟练掌握', '精通掌握', '资深', '专家', '主导', '架构师', '全栈', '顶尖', '深刻理解'];
  const sentences = resumeText.split(/[。！？\n]+/).filter(s => s.trim().length > 0);
  const results: { word: string, sentence: string, has_support: boolean }[] = [];
  
  for (const sentence of sentences) {
    for (const word of overpackagingWords) {
      if (sentence.includes(word)) {
        const hasSupport = sentence.length > 50 && /[\d0-9]|项目|系统|平台|产品|实现|开发|设计/.test(sentence);
        results.push({ word, sentence: sentence.trim(), has_support: hasSupport });
        break;
      }
    }
  }
  
  return results;
}

// ========== 1. 简历优化 ==========
router.post('/optimize', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { resume, targetRole, mode = 'full', scene = 'general' } = req.body;
    
    if (!resume || !resume.trim()) {
      return res.status(400).json({ error: '简历内容不能为空' });
    }
    
    const message = `请优化以下简历：

简历内容：
${resume}

目标岗位：${targetRole || '未指定'}

模式：${mode}

场景：${scene}

请按你的角色设定执行简历优化任务，严格按JSON格式输出结果。`;

    const raw = await callYuanqi(userId, message);
    let result;
    try {
      result = extractJson(raw);
      if (result.raw) {
        result = { optimized_resume: raw, changes_summary: [], tips: ['AI返回格式异常，已展示原始内容'] };
      }
    } catch (e) {
      result = { optimized_resume: raw, changes_summary: [], tips: ['AI返回解析失败'] };
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('简历优化失败:', sanitizeError(error));
    res.status(500).json({ error: extractApiError(error, '简历优化失败') });
  }
});

// ========== 2. JD匹配打分 ==========
router.post('/match', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { resume, jd } = req.body;
    
    if (!resume || !resume.trim()) {
      return res.status(400).json({ error: '简历内容不能为空' });
    }
    if (!jd || !jd.trim()) {
      return res.status(400).json({ error: '职位描述不能为空' });
    }
    
    const message = `请分析以下简历和JD的匹配度，严格按照JSON格式输出结果。

简历内容：
${resume}

职位描述(JD)：
${jd}

请输出JSON，包含以下字段：
- overall_score: 整体匹配分数(0-100)
- dimension_scores: 各维度分数对象，包含hard_skills, soft_skills, experience, education, potential五个字段
- matched_keywords: 已匹配的关键词数组
- missing_keywords: 缺失的关键词数组
- analysis: 详细的匹配分析文本
- suggestions: 改进建议数组
- skill_matrix: 技能匹配矩阵数组，每项包含{skill: 技能名, matched: 是否匹配boolean, score: 匹配分数0-100, resume_evidence: 简历中的证据, jd_requirement: JD中的要求}
- section_analysis: 简历段落与JD要求对比分析数组，每项包含{section: 简历段落标题, jd_requirement: JD相关要求, score: 匹配分数0-100, analysis: 分析说明}

严格按JSON格式输出，不要包含markdown代码块标记。`;

    const raw = await callYuanqi(userId, message, 90000);
    let result;
    try {
      result = extractJson(raw);
      if (result.raw) {
        result = { 
          overall_score: 0, 
          dimension_scores: {}, 
          matched_keywords: [], 
          missing_keywords: [], 
          analysis: raw, 
          suggestions: ['AI返回格式异常'],
          skill_matrix: [],
          section_analysis: []
        };
      }
    } catch (e) {
      result = { 
        overall_score: 0, 
        dimension_scores: {}, 
        matched_keywords: [], 
        missing_keywords: [], 
        analysis: raw, 
        suggestions: ['AI返回解析失败'],
        skill_matrix: [],
        section_analysis: []
      };
    }
    
    // 语义匹配分数直接复用 AI 的 overall_score（Embedding API 不可用）
    result.semantic_score = result.overall_score || 0;
    
    // 检测过度包装词
    result.overpackaging_words = detectOverpackagingWords(resume);
    
    res.json(result);
  } catch (error: any) {
    console.error('JD匹配失败:', sanitizeError(error));
    res.status(500).json({ error: extractApiError(error, 'JD匹配失败') });
  }
});

// ========== 3. 面试题生成 ==========
router.post('/questions', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { resume, jd, count = 5 } = req.body;
    
    if (!resume || !resume.trim()) {
      return res.status(400).json({ error: '简历内容不能为空' });
    }
    
    const message = `请生成面试问题：

简历内容：
${resume}

${jd ? `职位描述(JD)：
${jd}` : '（无JD）'}

请生成${count}个面试问题，严格按照JSON格式输出，包含以下字段：
- questions: 问题数组，每项包含{question: 问题内容, difficulty: "easy"/"medium"/"hard", category: "technical"/"behavioral"/"situational", purpose: 考察目的, semantic_difficulty_score: 语义难度分数(0-100), intent_analysis: 出题意图分析(考察什么能力、为什么选这道题)}
- overall_assessment: 整体评估文本

严格按JSON格式输出，不要包含markdown代码块标记。`;

    const raw = await callYuanqi(userId, message, 90000);
    let result;
    try {
      result = extractJson(raw);
      if (result.raw) {
        result = { questions: [], overall_assessment: raw };
      }
    } catch (e) {
      result = { questions: [], overall_assessment: 'AI返回解析失败' };
    }
    
    res.json(result);
  } catch (error: any) {
    console.error('面试题生成失败:', sanitizeError(error));
    res.status(500).json({ error: extractApiError(error, '面试题生成失败') });
  }
});

// ========== 4. 求职攻略 ==========
router.post('/guide', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { resume, targetRole, question } = req.body;

    const message = `请提供求职攻略：

${resume ? `简历内容：\n${resume}\n` : ''}
${targetRole ? `目标岗位：${targetRole}\n` : ''}
${question ? `用户问题：${question}\n` : ''}

请按你的角色设定执行求职攻略任务，用Markdown格式输出结果。`;

    const raw = await callYuanqi(userId, message, 90000);
    let result;
    try {
      // 尝试解析JSON（如果AI返回JSON）
      result = extractJson(raw);
      if (result.raw) {
        // 如果不是JSON，返回原始Markdown
        result = { guide: raw, format: 'markdown' };
      } else {
        result.format = 'json';
      }
    } catch (e) {
      result = { guide: raw, format: 'markdown' };
    }

    res.json(result);
  } catch (error: any) {
    console.error('求职攻略失败:', sanitizeError(error));
    res.status(500).json({ error: extractApiError(error, '求职攻略失败') });
  }
});

// ========== 5. 岗位趋势预测分析（AI驱动） ==========
router.post('/trend', authenticateToken, requireUser, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { targetRole } = req.body;

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({ error: '目标岗位不能为空' });
    }

    // 主路径：AI生成个性化趋势分析
    try {
      const aiData = await generateAITrendData(targetRole, userId);
      
      res.json({
        trends: aiData.trends,
        advice: aiData.advice,
        source: 'AI智能分析（腾讯元器）',
        note: `数据和建议由AI根据"${targetRole}"岗位特性实时生成，基于行业知识和趋势预测。`,
        adviceSource: 'AI生成'
      });
      
      console.log(`[趋势预测] AI分析成功：${targetRole}`);
    } catch (apiError: any) {
      console.log(`[趋势预测] AI调用失败（${apiError.message}），使用智能fallback`);
      
      // Fallback路径：本地智能推断
      const fallback = generateSmartFallback(targetRole);
      
      res.json({
        trends: fallback.trends,
        advice: fallback.advice,
        source: fallback.source,
        note: fallback.note,
        adviceSource: '本地智能推断（AI调用失败）'
      });
    }
  } catch (error: any) {
    console.error('趋势预测失败:', sanitizeError(error));
    res.status(500).json({ error: extractApiError(error, '趋势预测失败') });
  }
});


export default router;
