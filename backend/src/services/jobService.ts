import { prisma } from '../index';
import { JobStatus } from '@prisma/client';

export interface JobCreateData {
  title: string;
  description: string;
  requirements?: string;
  salaryRange?: string;
  location?: string;
  type?: string;
}

export interface JobUpdateData {
  title?: string;
  description?: string;
  requirements?: string;
  salaryRange?: string;
  location?: string;
  type?: string;
  status?: JobStatus;
}

/**
 * 创建职位
 */
export async function createJob(enterpriseId: string, data: JobCreateData) {
  const { title, description, requirements, salaryRange, location, type } = data;

  // 验证输入
  if (!title || !description) {
    throw new Error('职位标题和描述不能为空');
  }

  // 创建职位
  const job = await prisma.job.create({
    data: {
      enterpriseId,
      title,
      description,
      requirements,
      salaryRange,
      location,
      type,
      status: 'ACTIVE'
    },
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

  return job;
}

/**
 * 获取职位列表
 */
export async function getJobs(enterpriseId?: string, status?: JobStatus) {
  const where: any = {};

  if (enterpriseId) {
    where.enterpriseId = enterpriseId;
  }

  if (status) {
    where.status = status;
  }

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: 'desc' },
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
      }
    }
  });

  return jobs;
}

/**
 * 获取职位详情
 */
export async function getJobById(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      enterprise: {
        select: {
          id: true,
          name: true,
          logo: true,
          description: true,
          industry: true,
          size: true,
          location: true,
          contactEmail: true,
          contactPhone: true
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

  return job;
}

/**
 * 更新职位
 */
export async function updateJob(jobId: string, enterpriseId: string, data: JobUpdateData) {
  // 检查职位是否存在且属于该企业
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    throw new Error('职位不存在');
  }

  if (job.enterpriseId !== enterpriseId) {
    throw new Error('无权修改该职位');
  }

  // 更新职位
  const updatedJob = await prisma.job.update({
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
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    throw new Error('职位不存在');
  }

  if (job.enterpriseId !== enterpriseId) {
    throw new Error('无权删除该职位');
  }

  // 删除职位（会级联删除相关的申请）
  await prisma.job.delete({
    where: { id: jobId }
  });

  return { message: '职位删除成功' };
}

/**
 * 更新职位状态
 */
export async function updateJobStatus(jobId: string, enterpriseId: string, status: JobStatus) {
  // 检查职位是否存在且属于该企业
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    throw new Error('职位不存在');
  }

  if (job.enterpriseId !== enterpriseId) {
    throw new Error('无权修改该职位');
  }

  // 更新职位状态
  const updatedJob = await prisma.job.update({
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
