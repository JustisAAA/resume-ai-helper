import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  createApplication,
  updateApplicationStatus,
  getApplicationResume,
  getApplicationById
} from '../services/applicationService';
import { authenticateToken, requireEnterprise, AuthRequest } from '../middleware/auth';
import { ApplicationStatus } from '@prisma/client';
import { getPrisma } from '../index';
import { sanitizeError } from '../utils/sanitize';
import { fixFilename } from '../utils/filename';

const router = Router();
const PDFParse = require('pdf-parse');
import mammoth from 'mammoth';

// 申请文件上传配置
const appStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/temp');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const appUpload = multer({ storage: appStorage, fileFilter: (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, ['.pdf', '.docx', '.doc', '.txt'].includes(ext));
}});

/**
 * 提交申请
 * POST /api/applications
 * 
 * 请求体：
 * - jobId: 职位ID
 * - coverLetter: 求职信
 * - resumeId: 可选，关联已上传简历
 * 
 * 权限：已登录用户（求职者）
 */
router.post('/', authenticateToken, appUpload.single('resume'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { jobId, coverLetter, resumeId: existingResumeId } = req.body;
    const file = req.file;

    if (!jobId) {
      return res.status(400).json({ error: '缺少 jobId' });
    }
    if (!coverLetter || !coverLetter.trim()) {
      return res.status(400).json({ error: '求职信不能为空' });
    }

    let finalResumeId = existingResumeId || undefined;

    // 如果有上传文件，解析并创建简历记录
    if (file) {
      let rawText = '';
      const filePath = file.path;
      const fileType = path.extname(file.originalname).toLowerCase();

      try {
        if (fileType === '.pdf') {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfResult = await PDFParse(dataBuffer);
          rawText = pdfResult.text;
        } else if (fileType === '.docx') {
          const result = await mammoth.extractRawText({ path: filePath });
          rawText = result.value;
        } else if (fileType === '.txt') {
          rawText = fs.readFileSync(filePath, 'utf-8');
        }
      } catch (e: any) {
        console.error('申请简历解析失败:', sanitizeError(e));
        rawText = '[解析失败] ' + e.message;
      }

      // 读原文件为 base64 以便下载
      let fileBase64 = '';
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType: Record<string, string> = { '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.doc': 'application/msword', '.txt': 'text/plain' };
        fileBase64 = `data:${mimeType[fileType] || 'application/octet-stream'};base64,${fileBuffer.toString('base64')}`;
      } catch {}
      try { fs.unlinkSync(filePath); } catch {}

      const fixedName = fixFilename(file.originalname);

      // 创建简历记录
      const newResume = await getPrisma().resume.create({
        data: {
          userId,
          title: fixedName || '申请简历',
          fileName: fixedName,
          fileUrl: fileBase64,
          rawText,
          content: { source: 'application_upload' },
          status: 'ANALYZED',
        }
      });
      finalResumeId = newResume.id;
    }

    const application = await createApplication(userId, jobId, coverLetter.trim(), finalResumeId);
    res.status(201).json({ message: '申请提交成功', application });
  } catch (error: any) {
    console.error('创建申请错误:', sanitizeError(error));
    if (error.message === '职位不存在' || error.message === '该职位已关闭' || error.message === '你已经申请过该职位') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || '提交申请失败' });
  }
});

/**
 * 更新申请状态
 * PATCH /api/applications/:id/status
 * 
 * 请求体：
 * - status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED'
 * 
 * 权限：企业用户，只能修改自己职位收到的申请
 */
router.patch('/:id/status', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status } = req.body;

    // 参数校验
    if (!status || !['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        error: '参数校验失败',
        details: [{ field: 'status', message: '状态值无效，必须是 PENDING、REVIEWING、ACCEPTED 或 REJECTED' }]
      });
    }

    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 更新申请状态
    const application = await updateApplicationStatus(
      id,
      enterprise.id,
      status as ApplicationStatus
    );

    res.json({
      message: '申请状态更新成功',
      application
    });
  } catch (error: any) {
    console.error('更新申请状态错误:', sanitizeError(error));

    // 根据错误信息返回相应的状态码
    if (error.message === '申请不存在') {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(400).json({ error: error.message || '更新申请状态失败' });
  }
});

/**
 * 查看申请简历详情
 * GET /api/applications/:id/resume
 * 
 * 权限：企业用户，只能查看自己职位收到的申请的简历
 */
router.get('/:id/resume', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 获取简历详情
    const resume = await getApplicationResume(id, enterprise.id);

    res.json({
      message: '获取简历详情成功',
      resume
    });
  } catch (error: any) {
    console.error('获取申请简历错误:', sanitizeError(error));

    // 根据错误信息返回相应的状态码
    if (error.message === '申请不存在' || error.message === '该申请没有关联的简历') {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || '获取申请简历失败' });
  }
});

/**
 * 获取当前用户的申请列表（求职者端）
 * GET /api/applications/me
 * 
 * 权限：已登录用户，查看自己的申请
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      getPrisma().application.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              enterprise: {
                select: { id: true, name: true }
              }
            }
          },
          resume: {
            select: { id: true, title: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      getPrisma().application.count({ where: { userId } })
    ]);

    res.json({
      message: '获取申请列表成功',
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('获取申请列表错误:', sanitizeError(error));
    res.status(500).json({ error: error.message || '获取申请列表失败' });
  }
});

/**
 * 获取申请详情
 * GET /api/applications/:id
 * 
 * 权限：企业用户，只能查看自己职位收到的申请
 */
router.get('/:id', authenticateToken, requireEnterprise, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // 获取企业ID
    const enterprise = await getPrisma().enterprise.findUnique({
      where: { userId }
    });

    if (!enterprise) {
      return res.status(404).json({ error: '企业信息不存在' });
    }

    // 获取申请详情
    const application = await getApplicationById(id, enterprise.id);

    res.json({
      message: '获取申请详情成功',
      application
    });
  } catch (error: any) {
    console.error('获取申请详情错误:', sanitizeError(error));

    // 根据错误信息返回相应的状态码
    if (error.message === '申请不存在') {
      return res.status(404).json({ error: error.message });
    } else if (error.message.includes('权限不足')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: error.message || '获取申请详情失败' });
  }
});

export default router;
