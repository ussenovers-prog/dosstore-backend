import prisma from '../../utils/prisma.js';
import { env } from '../../config/env.js';
import {
  AdsImportError,
  calculateAdsFileHash,
  calculateAdsRowsHash,
  googleSheetCsvUrl,
  googleSheetSourcePrefix,
  parseAdvertisingCsv,
  parseAdvertisingWorkbook,
  ParsedAdvertisingExpense,
  ParsedAdvertisingSheet,
} from './ads.parser.js';
import { displayStoreName } from '../../utils/storeDisplay.js';

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

    const parsed = parseAdvertisingWorkbook(fileBuffer);
    const result = await this.persistParsed(fileName, fileHash, parsed);
    await this.logImport('ads_file_import', fileName, fileHash, result.recordsImported, result.recordsSkipped);

    return {
      fileName,
      fileHash,
      sheetFormat: parsed.format,
      detectedColumns: parsed.columns,
      ...result,
      summary: await this.summary(),
    };
  }

  async syncGoogleSheet() {
    const spreadsheetId = env.GOOGLE_SHEETS_AD_SPREADSHEET_ID;
    const gid = env.GOOGLE_SHEETS_AD_GID;
    const url = googleSheetCsvUrl(spreadsheetId, gid);
    let response;

    try {
      response = await fetch(url);
    } catch (error) {
      throw new AdsImportError(
        'SHEET_FETCH_FAILED',
        `Failed to fetch Google Sheet CSV export: ${error instanceof Error ? error.message : 'unknown error'}`,
        502
      );
    }

    if (!response.ok) {
      throw new AdsImportError(
        'SHEET_FETCH_FAILED',
        `Google Sheet CSV export returned ${response.status}. Share the sheet as "Anyone with the link can view" or provide a CSV/XLSX export.`,
        response.status === 403 || response.status === 404 ? 400 : 502
      );
    }

    const csvText = await response.text();
    const fileName = `google-sheet-ad-expenses-${gid}.csv`;
    const parsed = parseAdvertisingCsv(csvText, googleSheetSourcePrefix(spreadsheetId, gid));
    const fileHash = calculateAdsRowsHash(parsed.expenses.map((expense) => [
      expense.sourceKey,
      expense.date.toISOString(),
      expense.storeCode,
      expense.platform,
      expense.source,
      expense.campaignName,
      expense.amount,
    ]));

    const result = await this.persistParsed(fileName, fileHash, parsed);
    await this.logImport('google_sheets_ads', fileName, fileHash, result.recordsImported, result.recordsSkipped);

    return {
      fileName,
      fileHash,
      spreadsheetId,
      gid,
      sheetFormat: parsed.format,
      detectedColumns: parsed.columns,
      ...result,
      summary: await this.summary(),
    };
  }

  async list(storeId?: number | null) {
    const data = await prisma.advertisingExpense.findMany({
      where: storeId ? { storeId } : undefined,
      orderBy: [{ date: 'desc' }, { storeName: 'asc' }, { source: 'asc' }],
      take: 500,
    });

    return { data: data.map((item) => ({ ...item, storeName: displayStoreName({ id: item.storeId, name: item.storeName }) })) };
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
      const storeName = displayStoreName(row.storeName);
      byStore[storeName] = (byStore[storeName] ?? 0) + amount;
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

  private async persistParsed(fileName: string, fileHash: string, parsed: ParsedAdvertisingSheet) {
    const stores = await prisma.store.findMany({
      where: { code: { in: [...new Set(parsed.expenses.map((item) => item.storeCode))] } },
      select: { id: true, code: true },
    });
    const storeIds = new Map(stores.map((store) => [store.code, store.id]));

    const rows = parsed.expenses.map((item) => this.toCreateInput(fileName, fileHash, item, storeIds));
    const beforeCount = await this.countExistingSourceKeys(parsed.expenses);
    const rowsWithSourceKey = rows.filter((row) => row.sourceKey);
    const rowsWithoutSourceKey = rows.filter((row) => !row.sourceKey);

    if (rowsWithSourceKey.length > 0) {
      await prisma.$transaction(
        rowsWithSourceKey.map((row) =>
          prisma.advertisingExpense.upsert({
            where: { sourceKey: row.sourceKey! },
            create: row,
            update: {
              date: row.date,
              storeId: row.storeId,
              storeName: row.storeName,
              platform: row.platform,
              source: row.source,
              campaignName: row.campaignName,
              amount: row.amount,
              currency: row.currency,
              description: row.description,
              fileName: row.fileName,
              fileHash: row.fileHash,
            },
          })
        )
      );
    }

    const createdWithoutSourceKey = rowsWithoutSourceKey.length > 0
      ? await prisma.advertisingExpense.createMany({ data: rowsWithoutSourceKey, skipDuplicates: true })
      : { count: 0 };

    const recordsCreatedOrUpdated = rowsWithSourceKey.length + createdWithoutSourceKey.count;

    return {
      recordsFound: parsed.expenses.length,
      recordsImported: recordsCreatedOrUpdated - beforeCount,
      recordsUpdated: beforeCount,
      recordsSkipped: rowsWithoutSourceKey.length - createdWithoutSourceKey.count,
      duplicateRowsBeforeImport: beforeCount,
    };
  }

  private toCreateInput(
    fileName: string,
    fileHash: string,
    item: ParsedAdvertisingExpense,
    storeIds: Map<string, number>
  ) {
    return {
      date: item.date,
      storeId: storeIds.get(item.storeCode) ?? null,
      storeName: item.storeName,
      platform: item.platform,
      source: item.source,
      campaignName: item.campaignName,
      amount: item.amount,
      currency: item.currency,
      description: item.description,
      fileName,
      fileHash,
      sourceKey: item.sourceKey ?? null,
    };
  }

  private async countExistingSourceKeys(expenses: ParsedAdvertisingExpense[]) {
    const sourceKeys = expenses.map((expense) => expense.sourceKey).filter((key): key is string => Boolean(key));
    if (sourceKeys.length === 0) return 0;

    return prisma.advertisingExpense.count({
      where: { sourceKey: { in: sourceKeys } },
    });
  }

  private async logImport(
    sourceType: string,
    fileName: string,
    fileHash: string,
    recordsImported: number,
    recordsSkipped: number
  ) {
    await prisma.importLog.create({
      data: {
        sourceType,
        storeId: null,
        fileName,
        fileHash,
        status: recordsSkipped > 0 && recordsImported > 0 ? 'partial' : 'success',
        recordsProcessed: recordsImported,
        recordsFailed: 0,
        errorMessage: recordsSkipped > 0 ? `${recordsSkipped} duplicate advertising rows skipped` : null,
      },
    });
  }
}

export const adsService = new AdsService();
