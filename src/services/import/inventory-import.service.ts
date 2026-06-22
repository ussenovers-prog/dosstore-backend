import prisma from '../../../utils/prisma.js';
import {
  IImportService,
  ParsedRecord,
  ValidationResult,
  ImportResult,
  ImportMeta,
} from './interfaces/import-service.interface.js';

/**
 * InventoryImportService — парсит Inventory.xml из Beksar POS
 *
 * TODO: Реализовать парсинг XML после получения примера структуры
 */
class InventoryImportService implements IImportService {
  async parse(buffer: Buffer): Promise<ParsedRecord[]> {
    console.warn('[InventoryImportService] parse() not implemented yet');
    return [];
  }

  validate(records: ParsedRecord[]): ValidationResult {
    const valid: ParsedRecord[] = [];
    const errors: Array<{ record: ParsedRecord; error: string }> = [];

    for (const record of records) {
      valid.push(record);
    }

    return { valid, errors };
  }

  async import(records: ParsedRecord[], meta: ImportMeta): Promise<ImportResult> {
    try {
      // TODO: Implement database import
      // 1. Upsert products
      // 2. Insert inventory snapshot

      await prisma.importLog.create({
        data: {
          sourceType: meta.sourceType,
          storeId: meta.storeId,
          fileName: meta.fileName,
          status: 'success',
          recordsProcessed: records.length,
          recordsFailed: 0,
        },
      });

      return {
        success: true,
        recordsProcessed: records.length,
        recordsFailed: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await prisma.importLog.create({
        data: {
          sourceType: meta.sourceType,
          storeId: meta.storeId,
          fileName: meta.fileName,
          status: 'error',
          recordsProcessed: 0,
          recordsFailed: records.length,
          errorMessage,
        },
      });

      return {
        success: false,
        recordsProcessed: 0,
        recordsFailed: records.length,
        errorMessage,
      };
    }
  }
}

export const inventoryImportService = new InventoryImportService();
