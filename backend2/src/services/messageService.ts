import { prisma } from '../index';
import { parsePagination, buildPagination } from '../utils/pagination';

/**
 * 角色间通信规则：
 *   USER(求职者) ↔ HR(HR子账号)
 *   HR(HR子账号)  ↔ ENTERPRISE(HR组长)
 *   禁止 USER ↔ ENTERPRISE 直接通信
 */
const ALLOWED_COMMUNICATION: Record<string, string[]> = {
  USER: ['HR'],
  HR: ['USER', 'ENTERPRISE'],
  ENTERPRISE: ['HR'],
  ADMIN: []
};

/**
 * 发送消息（带职位隔离 + 角色校验）
 */
export async function sendMessage(senderId: string, receiverId: string, content: string, jobId?: string, senderRole?: string) {
  if (!content || content.trim().length === 0) {
    throw new Error('消息内容不能为空');
  }
  if (content.length > 1000) {
    throw new Error('消息内容不能超过1000字符');
  }
  if (senderId === receiverId) {
    throw new Error('不能给自己发消息');
  }

  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({ where: { id: senderId }, select: { id: true, role: true } }),
    prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, role: true } })
  ]);

  if (!sender) throw new Error('发送者不存在');
  if (!receiver) throw new Error('接收者不存在');

  // 角色通信规则校验
  const effectiveRole = senderRole || sender.role;
  const allowedReceiverRoles = ALLOWED_COMMUNICATION[effectiveRole];
  if (!allowedReceiverRoles || !allowedReceiverRoles.includes(receiver.role)) {
    const roleLabels: Record<string, string> = { USER: '求职者', HR: 'HR', ENTERPRISE: '企业', ADMIN: '管理员' };
    const senderLabel = roleLabels[effectiveRole] || effectiveRole;
    const receiverLabel = roleLabels[receiver.role] || receiver.role;
    throw new Error(`${senderLabel}不能直接与${receiverLabel}通信`);
  }

  const message = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content: content.trim(),
      jobId: jobId || null
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } }
    }
  });

  return message;
}

/**
 * 获取与某用户关于某职位的消息列表
 * @param userId 当前用户ID
 * @param partnerId 对方用户ID
 * @param jobId 职位ID（可选，不传则返回所有消息）
 * @param after 可选，只获取此消息ID之后的消息
 * @param pagination 可选，分页参数
 */
export async function getMessages(
  userId: string,
  partnerId: string,
  jobId?: string,
  after?: string,
  pagination?: { page?: number; limit?: number }
) {
  const { page, limit, skip } = parsePagination(pagination);

  const where: any = {
    OR: [
      { senderId: userId, receiverId: partnerId },
      { senderId: partnerId, receiverId: userId }
    ]
  };

  // 按职位隔离
  if (jobId) {
    where.jobId = jobId;
  }

  if (after) {
    const afterMessage = await prisma.message.findUnique({ where: { id: after } });
    if (afterMessage) {
      where.createdAt = { gt: afterMessage.createdAt };
    }
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      }
    }),
    prisma.message.count({ where })
  ]);

  return {
    messages,
    pagination: buildPagination(page, limit, total)
  };
}

/**
 * 获取未读消息数
 */
export async function getUnreadCount(userId: string) {
  const count = await prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false
    }
  });
  return count;
}

/**
 * 标记消息已读（按职位隔离）
 * @param userId 当前用户ID（接收者）
 * @param partnerId 发送者ID
 * @param jobId 职位ID
 */
export async function markAsRead(userId: string, partnerId: string, jobId?: string) {
  const where: any = {
    senderId: partnerId,
    receiverId: userId,
    isRead: false
  };
  if (jobId) {
    where.jobId = jobId;
  }

  await prisma.message.updateMany({
    where,
    data: { isRead: true }
  });
}

/**
 * 获取会话列表（按(对方用户 + 职位)分组）
 * @param userId 当前用户ID
 * @param pagination 可选，分页参数
 */
export async function getConversations(userId: string, role?: string, pagination?: { page?: number; limit?: number }) {
  const { page, limit, skip: start } = parsePagination(pagination);

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, name: true, avatar: true, role: true } },
      receiver: { select: { id: true, name: true, avatar: true, role: true } },
      job: { select: { id: true, title: true, status: true } }
    }
  });

  // 按 (partnerId + jobId) 分组，而非仅按 partnerId
  const conversationMap = new Map<string, any>();
  const partnerIds: string[] = [];

  for (const msg of messages) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const partner = msg.senderId === userId ? msg.receiver : msg.sender;

    // 角色过滤：求职者只看到与HR的对话
    if (role === 'USER' && partner.role === 'ENTERPRISE') continue;
    // 企业只看到与HR的对话
    if (role === 'ENTERPRISE' && partner.role === 'USER') continue;

    const jId = msg.jobId || '__no_job__'; // 无职位消息归到同一组
    const key = `${partnerId}_${jId}`;

    if (!conversationMap.has(key)) {
      if (!partnerIds.includes(partnerId)) partnerIds.push(partnerId);

      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      const unreadCount = messages.filter(m =>
        m.senderId === partnerId && m.receiverId === userId && !m.isRead && (m.jobId || '__no_job__') === jId
      ).length;

      conversationMap.set(key, {
        partnerId,
        partner,
        jobId: msg.jobId || null,
        jobTitle: msg.job?.title || null,
        jobDeleted: msg.job?.status === 'DELETED' || false,
        lastMessage: msg,
        unreadCount
      });
    }
  }

  // 为企业用户和HR用户的每个对话补充企业logo
  const enterprisePartnerIds = Array.from(conversationMap.values())
    .filter(c => c.partner.role === 'ENTERPRISE' || c.partner.role === 'HR')
    .map(c => c.partnerId);

  if (enterprisePartnerIds.length > 0) {
    // 直接查enterprise表获取logo（enterprise role）
    const enterprises = await prisma.enterprise.findMany({
      where: { userId: { in: enterprisePartnerIds } },
      select: { userId: true, logo: true }
    });
    const logoMap = new Map(enterprises.map(e => [e.userId, e.logo]));

    // 查HR用户的hrAccount获取enterprise logo（HR role）
    const hrAccounts = await prisma.hRAccount.findMany({
      where: { userId: { in: enterprisePartnerIds } },
      include: { enterprise: { select: { logo: true } } }
    });
    for (const hr of hrAccounts) {
      if (hr.enterprise?.logo && !logoMap.has(hr.userId)) {
        logoMap.set(hr.userId, hr.enterprise.logo);
      }
    }

    for (const [_, conv] of conversationMap) {
      if (conv.partner.role === 'ENTERPRISE' || conv.partner.role === 'HR') {
        const logo = logoMap.get(conv.partnerId);
        if (logo) {
          conv.partnerAvatar = logo;
        }
      }
    }
  }

  const allConversations = Array.from(conversationMap.values());
  const total = allConversations.length;
  const paginatedConversations = allConversations.slice(start, start + limit);

  return {
    conversations: paginatedConversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
