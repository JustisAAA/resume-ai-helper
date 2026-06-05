import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export interface EnterpriseRegisterData {
  email: string;
  password: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface EnterpriseLoginData {
  email: string;
  password: string;
}

export interface EnterpriseUpdateData {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
}

/**
 * 企业注册
 */
export async function registerEnterprise(data: EnterpriseRegisterData) {
  const { email, password, name, description, logo, website, industry, size, location, contactEmail, contactPhone } = data;

  // 验证输入
  if (!email || !password || !name) {
    throw new Error('邮箱、密码和企业名称不能为空');
  }

  if (password.length < 6) {
    throw new Error('密码长度至少6位');
  }

  // 检查用户是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('邮箱已被注册');
  }

  // 哈希密码
  const passwordHash = await bcrypt.hash(password, 10);

  // 创建用户和企业
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'ENTERPRISE'
    }
  });

  const enterprise = await prisma.enterprise.create({
    data: {
      userId: user.id,
      name,
      description,
      logo,
      website,
      industry,
      size,
      location,
      contactEmail,
      contactPhone
    }
  });

  // 生成 JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    message: '企业注册成功',
    enterprise: {
      id: enterprise.id,
      name: enterprise.name,
      description: enterprise.description,
      logo: enterprise.logo,
      website: enterprise.website,
      industry: enterprise.industry,
      size: enterprise.size,
      location: enterprise.location,
      contactEmail: enterprise.contactEmail,
      contactPhone: enterprise.contactPhone
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token
  };
}

/**
 * 企业登录
 */
export async function loginEnterprise(data: EnterpriseLoginData) {
  const { email, password } = data;

  // 验证输入
  if (!email || !password) {
    throw new Error('邮箱和密码不能为空');
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('邮箱或密码错误');
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('邮箱或密码错误');
  }

  // 检查是否是企业内部
  if (user.role !== 'ENTERPRISE') {
    throw new Error('该账号不是企业账号');
  }

  // 获取企业信息
  const enterprise = await prisma.enterprise.findUnique({
    where: { userId: user.id }
  });

  if (!enterprise) {
    throw new Error('企业信息不存在');
  }

  // 生成 JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    message: '登录成功',
    enterprise: {
      id: enterprise.id,
      name: enterprise.name,
      description: enterprise.description,
      logo: enterprise.logo,
      website: enterprise.website,
      industry: enterprise.industry,
      size: enterprise.size,
      location: enterprise.location,
      contactEmail: enterprise.contactEmail,
      contactPhone: enterprise.contactPhone
    },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token
  };
}

/**
 * 获取企业资料
 */
export async function getEnterpriseProfile(userId: string) {
  const enterprise = await prisma.enterprise.findUnique({
    where: { userId }
  });

  if (!enterprise) {
    throw new Error('企业信息不存在');
  }

  return enterprise;
}

/**
 * 更新企业资料
 */
export async function updateEnterpriseProfile(userId: string, data: EnterpriseUpdateData) {
  const enterprise = await prisma.enterprise.findUnique({
    where: { userId }
  });

  if (!enterprise) {
    throw new Error('企业信息不存在');
  }

  const updatedEnterprise = await prisma.enterprise.update({
    where: { userId },
    data
  });

  return updatedEnterprise;
}
