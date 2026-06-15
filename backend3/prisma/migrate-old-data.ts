/**
 * 旧数据迁移脚本
 * 
 * 用途：将旧版文件路径头像（/uploads/avatars/xxx.png）和Logo清空
 *       新版使用base64存数据库，旧路径在Railway上不存在
 * 
 * 执行时机：每次部署时，在数据库push之后、seed之前
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[迁移] 开始清理旧版头像/Logo数据...');

  // 1. 清理旧版用户头像（非 data: 开头的都是旧版文件路径）
  const oldAvatars = await prisma.user.findMany({
    where: {
      avatar: { not: null },
      NOT: { avatar: { startsWith: 'data:' } }
    },
    select: { id: true, avatar: true }
  });

  if (oldAvatars.length > 0) {
    console.log(`[迁移] 发现 ${oldAvatars.length} 个旧版头像，正在清理...`);
    await prisma.user.updateMany({
      where: {
        avatar: { not: null },
        NOT: { avatar: { startsWith: 'data:' } }
      },
      data: { avatar: null }
    });
    oldAvatars.forEach(u => console.log(`  - 用户 ${u.id}: ${u.avatar}`));
  } else {
    console.log('[迁移] 无需清理用户头像');
  }

  // 2. 清理旧版企业Logo（非 data: 开头的都是旧版文件路径）
  const oldLogos = await prisma.enterprise.findMany({
    where: {
      logo: { not: null },
      NOT: { logo: { startsWith: 'data:' } }
    },
    select: { id: true, name: true, logo: true }
  });

  if (oldLogos.length > 0) {
    console.log(`[迁移] 发现 ${oldLogos.length} 个旧版Logo，正在清理...`);
    await prisma.enterprise.updateMany({
      where: {
        logo: { not: null },
        NOT: { logo: { startsWith: 'data:' } }
      },
      data: { logo: null }
    });
    oldLogos.forEach(e => console.log(`  - 企业 ${e.name}(${e.id}): ${e.logo}`));
  } else {
    console.log('[迁移] 无需清理企业Logo');
  }

  // 3. 清理旧版简历文件路径（非 data: 和非 http 开头的都是旧版文件路径）
  //    只清理 fileUrl（base64下载链接），保留 rawText（解析后的纯文本）
  const oldResumeFiles = await prisma.resume.findMany({
    where: {
      fileUrl: { not: null },
      NOT: {
        OR: [
          { fileUrl: { startsWith: 'data:' } },
          { fileUrl: { startsWith: 'http' } }
        ]
      }
    },
    select: { id: true, title: true, fileUrl: true }
  });

  if (oldResumeFiles.length > 0) {
    console.log(`[迁移] 发现 ${oldResumeFiles.length} 个旧版简历文件URL，正在清理...`);
    await prisma.resume.updateMany({
      where: {
        fileUrl: { not: null },
        NOT: {
          OR: [
            { fileUrl: { startsWith: 'data:' } },
            { fileUrl: { startsWith: 'http' } }
          ]
        }
      },
      data: { fileUrl: null }
    });
    oldResumeFiles.forEach(r => console.log(`  - 简历 ${r.title}(${r.id}): ${r.fileUrl}`));
  } else {
    console.log('[迁移] 无需清理简历文件URL');
  }

  console.log('[迁移] 数据清理完成');
}

main()
  .catch((e) => {
    console.error('[迁移] 失败:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
