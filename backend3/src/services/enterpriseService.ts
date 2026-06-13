import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPrisma } from '../index';
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from '../config';

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
  const existingUser = await getPrisma().user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error('邮箱已被注册');
  }

  // 哈希密码
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  // 创建用户和企业（事务保护）
  const { user, enterprise } = await getPrisma().$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'ENTERPRISE'
      }
    });

    const enterprise = await tx.enterprise.create({
      data: {
        userId: user.id,
        ownerId: user.id,
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

    return { user, enterprise };
  });

  // 生成 JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
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
  const user = await getPrisma().user.findUnique({
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
  const enterprise = await getPrisma().enterprise.findUnique({
    where: { userId: user.id }
  });

  if (!enterprise) {
    throw new Error('企业信息不存在');
  }

  // 生成 JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
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
  const enterprise = await getPrisma().enterprise.findUnique({
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
  const enterprise = await getPrisma().enterprise.findUnique({
    where: { userId }
  });

  if (!enterprise) {
    throw new Error('企业信息不存在');
  }

  const updatedEnterprise = await getPrisma().enterprise.update({
    where: { userId },
    data
  });

  return updatedEnterprise;
}

/**
 * 获取企业Dashboard统计数据
 * 返回：招聘漏斗、申请趋势、职位热度
 */
export async function getDashboardStats(enterpriseId: string) {
  // 1. 招聘漏斗：职位数、申请数、面试数、录用数
  const jobs = await getPrisma().job.findMany({
    where: { enterpriseId },
    include: { applications: true }
  });

  const jobIds = jobs.map(j => j.id);
  
  // 申请总数
  const totalApplications = jobs.reduce((sum, j) => sum + j.applications.length, 0);
  
  // 面试数：该企业下创建的面试总数
  const interviewsCount = await getPrisma().interview.count({
    where: { 
      application: { jobId: { in: jobIds } }
    }
  });
  
  // 录用数：status = 'ACCEPTED'的申请数
  const hiredCount = await getPrisma().application.count({
    where: { 
      jobId: { in: jobIds },
      status: 'ACCEPTED'
    }
  });

  // 2. 申请趋势：最近7天
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentApplications = await getPrisma().application.findMany({
    where: {
      jobId: { in: jobIds },
      createdAt: { gte: sevenDaysAgo }
    },
    select: { createdAt: true }
  });
  
  const applicationTrend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const count = recentApplications.filter(a => 
      a.createdAt.toISOString().slice(0, 10) === dateStr
    ).length;
    applicationTrend.push({ date: dateStr, count });
  }

  // 3. 职位热度：每个职位的申请数
  const jobPopularity = jobs.map(j => ({
    jobTitle: j.title,
    applications: j.applications.length
  })).sort((a, b) => b.applications - a.applications).slice(0, 5);

  return {
    funnel: {
      jobs: jobs.length,
      applications: totalApplications,
      interviews: interviewsCount,
      hired: hiredCount
    },
    applicationTrend,
    jobPopularity
  };
}
