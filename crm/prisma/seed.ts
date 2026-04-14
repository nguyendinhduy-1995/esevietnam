import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'Admin';
  const password = 'Admin@123';
  const hashedPassword = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { username } });

  if (existing) {
    // Update password if user already exists
    await prisma.user.update({
      where: { username },
      data: { password: hashedPassword, role: 'admin', active: true },
    });
    console.log(`✅ User "${username}" already existed — password & role updated.`);
  } else {
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
        active: true,
      },
    });
    console.log(`✅ User "${username}" created successfully with role "admin".`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
