import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration for orphaned "unknown" data...');

  // 1. Find the first valid user ID in the database to assign the orphans to
  const firstValidCustomer = await prisma.customer.findFirst({
    where: { user_id: { not: 'unknown' } },
    select: { user_id: true }
  });

  const targetUserId = firstValidCustomer?.user_id;

  if (!targetUserId) {
    console.log('No valid users found in database to transfer data to! Aborting.');
    return;
  }

  console.log(`Found target admin user ID: ${targetUserId}`);

  // 2. Update all customers
  const updatedCustomers = await prisma.customer.updateMany({
    where: { user_id: 'unknown' },
    data: { user_id: targetUserId }
  });

  console.log(`Successfully migrated ${updatedCustomers.count} orphaned customers.`);

  // 3. Update all orders
  const updatedOrders = await prisma.order.updateMany({
    where: { user_id: 'unknown' },
    data: { user_id: targetUserId }
  });

  console.log(`Successfully migrated ${updatedOrders.count} orphaned orders.`);

  console.log('Migration complete!');
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
