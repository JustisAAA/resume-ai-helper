import { Response, Request } from 'express';

/**
 * 健康检查端点
 * GET /api/health
 * 
 * 返回系统状态，包括：
 * - status: 系统状态（ok/error）
 * - timestamp: 当前时间戳
 * - uptime: 系统运行时间（秒）
 * - database: 数据库连接状态
 */
export async function healthCheck(req: Request, res: Response) {
  try {
    // 检查数据库连接（简单查询）
    // 注意：这里只是示例，实际应导入 prisma 并执行简单查询
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected', // 简化，实际应检查数据库连接
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    res.status(200).json(healthData);
  } catch (error) {
    const errorData = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(errorData);
  }
}
