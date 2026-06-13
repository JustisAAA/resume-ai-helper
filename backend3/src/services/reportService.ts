import { getPrisma } from '../index';
import { deductCreditScore } from './creditService';
import { parsePagination, buildPagination } from '../utils/pagination';

/**
 * 提交举报
 */
export async function submitReport(reporterId: string, targetId: string, reason: string, description?: string) {
  if (!reason || !['虚假信息', '骚扰', '欺诈', '其他'].includes(reason)) {
    throw new Error('无效的举报原因');
  }
  if (reporterId === targetId) {
    throw new Error('不能举报自己');
  }

  // 检查目标用户是否存在
  const target = await getPrisma().user.findUnique({ where: { id: targetId } });
  if (!target) {
    throw new Error('被举报用户不存在');
  }

  // 检查是否已举报过（同一举报人对同一被举报人的未处理举报）
  const existing = await getPrisma().complaint.findFirst({
    where: {
      reporterId,
      targetId,
      status: 'PENDING'
    }
  });
  if (existing) {
    throw new Error('您已举报过该用户，请等待处理');
  }

  const report = await getPrisma().complaint.create({
    data: {
      reporterId,
      targetId,
      reason,
      description: description || null
    },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      target: { select: { id: true, name: true, email: true } }
    }
  });

  return report;
}

/**
 * 获取举报列表（管理员）
 */
export async function getReports(status?: string, pagination?: { page?: number; limit?: number }) {
  const { page, limit, skip } = parsePagination(pagination);

  const where: any = {};
  if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    where.status = status;
  }

  const [reports, total] = await Promise.all([
    getPrisma().complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        target: { select: { id: true, name: true, email: true } },
        handler: { select: { id: true, name: true, email: true } }
      }
    }),
    getPrisma().complaint.count({ where })
  ]);

  return {
    reports,
    pagination: buildPagination(page, limit, total)
  };
}

/**
 * 通过举报（扣信用分）
 */
export async function approveReport(reportId: string, handlerId: string) {
  const report = await getPrisma().complaint.findUnique({ where: { id: reportId } });
  if (!report) {
    throw new Error('举报记录不存在');
  }
  if (report.status !== 'PENDING') {
    throw new Error('该举报已处理');
  }

  // 更新举报状态 + 扣除被举报人信用分（事务保护）
  await getPrisma().$transaction(async (tx) => {
    await tx.complaint.update({
      where: { id: reportId },
      data: {
        status: 'APPROVED',
        handlerId,
        handledAt: new Date()
      }
    });

    await deductCreditScore(report.targetId, 20, `举报成立：${report.reason}`, reportId, tx);
  });

  return report;
}

/**
 * 驳回举报
 */
export async function rejectReport(reportId: string, handlerId: string) {
  const report = await getPrisma().complaint.findUnique({ where: { id: reportId } });
  if (!report) {
    throw new Error('举报记录不存在');
  }
  if (report.status !== 'PENDING') {
    throw new Error('该举报已处理');
  }

  const updated = await getPrisma().complaint.update({
    where: { id: reportId },
    data: {
      status: 'REJECTED',
      handlerId,
      handledAt: new Date()
    }
  });

  return updated;
}
