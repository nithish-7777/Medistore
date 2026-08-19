const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const plainPassword = 'password123';

  // Check if admin exists
  const existing = await prisma.user.findUnique({
    where: { username }
  });

  if (existing) {
    console.log('Admin user already exists.');
    return;
  }

  const password_hash = await bcrypt.hash(plainPassword, 10);

  await prisma.user.create({
    data: {
      username,
      password_hash,
      role: 'ADMIN'
    }
  });

  console.log(`Created admin user with username: ${username} and password: ${plainPassword}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
