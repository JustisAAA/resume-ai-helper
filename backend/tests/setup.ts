// 测试环境设置 - 简化版本，不依赖真实数据库
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'file:./test.db';

// 模拟console.log以避免测试输出混乱
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
