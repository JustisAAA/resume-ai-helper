import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建管理员账号
  const adminEmail = 'admin@admin.com';
  const adminPassword = 'admin123';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: '系统管理员',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log(`✅ 管理员账号已创建：`);
    console.log(`   邮箱：${adminEmail}`);
    console.log(`   密码：${adminPassword}`);
    console.log(`   ⚠️ 请及时修改密码！`);
  } else {
    console.log('ℹ️ 管理员账号已存在，跳过创建');
  }

  console.log('数据库初始化完成！');
}

main()
  .catch(async (e) => {
    console.error('初始化失败：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
