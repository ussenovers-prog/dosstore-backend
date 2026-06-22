import { IImportService } from './interfaces/import-service.interface.js';
import { ImportSource } from '@prisma/client';
import { salesImportService } from './sales-import.service.js';
import { arrivalImportService } from './arrival-import.service.js';
import { inventoryImportService } from './inventory-import.service.js';
import { grossProfitImportService } from './gross-profit-import.service.js';

/**
 * ImportFactory — фабрика для получения нужного ImportService по типу источника
 *
 * Расширяемая архитектура: для добавления нового типа импорта
 * нужно создать новый класс, реализующий IImportService,
 * и зарегистрировать его здесь.
 */
class ImportFactory {
  private handlers: Map<ImportSource, IImportService> = new Map();

  constructor() {
    // Register built-in handlers
    this.register(ImportSource.ftp_beksar_sales, salesImportService);
    this.register(ImportSource.ftp_beksar_arrival, arrivalImportService);
    this.register(ImportSource.ftp_beksar_inventory, inventoryImportService);
    this.register(ImportSource.ftp_beksar_gross_profit, grossProfitImportService);
  }

  register(source: ImportSource, service: IImportService): void {
    this.handlers.set(source, service);
  }

  get(source: ImportSource): IImportService | undefined {
    return this.handlers.get(source);
  }

  has(source: ImportSource): boolean {
    return this.handlers.has(source);
  }

  getSupportedSources(): ImportSource[] {
    return Array.from(this.handlers.keys());
  }
}

export const importFactory = new ImportFactory();
