import prisma from '../../utils/prisma.js';
import { Prisma } from '@prisma/client';
import {
  STATUS_INVENTORY_SOURCE,
  STATUS_SALES_SOURCE,
  STATUS_STORE_ID,
  calculateFileHash,
  parseInventoryFile,
  parseSalesFile,
  ParsedBeksarInventoryItem,
  ParsedBeksarSale,
} from './beksar.parser.js';

export class DuplicateImportError extends Error {
  constructor() {
    super('File already imported for Status');
    this.name = 'DuplicateImportError';
  }
}

export type BeksarAutoType = 'sales' | 'inventory' | 'unknown';
export type BeksarAutoStore = 'status' | 'dosstore' | 'unknown';

interface AnalyzeOptions {
  type?: BeksarAutoType;
  storeId?: number;
}

type SalesParseAttempt = {
  data: ReturnType<typeof parseSalesFile> | null;
  error: string | null;
};

type InventoryParseAttempt = {
  data: ReturnType<typeof parseInventoryFile> | null;
  error: string | null;
};

type DuplicateImport = {
  id: number;
  fileName: string;
  importedAt: Date;
} | null;

class BeksarService {
  async analyzeFile(fileName: string, fileBuffer: Buffer, options: AnalyzeOptions = {}) {
    const fileHash = calculateFileHash(fileBuffer);
    const salesParse = this.tryParseSales(fileBuffer);
    const inventoryParse = this.tryParseInventory(fileBuffer);
    const detectedType = options.type && options.type !== 'unknown'
      ? options.type
      : this.detectType(salesParse, inventoryParse);
    const detectedStore = this.detectStore(fileName, options.storeId);
    const sourceType = this.sourceTypeFor(detectedType);
    const storeId = this.storeIdFor(detectedStore);
    const duplicate = sourceType && storeId
      ? await this.findDuplicateImport(fileHash, storeId, sourceType)
      : null;

    return {
      fileName,
      detectedType,
      detectedStore,
      detectedDate: detectedType === 'sales'
        ? salesParse.data?.reportDate ?? null
        : detectedType === 'inventory'
          ? inventoryParse.data?.snapshotDate ?? null
          : null,
      duplicateStatus: this.getDuplicateStatus(duplicate, detectedType, detectedStore),
      rows: {
        sales: salesParse.data?.sales.length ?? 0,
        inventory: inventoryParse.data?.items.length ?? 0,
      },
      needsTypeSelection: detectedType === 'unknown',
      needsStoreSelection: detectedStore === 'unknown',
      errors: {
        sales: salesParse.error,
        inventory: inventoryParse.error,
      },
    };
  }

  async importStatusSales(fileName: string, fileBuffer: Buffer) {
    const fileHash = calculateFileHash(fileBuffer);
    await this.assertNotImported(fileHash, STATUS_STORE_ID, STATUS_SALES_SOURCE);

    const parsed = parseSalesFile(fileBuffer);
    if (parsed.sales.length === 0) {
      throw new Error('No sales rows found in file');
    }

    return prisma.$transaction(async (tx) => {
      const importLog = await tx.importLog.create({
        data: {
          sourceType: STATUS_SALES_SOURCE,
          storeId: STATUS_STORE_ID,
          fileName,
          fileHash,
          status: 'success',
          recordsProcessed: 0,
          recordsFailed: 0,
        },
      });

      let recordsProcessed = 0;
      let recordsFailed = 0;

      for (const sale of parsed.sales) {
        try {
          await this.upsertSale(tx, sale, fileHash);
          recordsProcessed += 1;
        } catch (error) {
          recordsFailed += 1;
          console.error('[Beksar] Failed to import sale row', sale.rowNumber, error);
        }
      }

      const status = this.resolveStatus(recordsProcessed, recordsFailed);
      const errorMessage = recordsFailed > 0 ? `${recordsFailed} sales rows failed` : null;

      await tx.importLog.update({
        where: { id: importLog.id },
        data: { status, recordsProcessed, recordsFailed, errorMessage },
      });

      return {
        fileName,
        fileHash,
        storeId: STATUS_STORE_ID,
        sourceType: STATUS_SALES_SOURCE,
        reportDate: parsed.reportDate,
        recordsProcessed,
        recordsFailed,
        status,
      };
    }, { maxWait: 10000, timeout: 120000 });
  }

  async importStatusInventory(fileName: string, fileBuffer: Buffer) {
    const fileHash = calculateFileHash(fileBuffer);
    await this.assertNotImported(fileHash, STATUS_STORE_ID, STATUS_INVENTORY_SOURCE);

    const parsed = parseInventoryFile(fileBuffer, fileName);

    const importLog = await prisma.importLog.create({
      data: {
        sourceType: STATUS_INVENTORY_SOURCE,
        storeId: STATUS_STORE_ID,
        fileName,
        fileHash,
        status: 'processing',
        recordsProcessed: 0,
        recordsFailed: 0,
      },
    });

    let recordsProcessed = 0;
    let recordsFailed = 0;

    for (const item of parsed.items) {
      try {
        await this.upsertInventoryItem(prisma, item);
        recordsProcessed += 1;
      } catch (error) {
        recordsFailed += 1;
        console.error('[Beksar] Failed to import inventory row', item.rowNumber, error);
      }
    }

    const status = this.resolveStatus(recordsProcessed, recordsFailed);
    const errorMessage = recordsFailed > 0 ? `${recordsFailed} inventory rows failed` : null;

    await prisma.importLog.update({
      where: { id: importLog.id },
      data: { status, recordsProcessed, recordsFailed, errorMessage },
    });

    return {
      fileName,
      fileHash,
      storeId: STATUS_STORE_ID,
      sourceType: STATUS_INVENTORY_SOURCE,
      snapshotDate: parsed.snapshotDate,
      recordsProcessed,
      recordsFailed,
      status,
    };
  }

  private async assertNotImported(fileHash: string, storeId: number, sourceType: string) {
    const existing = await this.findDuplicateImport(fileHash, storeId, sourceType);

    if (existing) throw new DuplicateImportError();
  }

  private async findDuplicateImport(fileHash: string, storeId: number, sourceType: string) {
    return prisma.importLog.findFirst({
      where: {
        fileHash,
        storeId,
        sourceType,
        status: { in: ['success', 'partial'] },
      },
      select: { id: true, fileName: true, importedAt: true },
    });
  }

  private async upsertSale(tx: PrismaExecutor, sale: ParsedBeksarSale, fileHash: string) {
    const product = await this.upsertProduct(tx, {
      article: sale.article,
      barcode: sale.barcode,
      name: sale.productName,
      category: sale.category,
      purchasePrice: null,
      retailPrice: sale.unitPrice,
    });

    const beksarDocId = [
      'status-sales',
      fileHash.slice(0, 12),
      sale.rowNumber,
      sale.article,
      sale.saleTime ?? 'no-time',
    ].join(':');

    await tx.sale.upsert({
      where: {
        storeId_beksarDocId_productId: {
          storeId: STATUS_STORE_ID,
          beksarDocId,
          productId: product.id,
        },
      },
      create: {
        storeId: STATUS_STORE_ID,
        productId: product.id,
        beksarDocId,
        saleDate: sale.saleDate,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
        totalAmount: sale.totalAmount,
        discount: sale.discount,
        paymentType: sale.paymentType,
      },
      update: {
        saleDate: sale.saleDate,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
        totalAmount: sale.totalAmount,
        discount: sale.discount,
        paymentType: sale.paymentType,
      },
    });
  }

  private async upsertInventoryItem(tx: PrismaExecutor, item: ParsedBeksarInventoryItem) {
    const product = await this.upsertProduct(tx, {
      article: item.article,
      barcode: item.barcode,
      name: item.productName,
      category: item.category,
      purchasePrice: item.purchasePrice,
      retailPrice: item.salePrice,
    });

    await tx.inventory.upsert({
      where: {
        storeId_productId_snapshotDate: {
          storeId: STATUS_STORE_ID,
          productId: product.id,
          snapshotDate: item.snapshotDate,
        },
      },
      create: {
        storeId: STATUS_STORE_ID,
        productId: product.id,
        snapshotDate: item.snapshotDate,
        quantity: item.quantity,
        totalValue: item.totalValue,
      },
      update: {
        quantity: item.quantity,
        totalValue: item.totalValue,
      },
    });
  }

  private async upsertProduct(tx: PrismaExecutor, product: ProductInput) {
    return tx.product.upsert({
      where: {
        storeId_beksarId: {
          storeId: STATUS_STORE_ID,
          beksarId: product.article,
        },
      },
      create: {
        storeId: STATUS_STORE_ID,
        beksarId: product.article,
        article: product.article,
        barcode: product.barcode,
        name: product.name,
        brand: product.category,
        purchasePrice: product.purchasePrice,
        retailPrice: product.retailPrice,
      },
      update: {
        article: product.article,
        barcode: product.barcode,
        name: product.name,
        brand: product.category,
        purchasePrice: product.purchasePrice ?? undefined,
        retailPrice: product.retailPrice ?? undefined,
      },
    });
  }

  private resolveStatus(recordsProcessed: number, recordsFailed: number) {
    if (recordsFailed === 0) return 'success';
    if (recordsProcessed > 0) return 'partial';
    return 'error';
  }

  private tryParseSales(fileBuffer: Buffer): SalesParseAttempt {
    try {
      return { data: parseSalesFile(fileBuffer), error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Sales parse failed' };
    }
  }

  private tryParseInventory(fileBuffer: Buffer): InventoryParseAttempt {
    try {
      return { data: parseInventoryFile(fileBuffer), error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Inventory parse failed' };
    }
  }

  private detectType(
    salesParse: SalesParseAttempt,
    inventoryParse: InventoryParseAttempt
  ): BeksarAutoType {
    const hasSales = (salesParse.data?.sales.length ?? 0) > 0;
    const hasInventory = (inventoryParse.data?.items.length ?? 0) > 0;

    if (hasSales && !hasInventory) return 'sales';
    if (hasInventory && !hasSales) return 'inventory';
    return 'unknown';
  }

  private detectStore(fileName: string, storeId?: number): BeksarAutoStore {
    if (storeId === STATUS_STORE_ID) return 'status';
    if (storeId === 1) return 'dosstore';

    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('status')) return 'status';
    if (lowerName.includes('dosstore') || lowerName.includes('dos store')) return 'dosstore';
    return 'unknown';
  }

  private sourceTypeFor(type: BeksarAutoType) {
    if (type === 'sales') return STATUS_SALES_SOURCE;
    if (type === 'inventory') return STATUS_INVENTORY_SOURCE;
    return null;
  }

  private storeIdFor(store: BeksarAutoStore) {
    if (store === 'status') return STATUS_STORE_ID;
    if (store === 'dosstore') return 1;
    return null;
  }

  private getDuplicateStatus(
    duplicate: DuplicateImport,
    type: BeksarAutoType,
    store: BeksarAutoStore
  ) {
    if (type === 'unknown' || store === 'unknown') {
      return {
        status: 'unknown',
        message: 'Choose file type and store to check duplicates.',
      };
    }

    if (store === 'dosstore') {
      return {
        status: 'not_configured',
        message: 'Dosstore import not configured yet.',
      };
    }

    if (duplicate) {
      return {
        status: 'duplicate',
        message: 'This Status file was already imported.',
        importLogId: duplicate.id,
        fileName: duplicate.fileName,
        importedAt: duplicate.importedAt,
      };
    }

    return {
      status: 'new',
      message: 'No duplicate import found for Status.',
    };
  }
}

interface ProductInput {
  article: string;
  barcode: string | null;
  name: string;
  category: string | null;
  purchasePrice: number | null;
  retailPrice: number | null;
}

type PrismaExecutor = Pick<Prisma.TransactionClient, 'product' | 'sale' | 'inventory'>;

export const beksarService = new BeksarService();
