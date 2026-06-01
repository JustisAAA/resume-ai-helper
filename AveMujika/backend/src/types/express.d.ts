// Express类型扩展 - 添加自定义属性
declare namespace Express {
  interface Request {
    /** 当前登录用户ID (由auth中间件添加) */
    userId?: string;
    /** 上传的单个文件 (由multer.single()添加) */
    file?: any; // 暂时用any，multer类型较复杂
  }
}
