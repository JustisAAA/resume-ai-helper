import { getPrisma } from '../index';
import { JobStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { parsePagination, buildPagination } from '../utils/pagination';
import { BCRYPT_SALT_ROUNDS } from '../config';

export interface JobCreateData {
  title: string;
  description: string;
  requirements?: string;
  salaryRange?: string;
  location?: string;
  type?: string;
  keywords?: string[];
  images?: string[];
  hrConfig: {
    name: string;
    email: string;
    password: string;
  };
}

export interface JobUpdateData {
  title?: string;
  description?: string;
  requirements?: string;
  salaryRange?: string;
  location?: string;
  type?: string;
  status?: JobStatus;
  keywords?: string[];
  images?: string[];
}

/**
 * 创建职位
 */
export async function createJob(enterpriseId: string, data: JobCreateData) {
  const { title, description, requirements, salaryRange, location, type, keywords, images, hrConfig } = data;

  // 验证HR配置
  if (!hrConfig.email || !hrConfig.password || !hrConfig.name) {
    throw new Error('HR邮箱、密码和姓名不能为空');
  }
  if (hrConfig.password.length < 6) {
    throw new Error('HR密码至少6位');
  }
  const emailTaken = await getPrisma().user.findUnique({ where: { email: hrConfig.email } });
  if (emailTaken) throw new Error(`HR邮箱 ${hrConfig.email} 已被占用`);

  const hashedPw = bcrypt.hashSync(hrConfig.password, BCRYPT_SALT_ROUNDS);

  // 使用事务：创建职位 + HR用户 + HR账号，全部成功或全部回滚
  const { job, hrAccount } = await getPrisma().$transaction(async (tx) => {
    const newJob = await tx.job.create({
      data: {
        enterpriseId,
        title,
        description,
        requirements,
        salaryRange,
        location,
        type,
        status: 'ACTIVE',
        keywords: keywords || [],
        images: images || []
      },
      include: {
        enterprise: {
          select: { id: true, name: true, logo: true }
        }
      }
    });

    const hrUser = await tx.user.create({
      data: {
        email: hrConfig.email,
        passwordHash: hashedPw,
        name: hrConfig.name,
        role: 'HR'
      }
    });

    const newHrAccount = await tx.hRAccount.create({
      data: {
        userId: hrUser.id,
        enterpriseId,
        jobId: newJob.id,
        name: hrConfig.name,
        isActive: true
      }
    });

    return { job: newJob, hrAccount: newHrAccount };
  });

  const hrResult = {
    id: hrAccount.id,
    name: hrAccount.name,
    email: hrConfig.email,
    loginEmail: hrConfig.email,
    loginPassword: hrConfig.password
  };

  return { job, hrResult };
}

/**
 * 获取职位列表
 */
export async function getJobs(
  enterpriseId?: string,
  status?: JobStatus,
  pagination?: { page?: number; limit?: number }
) {
  const { page, limit, skip } = parsePagination(pagination);

  const where: any = {};

  if (enterpriseId) {
    where.enterpriseId = enterpriseId;
  }

  if (status) {
    where.status = status;
  } else {
    // 默认排除已删除的职位
    where.status = { not: 'DELETED' };
  }

  const [jobs, total] = await Promise.all([
    getPrisma().job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        enterprise: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        },
        hrAccount: {
          select: {
            userId: true,
            name: true,
            isActive: true
          }
        }
      }
    }),
    getPrisma().job.count({ where })
  ]);

  return {
    jobs,
    pagination: buildPagination(page, limit, total)
  };
}

/**
 * 获取职位详情
 * @param jobId 职位ID
 * @param userId 可选：当前登录用户ID，用于检查是否已申请
 */
export async function getJobById(jobId: string, userId?: string) {
  const job = await getPrisma().job.findUnique({
    where: { id: jobId },
    include: {
      enterprise: {
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
          website: true,
          industry: true,
          size: true,
          location: true,
          contactEmail: true,
          contactPhone: true,
          userId: true,
          user: {
            select: {
              creditScore: true
            }
          }
        }
      },
      hrAccount: {
        select: {
          userId: true,
          name: true,
          isActive: true
        }
      },
      applications: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          resume: {
            select: {
              id: true,
              title: true,
              score: true
            }
          }
        }
      }
    }
  });

  if (!job) {
    throw new Error('职位不存在');
  }

  // 检查当前用户是否已申请该职位
  let applied = false;
  if (userId) {
    const existing = await getPrisma().application.findFirst({
      where: { userId, jobId }
    });
    applied = !!existing;
  }

  return { ...job, applied };
}

/**
 * 更新职位
 */
export async function updateJob(jobId: string, enterpriseId: string, data: JobUpdateData) {
  // 检查职位是否存在且属于该企业
  const job = await getPrisma().job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    throw new Error('职位不存在');
  }

  if (job.enterpriseId !== enterpriseId) {
    throw new Error('无权修改该职位');
  }

  // 更新职位
  const updatedJob = await getPrisma().job.update({
    where: { id: jobId },
    data,
    include: {
      enterprise: {
        select: {
          id: true,
          name: true,
          logo: true
        }
      }
    }
  });

  return updatedJob;
}

/**
 * 删除职位
 */
export async function deleteJob(jobId: string, enterpriseId: string) {
  // 检查职位是否存在且属于该企业
  const job = await getPrisma().job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    throw new Error('职位不存在');
  }

  if (job.enterpriseId !== enterpriseId) {
    throw new Error('无权删除该职位');
  }

  // 软删除：仅标记状态，保留关联数据（面试记录、申请等）
  await getPrisma().job.update({
    where: { id: jobId },
    data: { status: 'DELETED' }
  });

  return { message: '职位已删除' };
}

/**
 * 更新职位状态
 */
export async function updateJobStatus(jobId: string, enterpriseId: string, status: JobStatus) {
  // 检查职位是否存在且属于该企业
  const job = await getPrisma().job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    throw new Error('职位不存在');
  }

  if (job.enterpriseId !== enterpriseId) {
    throw new Error('无权修改该职位');
  }

  // 更新职位状态
  const updatedJob = await getPrisma().job.update({
    where: { id: jobId },
    data: { status },
    include: {
      enterprise: {
        select: {
          id: true,
          name: true,
          logo: true
        }
      }
    }
  });

  return updatedJob;
}
