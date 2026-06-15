import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { uploadJobImage } from '../middleware/uploadMiddleware';
import { authenticateToken, requireEnterprise } from '../middleware/auth';

const router = Router();

// POST /api/upload/job-image
router.post('/job-image', authenticateToken, requireEnterprise, (req: Request, res: Response) => {
  uploadJobImage(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || '上传失败' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '未选择文件' });
    }

    const file = req.file as Express.Multer.File;

    try {
      // 将图片转为 base64，避免依赖服务器磁盘文件
      const imageBuffer = fs.readFileSync(file.path);
      const ext = path.extname(file.originalname).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml'
      };
      const mimeType = mimeTypes[ext] || 'image/png';
      const base64Url = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

      // 清理临时文件
      try { fs.unlinkSync(file.path); } catch {}

      res.json({
        message: '上传成功',
        url: base64Url,
        filename: file.filename
      });
    } catch (error: any) {
      res.status(500).json({ error: '图片处理失败' });
    }
  });
});

export default router;
