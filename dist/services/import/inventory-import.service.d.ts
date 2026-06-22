import { IImportService, ParsedRecord, ValidationResult, ImportResult, ImportMeta } from './interfaces/import-service.interface.js';
/**
 * InventoryImportService — парсит Inventory.xml из Beksar POS
 *
 * TODO: Реализовать парсинг XML после получения примера структуры
 */
declare class InventoryImportService implements IImportService {
    parse(buffer: Buffer): Promise<ParsedRecord[]>;
    validate(records: ParsedRecord[]): ValidationResult;
    import(records: ParsedRecord[], meta: ImportMeta): Promise<ImportResult>;
}
export declare const inventoryImportService: InventoryImportService;
export {};
//# sourceMappingURL=inventory-import.service.d.ts.map