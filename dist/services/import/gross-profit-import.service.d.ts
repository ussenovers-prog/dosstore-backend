import { IImportService, ParsedRecord, ValidationResult, ImportResult, ImportMeta } from './interfaces/import-service.interface.js';
/**
 * GrossProfitImportService — парсит GrossProfit.xml из Beksar POS
 *
 * TODO: Реализовать парсинг XML после получения примера структуры
 */
declare class GrossProfitImportService implements IImportService {
    parse(buffer: Buffer): Promise<ParsedRecord[]>;
    validate(records: ParsedRecord[]): ValidationResult;
    import(records: ParsedRecord[], meta: ImportMeta): Promise<ImportResult>;
}
export declare const grossProfitImportService: GrossProfitImportService;
export {};
//# sourceMappingURL=gross-profit-import.service.d.ts.map