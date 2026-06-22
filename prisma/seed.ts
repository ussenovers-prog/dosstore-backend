import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create stores
  const dosstore = await prisma.store.upsert({
    where: { code: 'dosstore' },
    update: {},
    create: {
      name: 'Dosstore',
      code: 'dosstore',
    },
  });

  const status = await prisma.store.upsert({
    where: { code: 'status' },
    update: {},
    create: {
      name: 'Status',
      code: 'status',
    },
  });

  console.log('✓ Stores created:', dosstore.name, status.name);

  // Create owner user
  const ownerPassword = await hashPassword('owner123');
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      passwordHash: ownerPassword,
      fullName: 'Owner User',
      role: 'owner',
    },
  });

  console.log('✓ Owner created:', owner.email);

  // Create employee for Dosstore
  const dosstoreEmployeePassword = await hashPassword('employee123');
  const dosstoreEmployee = await prisma.user.upsert({
    where: { email: 'dosstore@example.com' },
    update: {},
    create: {
      email: 'dosstore@example.com',
      passwordHash: dosstoreEmployeePassword,
      fullName: 'Dosstore Employee',
      role: 'employee',
      storeId: dosstore.id,
    },
  });

  console.log('✓ Employee created:', dosstoreEmployee.email, '(Dosstore)');

  // Create employee for Status
  const statusEmployeePassword = await hashPassword('employee123');
  const statusEmployee = await prisma.user.upsert({
    where: { email: 'status@example.com' },
    update: {},
    create: {
      email: 'status@example.com',
      passwordHash: statusEmployeePassword,
      fullName: 'Status Employee',
      role: 'employee',
      storeId: status.id,
    },
  });

  console.log('✓ Employee created:', statusEmployee.email, '(Status)');

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('  Owner:    owner@example.com / owner123');
  console.log('  Employee: dosstore@example.com / employee123 (Dosstore)');
  console.log('  Employee: status@example.com / employee123 (Status)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
