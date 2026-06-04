import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PDFParse from 'pdf-parse';
import mammoth from 'mammoth';
import axios from 'axios';

const router = Router();

// 从API错误中提取可读的错误信息（处理JSON字符串和对象两种情况）
function extractApiError(error: any, fallback: string): string {
  if (error.response?.data) {
    let data = error.response?.data;
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

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持PDF、DOC、DOCX格式'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

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

// 获取简历列表
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: '获取简历列表失败' });
  }
});

// 上传简历文件
router.post('/upload', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    // 解析文件内容
    let rawText = '';
    const filePath = file.path;
    const fileType = path.extname(file.originalname).toLowerCase();

    try {
      if (fileType === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const result = await PDFParse(dataBuffer);
        rawText = result.text;
      } else if (fileType === '.docx' || fileType === '.doc') {
        const result = await mammoth.extractRawText({ path: filePath });
        rawText = result.value;
      }
    } catch (parseError: any) {
      console.error('文件解析失败:', parseError);
      rawText = '[解析失败] ' + parseError.message;
    }

    // 创建简历记录
    const resume = await prisma.resume.create({
      data: {
        userId,
        title: title || file.originalname,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: fileType.replace('.', ''),
        rawText,
        status: 'DRAFT'
      }
    });

    res.status(201).json({
      message: '上传成功',
      resume: {
        ...resume,
        rawText: rawText.substring(0, 500) + '...' // 只返回前500字符
      }
    });
  } catch (error: any) {
    console.error('上传失败:', error);
    res.status(500).json({ error: error.message || '上传失败' });
  }
});

// 创建简历（手动创建）
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, content, rawText, fileUrl, fileType } = req.body;
    
    const resume = await prisma.resume.create({
      data: {
        userId,
        title: title || '未命名简历',
        content: content ? JSON.parse(content) : {},
        rawText: rawText || '',
        fileUrl,
        fileType,
        status: 'DRAFT'
      }
    });
    
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: '创建简历失败' });
  }
});

// 获取单个简历
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    });
    
    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: '获取简历失败' });
  }
});

// 更新简历
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { title, content, rawText, fileUrl, fileType, analysis, score, status } = req.body;
    
    // 检查简历是否存在且属于当前用户
    const existing = await prisma.resume.findFirst({
      where: { id, userId }
    });
    
    if (!existing) {
      return res.status(404).json({ error: '简历不存在' });
    }
    
    const resume = await prisma.resume.update({
      where: { id },
      data: {
        title,
        content: content ? JSON.parse(content) : undefined,
        rawText,
        fileUrl,
        fileType,
        analysis: analysis ? JSON.parse(analysis) : undefined,
        score,
        status
      }
    });
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: '更新简历失败' });
  }
});

// 删除简历
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    // 检查简历是否存在且属于当前用户
    const existing = await prisma.resume.findFirst({
      where: { id, userId }
    });
    
    if (!existing) {
      return res.status(404).json({ error: '简历不存在' });
    }
    
    await prisma.resume.delete({
      where: { id }
    });
    
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除简历失败' });
  }
});

// 简历分析接口
router.post('/:id/analyze', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    // 检查简历是否存在且属于当前用户
    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    });
    
    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }
    
    if (!resume.rawText || (resume.rawText as string).startsWith('[解析失败]')) {
      return res.status(400).json({ error: '简历内容为空或解析失败，无法分析' });
    }
    
    // 调用元器API进行简历分析与评分
    const appid = process.env.YUANQI_APPID;
    const appkey = process.env.YUANQI_APPKEY;
    if (!appid || !appkey) {
      return res.status(500).json({ error: '服务器配置错误：缺少 YUANQI_APPID 或 YUANQI_APPKEY 环境变量' });
    }

    const prompt = `请对以下简历进行全面分析和评分，并以严格 JSON 格式返回结果（不要添加任何 JSON 以外的说明文字）：

简历内容：
${(resume.rawText as string).substring(0, 5000)}

请返回以下结构的 JSON：
{
  "overall_score": 0-100 的总评分数字,
  "summary": "对简历的总体评价文本，200字左右",
  "scores": {
    "content_completeness": 0-100,
    "structure_clarity": 0-100,
    "keyword_match": 0-100,
    "language_expression": 0-100,
    "data_support": 0-100
  },
  "strengths": ["亮点1", "亮点2", "亮点3"],
  "weaknesses": ["问题1", "问题2", "问题3"],
  "suggestions": ["改进建议1", "改进建议2", "改进建议3"],
  "keyword_recommendations": ["推荐关键词1", "推荐关键词2", "推荐关键词3"]
}`;

    const response = await axios.post('https://yuanqi.tencent.com/openapi/v1/agent/chat/completions', {
      assistant_id: appid,
      user_id: userId,
      stream: false,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt }
          ]
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appkey}`
      },
      timeout: 120000
    });

    // 解析元器返回的内容
    const content = (response as any).data.choices[0].message.content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    const result = JSON.parse(jsonStr);

    // 更新简历记录
    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        analysis: {
          summary: result.summary || '',
          scores: result.scores || {},
          strengths: result.strengths || [],
          weaknesses: result.weaknesses || [],
          suggestions: result.suggestions || [],
          keyword_recommendations: result.keyword_recommendations || []
        },
        score: result.overall_score || null,
        analyzedAt: new Date(),
        status: 'ANALYZED'
      }
    });

    res.json({
      message: '分析和评分成功',
      analysis: updatedResume.analysis,
      score: result.overall_score,
      resume: updatedResume
    });
  } catch (error: any) {
    console.error('分析失败:', error);
    res.status(500).json({ error: extractApiError(error, '分析失败') });
  }
});

// 简历评分接口
router.post('/:id/score', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    // 检查简历是否存在且属于当前用户
    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    });
    
    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }
    
    if (!resume.rawText || (resume.rawText as string).startsWith('[解析失败]')) {
      return res.status(400).json({ error: '简历内容为空或解析失败，无法评分' });
    }
    
    // 调用元器API进行简历评分
    const appid = process.env.YUANQI_APPID;
    const appkey = process.env.YUANQI_APPKEY;
    if (!appid || !appkey) {
      return res.status(500).json({ error: '服务器配置错误：缺少 YUANQI_APPID 或 YUANQI_APPKEY 环境变量' });
    }
    
    const message = `请对以下简历进行评分，严格按照JSON格式输出结果。

简历内容：
${(resume.rawText as string).substring(0, 5000)}

请输出JSON，包含以下字段：
- overall_score: 综合评分(0-100)
- dimension_scores: 各维度分数对象，包含content_quality, structure_norm, keyword_match, readability四个字段(0-100)
- dimension_explanation: 各维度解释对象，包含content_quality, structure_norm, keyword_match, readability四个字段，每个字段是字符串解释为什么得这个分数
- strengths: 优势亮点数组(字符串)
- weaknesses: 不足之处数组(字符串)
- suggestions: 改进建议数组(字符串)
- benchmark: 行业对比文本
- next_steps: 下一步行动建议

严格按JSON格式输出，不要包含markdown代码块标记。`;
    
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
              text: message
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
    
    // 解析元器返回的内容
    const content = (response as any).data.choices[0].message.content;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/(\{[\s\S]*\})/);
    const jsonStr = jsonMatch ? jsonMatch[1] : content;
    const scoreResult = JSON.parse(jsonStr);
    
    // 更新简历记录
    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        score: scoreResult.overall_score || null,
        analyzedAt: new Date(),
        status: 'ANALYZED'
      }
    });
    
    res.json({
      message: '评分成功',
      score: scoreResult,
      resume: updatedResume
    });
  } catch (error: any) {
    console.error('评分失败:', error);
    res.status(500).json({ error: extractApiError(error, '评分失败') });
  }
});

// 应用模板生成简历
router.post('/:id/apply-template', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: '请提供模板ID' });
    }

    const resume = await prisma.resume.findFirst({
      where: { id, userId }
    });

    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }

    if (!resume.rawText || (resume.rawText as string).startsWith('[解析失败]')) {
      return res.status(400).json({ error: '简历内容为空或解析失败，无法生成模板简历' });
    }

    const appid = process.env.YUANQI_APPID;
    const appkey = process.env.YUANQI_APPKEY;
    if (!appid || !appkey) {
      return res.status(500).json({ error: '服务器配置错误：缺少 YUANQI_APPID 或 YUANQI_APPKEY 环境变量' });
    }

    const templateStyles: Record<string, string> = {
      minimal: '简约经典：黑白灰色系，单栏布局，适合传统行业',
      modern: '现代时尚：深蓝主色，左右分栏，适合互联网',
      business: '商务专业：深灰主色，居中标题，适合金融法律',
      creative: '创意个性：紫色渐变，不规则版面，适合设计传媒',
      simple: '极简清新：绿色点缀，大量留白，适合应届生'
    };

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
              text: '生成简历：\n模板风格：' + (templateStyles[templateId] || templateId) + '\n模板ID：' + templateId + '\n\n简历原文：\n' + (resume.rawText as string).substring(0, 3000)
            }
          ]
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + appkey
      },
      timeout: 120000
    });

    const content = (response as any).data.choices[0].message.content;
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/) || content.match(/<html[\s\S]*<\/html>/i);
    const htmlContent = htmlMatch ? (htmlMatch[1] || htmlMatch[0]) : content;

    const updatedResume = await prisma.resume.update({
      where: { id },
      data: {
        content: { templateId, html: htmlContent },
        status: 'ANALYZED'
      }
    });

    res.json({
      message: '模板应用成功',
      html: htmlContent,
      resume: updatedResume
    });
  } catch (error: any) {
    console.error('模板应用失败:', error);
    res.status(500).json({ error: extractApiError(error, '模板应用失败') });
  }
});

export default router;
