import rateLimit from 'express-rate-limit';

/**
 * 登录频率限制：15分钟内最多5次
 * 防止暴力破解密码
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次请求
  message: {
    error: '登录尝试次数过多，请15分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI调用频率限制：每分钟最多20次
 * 防止API被滥用，控制成本
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 20, // 最多20次请求
  message: {
    error: 'AI调用频率过高，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 通用API频率限制：每分钟最多100次
 * 防止API被滥用
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 100, // 最多100次请求
  message: {
    error: '请求频率过高，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
