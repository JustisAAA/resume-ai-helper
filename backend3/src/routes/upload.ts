import { Router, Request, Response } from 'express';
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
    const url = `/uploads/jobs/${file.filename}`;

    res.json({
      message: '上传成功',
      url,
      filename: file.filename
    });
  });
});

export default router;
