import prisma from '../../utils/prisma.js';
import {
  calculateAdsFileHash,
  parseAdvertisingExpenses,
} from './ads.parser.js';

export class DuplicateAdsImportError extends Error {
  constructor() {
    super('Advertising file already imported');
    this.name = 'DuplicateAdsImportError';
  }
}

class AdsService {
  async importFile(fileName: string, fileBuffer: Buffer) {
    const fileHash = calculateAdsFileHash(fileBuffer);
    const existing = await prisma.advertisingExpense.findFirst({
      where: { fileHash },
      select: { id: true },
    });
    if (existing) throw new DuplicateAdsImportError();

    const parsed = parseAdvertisingExpenses(fileBuffer);
    const stores = await prisma.store.findMany({
      where: { code: { in: [...new Set(parsed.map((item) => item.storeCode))] } },
      select: { id: true, code: true },
    });
    const storeIds = new Map(stores.map((store) => [store.code, store.id]));

    const result = await prisma.advertisingExpense.createMany({
      data: parsed.map((item) => ({
        date: item.date,
        storeId: storeIds.get(item.storeCode) ?? null,
        storeName: item.storeName,
        platform: item.platform,
        source: item.source,
        amount: item.amount,
        currency: item.currency,
        description: item.description,
        fileName,
        fileHash,
      })),
    });

    return {
      fileName,
      fileHash,
      sheetName: '06.2026',
      recordsImported: result.count,
      summary: await this.summary(),
    };
  }

  async list(storeId?: number | null) {
    const data = await prisma.advertisingExpense.findMany({
      where: storeId ? { storeId } : undefined,
      orderBy: [{ date: 'desc' }, { storeName: 'asc' }, { source: 'asc' }],
      take: 500,
    });

    return { data };
  }

  async summary(storeId?: number | null) {
    const rows = await prisma.advertisingExpense.groupBy({
      by: ['storeName', 'source'],
      where: storeId ? { storeId } : undefined,
      _sum: { amount: true },
    });

    const byStore: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let totalAds = 0;

    for (const row of rows) {
      const amount = Number(row._sum.amount ?? 0);
      totalAds += amount;
      byStore[row.storeName] = (byStore[row.storeName] ?? 0) + amount;
      bySource[row.source] = (bySource[row.source] ?? 0) + amount;
    }

    return {
      data: {
        totalAds,
        statusAds: byStore.Status ?? 0,
        dosstoreAds: byStore.Dosstore ?? 0,
        bySource,
        byStore,
      },
    };
  }
}

export const adsService = new AdsService();
