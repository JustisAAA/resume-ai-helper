/**
 * 面试路由聚合入口
 * 
 * 已拆分路由：list（列表/详情）、create（创建）
 * 待拆分路由从 interview.full.ts 导入
 */
import { Router } from 'express';
import listRouter from './list';
import createRouter from './create';
import fullRouter from '../interview.full';

const router = Router();

// 已拆分的子路由
router.use('/', listRouter);
router.use('/', createRouter);

// 尚未拆分的路由（从原文件导入）
router.use('/', fullRouter);

export default router;
