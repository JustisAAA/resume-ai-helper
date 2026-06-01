import request from 'supertest';
import express from 'express';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    interview: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Mock src/index
jest.mock('../src/index', () => ({
  prisma: {
    interview: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('面试API测试', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    const interviewRoutes = require('../src/routes/interview').default;
    app.use('/api/interviews', interviewRoutes);
  });

  describe('GET /api/interviews', () => {
    test('应该拒绝未认证请求', async () => {
      const response = await request(app)
        .get('/api/interviews')
        .send({});
        
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/interviews', () => {
    test('应该拒绝未认证请求', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({ title: '测试面试' });
        
      expect(response.status).toBe(401);
    });
  });
});
