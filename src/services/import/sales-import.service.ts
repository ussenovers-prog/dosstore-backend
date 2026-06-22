import prisma from '../../../utils/prisma.js';
import {
  IImportService,
  ParsedRecord,
  ValidationResult,
  ImportResult,
  ImportMeta,
} from './interfaces/import-service.interface.js';

/**
 * SalesImportService — парсит Sales.xml из Beksar POS
 *
 * TODO: Реализовать парсинг XML после получения примера структуры
 *
 * Ожидаемая структура XML:
 * <Sales>
 *   <Sale>
 *     <DocId>...</DocId>
 *     <Date>2024-01-15</Date>
 *     <ProductId>...</ProductId>
 *     <ProductName>...</ProductName>
 *     <Quantity>2</Quantity>
 *     <UnitPrice>5000</UnitPrice>
 *     <TotalAmount>10000</TotalAmount>
 *     <Discount>0</Discount>
 *     <PaymentType>Card</PaymentType>
 *   </Sale>
 * </Sales>
 */
class SalesImportService implements IImportService {
  async parse(buffer: Buffer): Promise<ParsedRecord[]> {
    // TODO: Implement XML parsing
    // const xml = buffer.toString('utf-8');
    // const parsed = parseXML(xml);
    // return parsed.map(node => ({ ... }));

    console.warn('[SalesImportService] parse() not implemented yet');
    return [];
  }

  validate(records: ParsedRecord[]): ValidationResult {
    const valid: ParsedRecord[] = [];
    const errors: Array<{ record: ParsedRecord; error: string }> = [];

    for (const record of records) {
      // TODO: Implement validation logic
      // if (!record.docId) errors.push({ record, error: 'Missing docId' });
      // else valid.push(record);
      valid.push(record);
    }

    return { valid, errors };
  }

  async import(records: ParsedRecord[], meta: ImportMeta): Promise<ImportResult> {
    try {
      // TODO: Implement database import
      // 1. Upsert products (if new)
      // 2. Insert sales records

      // Placeholder:
      // for (const record of records) {
      //   await prisma.product.upsert({ ... });
      //   await prisma.sale.create({ ... });
      // }

      // Log import
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

export const salesImportService = new SalesImportService();
