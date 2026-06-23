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

class BeksarService {
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
    });
  }

  async importStatusInventory(fileName: string, fileBuffer: Buffer) {
    const fileHash = calculateFileHash(fileBuffer);
    await this.assertNotImported(fileHash, STATUS_STORE_ID, STATUS_INVENTORY_SOURCE);

    const parsed = parseInventoryFile(fileBuffer);
    if (parsed.items.length === 0) {
      throw new Error('No inventory rows found in file');
    }

    return prisma.$transaction(async (tx) => {
      const importLog = await tx.importLog.create({
        data: {
          sourceType: STATUS_INVENTORY_SOURCE,
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

      for (const item of parsed.items) {
        try {
          await this.upsertInventoryItem(tx, item);
          recordsProcessed += 1;
        } catch (error) {
          recordsFailed += 1;
          console.error('[Beksar] Failed to import inventory row', item.rowNumber, error);
        }
      }

      const status = this.resolveStatus(recordsProcessed, recordsFailed);
      const errorMessage = recordsFailed > 0 ? `${recordsFailed} inventory rows failed` : null;

      await tx.importLog.update({
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
    });
  }

  private async assertNotImported(fileHash: string, storeId: number, sourceType: string) {
    const existing = await prisma.importLog.findFirst({
      where: {
        fileHash,
        storeId,
        sourceType,
        status: { in: ['success', 'partial'] },
      },
      select: { id: true },
    });

    if (existing) throw new DuplicateImportError();
  }

  private async upsertSale(tx: PrismaTransaction, sale: ParsedBeksarSale, fileHash: string) {
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

  private async upsertInventoryItem(tx: PrismaTransaction, item: ParsedBeksarInventoryItem) {
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

  private async upsertProduct(tx: PrismaTransaction, product: ProductInput) {
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
}

interface ProductInput {
  article: string;
  barcode: string | null;
  name: string;
  category: string | null;
  purchasePrice: number | null;
  retailPrice: number | null;
}

type PrismaTransaction = Prisma.TransactionClient;

export const beksarService = new BeksarService();
