import { prisma } from '../index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parsePagination, buildPagination } from '../utils/pagination';
import { JWT_SECRET, BCRYPT_SALT_ROUNDS } from '../config';

// ========== 登录 ==========

export async function hrLogin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { hrAccount: { include: { enterprise: true, job: true } } }
  });

  if (!user || user.role !== 'HR') {
    throw new Error('HR账号不存在');
  }
  if (user.status === 'BANNED') {
    throw new Error('账号已被封禁');
  }
  if (!user.hrAccount) {
    throw new Error('HR信息不完整');
  }
  if (!user.hrAccount.isActive) {
    throw new Error('该HR账号已被停用');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('密码错误');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    hr: {
      id: user.hrAccount.id,
      name: user.hrAccount.name,
      userId: user.id,
      role: user.role,
      enterprise: {
        id: user.hrAccount.enterprise.id,
        name: user.hrAccount.enterprise.name,
        logo: user.hrAccount.enterprise.logo,
        description: user.hrAccount.enterprise.description,
        industry: user.hrAccount.enterprise.industry,
        size: user.hrAccount.enterprise.size,
        location: user.hrAccount.enterprise.location,
        ownerId: user.hrAccount.enterprise.ownerId,
      },
      job: {
        id: user.hrAccount.job.id,
        title: user.hrAccount.job.title,
        status: user.hrAccount.job.status,
      }
    }
  };
}

// ========== 首页信息 ==========

export async function getHRDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      hrAccount: {
        include: {
          enterprise: true,
          job: {
            include: {
              applications: {
                select: { status: true }
              }
            }
          }
        }
      }
    }
  });

  if (!user) throw new Error('用户不存在');
  if (!user.hrAccount) throw new Error('HR账号不存在');

  const hrAccount = user.hrAccount;
  const apps = hrAccount.job.applications;
  return {
    hrName: hrAccount.name,
    userRole: user.role, // 返回用户角色
    enterprise: {
      id: hrAccount.enterprise.id,
      name: hrAccount.enterprise.name,
      logo: hrAccount.enterprise.logo,
      description: hrAccount.enterprise.description,
      industry: hrAccount.enterprise.industry,
      size: hrAccount.enterprise.size,
      location: hrAccount.enterprise.location,
      ownerId: hrAccount.enterprise.ownerId,
    },
    job: {
      id: hrAccount.job.id,
      title: hrAccount.job.title,
      status: hrAccount.job.status,
      applicationCount: apps.length,
      pendingCount: apps.filter(a => a.status === 'PENDING').length,
      acceptedCount: apps.filter(a => a.status === 'ACCEPTED').length,
      rejectedCount: apps.filter(a => a.status === 'REJECTED').length,
    }
  };
}

// ========== 申请管理 ==========

export async function getHRApplications(userId: string, pagination?: { page?: number; limit?: number }) {
  const hrAccount = await prisma.hRAccount.findUnique({
    where: { userId },
    select: { jobId: true }
  });
  if (!hrAccount) throw new Error('HR账号不存在');

  const { page, limit, skip } = parsePagination(pagination);

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where: { jobId: hrAccount.jobId },
      include: { user: true, resume: true, job: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.application.count({ where: { jobId: hrAccount.jobId } })
  ]);

  return {
    applications,
    pagination: buildPagination(page, limit, total)
  };
}

export async function getHRApplicationResume(userId: string, applicationId: string) {
  const hrAccount = await prisma.hRAccount.findUnique({
    where: { userId },
    select: { jobId: true }
  });
  if (!hrAccount) throw new Error('HR账号不存在');

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      resume: true,
      user: { select: { id: true, name: true, email: true, avatar: true } },
      job: { select: { id: true, title: true } }
    }
  });

  if (!app || app.jobId !== hrAccount.jobId) {
    throw new Error('无权查看该申请');
  }

  return {
    resume: app.resume,
    application: {
      id: app.id,
      status: app.status,
      createdAt: app.createdAt,
      coverLetter: app.coverLetter,
      aiAnalysis: app.aiAnalysis,
      user: app.user,
      job: app.job
    }
  };
}

export async function updateHRApplicationStatus(userId: string, applicationId: string, status: string) {
  const hrAccount = await prisma.hRAccount.findUnique({
    where: { userId },
    select: { jobId: true }
  });
  if (!hrAccount) throw new Error('HR账号不存在');

  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app || app.jobId !== hrAccount.jobId) {
    throw new Error('无权操作该申请');
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: { status: status as any },
    include: { user: true, job: true }
  });
}

// ========== HR个人设置 ==========

export async function updateHRProfile(userId: string, data: { name?: string; password?: string }) {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.password) updateData.passwordHash = bcrypt.hashSync(data.password, BCRYPT_SALT_ROUNDS);

  if (Object.keys(updateData).length === 0) throw new Error('没有要更新的内容');

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, email: true, name: true, role: true }
  });

  // 同步HRAccount中的name
  if (data.name) {
    await prisma.hRAccount.update({
      where: { userId },
      data: { name: data.name }
    });
  }

  return user;
}

// ========== 企业组长：创建HR账号 ==========

export async function createHRAccount(enterpriseUserId: string, jobId: string, hrEmail: string, hrPassword: string, hrName: string) {
  const enterprise = await prisma.enterprise.findUnique({ where: { userId: enterpriseUserId } });
  if (!enterprise) throw new Error('企业不存在');

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.enterpriseId !== enterprise.id) throw new Error('职位不属于该企业');

  // 检查该职位是否已有HR
  const existing = await prisma.hRAccount.findUnique({ where: { jobId } });
  if (existing) throw new Error('该职位已有HR账号');

  // 检查邮箱是否被占用
  const emailTaken = await prisma.user.findUnique({ where: { email: hrEmail } });
  if (emailTaken) throw new Error('该邮箱已被占用');

  const hash = bcrypt.hashSync(hrPassword, BCRYPT_SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: hrEmail, passwordHash: hash, name: hrName, role: 'HR' }
  });

  const hrAccount = await prisma.hRAccount.create({
    data: {
      userId: user.id,
      enterpriseId: enterprise.id,
      jobId,
      name: hrName
    }
  });

  return { hrAccount, email: hrEmail };
}

// ========== 企业组长：管理HR ==========

export async function getEnterpriseHRs(enterpriseUserId: string, pagination?: { page?: number; limit?: number }) {
  const enterprise = await prisma.enterprise.findUnique({ where: { userId: enterpriseUserId } });
  if (!enterprise) throw new Error('企业不存在');

  const { page, limit, skip } = parsePagination(pagination);

  const [hrs, total] = await Promise.all([
    prisma.hRAccount.findMany({
      where: { enterpriseId: enterprise.id },
      include: {
        user: { select: { email: true, status: true } },
        job: { select: { id: true, title: true, status: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.hRAccount.count({ where: { enterpriseId: enterprise.id } })
  ]);

  return {
    hrs,
    pagination: buildPagination(page, limit, total)
  };
}

export async function toggleHRActive(enterpriseUserId: string, hrAccountId: string, isActive: boolean) {
  const enterprise = await prisma.enterprise.findUnique({ where: { userId: enterpriseUserId } });
  if (!enterprise) throw new Error('企业不存在');

  const hr = await prisma.hRAccount.findUnique({ where: { id: hrAccountId } });
  if (!hr || hr.enterpriseId !== enterprise.id) throw new Error('无权操作');

  return prisma.hRAccount.update({
    where: { id: hrAccountId },
    data: { isActive }
  });
}

export async function reassignHRJob(enterpriseUserId: string, hrAccountId: string, newJobId: string) {
  const enterprise = await prisma.enterprise.findUnique({ where: { userId: enterpriseUserId } });
  if (!enterprise) throw new Error('企业不存在');

  const hr = await prisma.hRAccount.findUnique({ where: { id: hrAccountId } });
  if (!hr || hr.enterpriseId !== enterprise.id) throw new Error('无权操作');

  const job = await prisma.job.findUnique({ where: { id: newJobId } });
  if (!job || job.enterpriseId !== enterprise.id) throw new Error('职位不属于该企业');

  const existing = await prisma.hRAccount.findUnique({ where: { jobId: newJobId } });
  if (existing && existing.id !== hrAccountId) throw new Error('该职位已有HR');

  return prisma.hRAccount.update({
    where: { id: hrAccountId },
    data: { jobId: newJobId }
  });
}
