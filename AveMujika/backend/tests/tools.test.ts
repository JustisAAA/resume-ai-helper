import request from 'supertest';
import express from 'express';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $disconnect: jest.fn(),
  })),
}));

// Mock src/index
jest.mock('../src/index', () => ({
  prisma: {},
}));

describe('工具API测试', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    const toolsRoutes = require('../src/routes/tools').default;
    app.use('/api/tools', toolsRoutes);
  });

  describe('POST /api/tools/optimize', () => {
    test('应该拒绝未认证请求', async () => {
      const response = await request(app)
        .post('/api/tools/optimize')
        .send({ content: '测试内容' });
        
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/tools/match', () => {
    test('应该拒绝未认证请求', async () => {
      const response = await request(app)
        .post('/api/tools/match')
        .send({ resumeText: '测试简历', jobDesc: '测试岗位' });
        
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/tools/trend', () => {
    test('应该拒绝未认证请求', async () => {
      const response = await request(app)
        .post('/api/tools/trend')
        .send({ targetRole: '前端开发' });
        
      expect(response.status).toBe(401);
    });
  });
});
