import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * 扣除信用分（举报成立时调用）
 * @param userId - 被扣分用户ID
 * @param points - 扣除分数（默认20）
 * @param reason - 扣分原因
 * @param complaintId - 关联的举报ID
 * @param tx - 可选的事务客户端，传入则复用外部事务
 * @returns { isBanned: boolean, newScore: number }
 */
export async function deductCreditScore(
  userId: string,
  points: number = 20,
  reason: string,
  complaintId?: string,
  tx?: TransactionClient
) {
  const db = tx || prisma;

  // 1. 获取用户当前信用分
  const user = await db.user.findUnique({
    where: { id: userId }
  });
  if (!user) throw new Error('用户不存在');

  // 2. 计算新分数（最低0分）
  const newScore = Math.max(0, user.creditScore - points);
  const isBanned = newScore <= 0;

  // 3. 更新用户信用分和封禁状态 + 创建信用分记录（事务保护）
  const doUpdate = async (txn: TransactionClient) => {
    await txn.user.update({
      where: { id: userId },
      data: {
        creditScore: newScore,
        isBanned
      }
    });

    await txn.creditRecord.create({
      data: {
        userId,
        score: newScore,
        change: -points,
        reason,
        relatedComplaintId: complaintId
      }
    });
  };

  if (tx) {
    // 外部已有事务，直接在其中执行
    await doUpdate(tx);
  } else {
    // 独立调用，自行开启事务
    await prisma.$transaction(async (t) => {
      await doUpdate(t);
    });
  }

  return { isBanned, newScore };
}

/**
 * 获取用户信用分信息（含记录）
 */
export async function getCreditInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      creditScore: true,
      isBanned: true
    }
  });
  if (!user) throw new Error('用户不存在');

  const records = await prisma.creditRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return {
    creditScore: user.creditScore,
    isBanned: user.isBanned,
    records: records.map(r => ({
      id: r.id,
      score: r.score,
      change: r.change,
      reason: r.reason,
      createdAt: r.createdAt
    }))
  };
}

/**
 * 获取他人的信用分（公开接口，仅分数不含记录）
 */
export async function getUserCreditScore(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      creditScore: true,
      isBanned: true
    }
  });
  if (!user) throw new Error('用户不存在');

  return user;
}
