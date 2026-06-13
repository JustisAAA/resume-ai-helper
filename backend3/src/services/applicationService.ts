import { getPrisma } from '../index';
import { ApplicationStatus } from '@prisma/client';

/**
 * 获取职位的申请列表
 * @param jobId 职位ID
 * @param enterpriseId 企业ID（用于权限验证）
 * @returns 申请列表
 */
export async function getApplicationsByJobId(jobId: string, enterpriseId: string) {
  // 验证职位是否属于当前企业
  const job = await getPrisma().job.findUnique({
    where: { id: jobId },
    select: { enterpriseId: true }
  });

  if (!job) {
    throw new Error('职位不存在');
  }

  if (job.enterpriseId !== enterpriseId) {
    throw new Error('权限不足，无法查看该职位的申请');
  }

  // 获取申请列表，包含关联数据
  const applications = await getPrisma().application.findMany({
    where: { jobId },
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
          fileName: true,
          fileUrl: true,
          score: true,
          status: true
        }
      },
      job: {
        select: {
          id: true,
          title: true,
          location: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return applications;
}

/**
 * 更新申请状态
 * @param applicationId 申请ID
 * @param enterpriseId 企业ID（用于权限验证）
 * @param status 新状态
 * @returns 更新后的申请
 */
export async function updateApplicationStatus(
  applicationId: string,
  enterpriseId: string,
  status: ApplicationStatus
) {
  // 验证申请是否存在且属于当前企业的职位
  const application = await getPrisma().application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: { enterpriseId: true }
      }
    }
  });

  if (!application) {
    throw new Error('申请不存在');
  }

  if (application.job.enterpriseId !== enterpriseId) {
    throw new Error('权限不足，无法修改该申请');
  }

  // 更新申请状态
  const updatedApplication = await getPrisma().application.update({
    where: { id: applicationId },
    data: { status },
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
          fileName: true,
          fileUrl: true,
          score: true,
          status: true
        }
      },
      job: {
        select: {
          id: true,
          title: true,
          location: true
        }
      }
    }
  });

  return updatedApplication;
}

/**
 * 获取申请简历详情
 * @param applicationId 申请ID
 * @param enterpriseId 企业ID（用于权限验证）
 * @returns 简历详情
 */
export async function getApplicationResume(applicationId: string, enterpriseId: string) {
  // 验证申请是否存在且属于当前企业的职位
  const application = await getPrisma().application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: { enterpriseId: true }
      },
      resume: {
        select: {
          id: true,
          userId: true,
          title: true,
          content: true,
          rawText: true,
          fileName: true,
          fileUrl: true,
          analysis: true,
          score: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  if (!application) {
    throw new Error('申请不存在');
  }

  if (application.job.enterpriseId !== enterpriseId) {
    throw new Error('权限不足，无法查看该申请的简历');
  }

  if (!application.resume) {
    throw new Error('该申请没有关联的简历');
  }

  return application.resume;
}

/**
 * 获取申请详情（用于其他模块调用）
 * @param applicationId 申请ID
 * @param enterpriseId 企业ID（用于权限验证）
 * @returns 申请详情
 */
export async function getApplicationById(applicationId: string, enterpriseId: string) {
  // 验证申请是否存在且属于当前企业的职位
  const application = await getPrisma().application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          enterpriseId: true
        }
      },
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
          fileName: true,
          fileUrl: true,
          score: true,
          status: true
        }
      }
    }
  });

  if (!application) {
    throw new Error('申请不存在');
  }

  if (application.job.enterpriseId !== enterpriseId) {
    throw new Error('权限不足，无法查看该申请');
  }

  return application;
}
