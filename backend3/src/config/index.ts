import dotenv from 'dotenv';
dotenv.config();

/**
 * 应用配置集中管理
 * 
 * 统一管理环境变量、默认值、常量，消除重复配置代码
 */

// ===== JWT 认证配置 =====
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('【致命错误】JWT_SECRET 环境变量未设置，服务拒绝启动');
}

export const JWT_SECRET = jwtSecret;
export const JWT_EXPIRES_IN = '7d' as const;

// ===== 密码哈希配置 =====
export const BCRYPT_SALT_ROUNDS = 10;

// ===== 分页配置 =====
export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

// ===== 文件上传限制 =====
export const UPLOAD_LIMITS = {
  avatar: 2 * 1024 * 1024,      // 2MB
  jobImage: 5 * 1024 * 1024,     // 5MB
  resume: 10 * 1024 * 1024,      // 10MB
  logo: 2 * 1024 * 1024,         // 2MB
} as const;

// ===== 密码策略 =====
export const PASSWORD_MIN_LENGTH = 8;

// ===== 腾讯元器 API =====
export const YUANQI_CONFIG = {
  baseURL: process.env.YUANQI_BASE_URL || 'https://yuanqi.tencent.com/openapi/v1',
  appId: process.env.YUANQI_APPID || '',
  appKey: process.env.YUANQI_APPKEY || '',
  enterpriseAppId: process.env.YUANQI_ENTERPRISE_APPID || '',
  enterpriseAppKey: process.env.YUANQI_ENTERPRISE_APPKEY || '',
};

// ===== 硅基流动 API（备用） =====
export const SILICONFLOW_CONFIG = {
  apiKey: process.env.SILICONFLOW_API_KEY || '',
  baseURL: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
};

// ===== 模拟模式 =====
export const isMockMode = () => process.env.MOCK_MODE === 'true';
