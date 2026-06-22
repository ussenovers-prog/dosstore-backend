import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📝 Creating test import logs...');

  const now = new Date();
  const imports = [
    {
      sourceType: 'ftp_beksar_sales',
      storeId: 1,
      fileName: 'sales_20240115.xml',
      status: 'success',
      recordsProcessed: 45,
      recordsFailed: 0,
      importedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      sourceType: 'ftp_beksar_arrival',
      storeId: 1,
      fileName: 'arrival_20240115.xml',
      status: 'success',
      recordsProcessed: 12,
      recordsFailed: 0,
      importedAt: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      sourceType: 'ftp_beksar_inventory',
      storeId: 2,
      fileName: 'inventory_20240114.xml',
      status: 'partial',
      recordsProcessed: 198,
      recordsFailed: 2,
      errorMessage: '2 records had invalid product IDs',
      importedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      sourceType: 'ftp_beksar_gross_profit',
      storeId: 1,
      fileName: 'grossprofit_20240113.xml',
      status: 'error',
      recordsProcessed: 0,
      recordsFailed: 1,
      errorMessage: 'XML parsing failed: unexpected structure',
      importedAt: new Date(now.getTime() - 1000 * 60 * 60 * 48), // 2 days ago
    },
    {
      sourceType: 'ftp_beksar_sales',
      storeId: 2,
      fileName: 'sales_20240113.xml',
      status: 'success',
      recordsProcessed: 38,
      recordsFailed: 0,
      importedAt: new Date(now.getTime() - 1000 * 60 * 60 * 48), // 2 days ago
    },
  ];

  for (const imp of imports) {
    await prisma.importLog.create({ data: imp });
  }

  console.log(`✅ Created ${imports.length} test import logs`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
