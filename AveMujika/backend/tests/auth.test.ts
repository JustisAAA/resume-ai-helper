import request from 'supertest';
import express from 'express';

// 创建mock函数
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
    },
    $disconnect: jest.fn(),
  })),
}));

// Mock src/index
jest.mock('../src/index', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
    },
  },
}));

describe('认证API测试', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    const authRoutes = require('../src/routes/auth').default;
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/register', () => {
    test('应该成功注册新用户', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Test User',
        role: 'USER',
      };
      
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('注册成功');
    });

    test('应该拒绝已存在的邮箱', async () => {
      mockFindUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
        
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('邮箱已被注册');
    });
  });
});
