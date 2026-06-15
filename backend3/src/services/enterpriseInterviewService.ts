import { getPrisma } from '../index';
import { InterviewStatus, InterviewType, Difficulty, Language, AIRole } from '@prisma/client';

/**
 * 创建面试邀请
 * @param enterpriseId 企业ID
 * @param applicationId 申请ID
 * @returns 创建的面试
 */
export async function createInterview(enterpriseId: string, applicationId: string) {
  // 验证申请是否存在且属于当前企业的职位
  const application = await getPrisma().application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: { enterpriseId: true, title: true }
      },
      user: {
        select: { id: true, name: true }
      },
      resume: {
        select: { id: true, title: true }
      }
    }
  });

  if (!application) {
    throw new Error('申请不存在');
  }

  if (application.job.enterpriseId !== enterpriseId) {
    throw new Error('权限不足，无法为该申请创建面试');
  }

  if (!application.resume) {
    throw new Error('该申请没有关联的简历，无法创建面试');
  }

  // 创建面试
  const interview = await getPrisma().interview.create({
    data: {
      userId: application.user.id,
      resumeId: application.resume.id,
      applicationId: application.id,
      title: `面试 - ${application.user.name} - ${application.job.title}`,
      position: application.job.title,
      type: InterviewType.ENTERPRISE,
      difficulty: Difficulty.MEDIUM,
      language: Language.ZH_CN,
      aiRole: AIRole.PROFESSIONAL,
      questions: [],
      status: InterviewStatus.CREATED
    }
  });

  return interview;
}

/**
 * 获取企业的面试列表
 * @param enterpriseId 企业ID
 * @returns 面试列表
 */
export async function getEnterpriseInterviews(enterpriseId: string, jobId?: string) {
  // 获取该企业的职位ID（HR只查绑定岗位）
  const whereJob: any = { enterpriseId };
  if (jobId) whereJob.id = jobId;

  const jobs = await getPrisma().job.findMany({
    where: whereJob,
    select: { id: true }
  });

  const jobIds = jobs.map(j => j.id);

  // 获取这些职位的所有申请对应的用户ID
  const applications = await getPrisma().application.findMany({
    where: { jobId: { in: jobIds } },
    select: { userId: true }
  });

  const userIds = [...new Set(applications.map(a => a.userId))];

  // 获取这些用户的面试
  const interviews = await getPrisma().interview.findMany({
    where: { userId: { in: userIds } },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      resume: {
        select: { id: true, title: true, score: true }
      },
      report: {
        select: { id: true, createdAt: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return interviews;
}

/**
 * 获取面试报告（企业查看）
 * @param interviewId 面试ID
 * @param enterpriseId 企业ID
 * @returns 面试报告
 */
export async function getInterviewReport(interviewId: string, enterpriseId: string) {
  // 获取面试及报告
  const interview = await getPrisma().interview.findUnique({
    where: { id: interviewId },
    include: {
      report: true,
      user: {
        select: { id: true, name: true, email: true }
      },
      resume: {
        select: { id: true, title: true }
      }
    }
  });

  if (!interview) {
    throw new Error('面试不存在');
  }

  if (!interview.reportId || !interview.report) {
    throw new Error('该面试没有报告');
  }

  // 验证企业权限：面试的用户必须是该企业职位申请的候选人
  const applications = await getPrisma().application.findFirst({
    where: {
      userId: interview.userId,
      job: {
        enterpriseId
      }
    }
  });

  if (!applications) {
    throw new Error('权限不足，无法查看该面试报告');
  }

  return interview.report;
}
