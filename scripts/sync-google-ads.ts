import { adsService } from '../src/modules/ads/ads.service.js';
import prisma from '../src/utils/prisma.js';

async function main() {
  const result = await adsService.syncGoogleSheet();
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
