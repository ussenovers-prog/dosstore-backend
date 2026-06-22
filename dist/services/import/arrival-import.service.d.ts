import { IImportService, ParsedRecord, ValidationResult, ImportResult, ImportMeta } from './interfaces/import-service.interface.js';
/**
 * ArrivalImportService — парсит Arrival.xml из Beksar POS
 *
 * TODO: Реализовать парсинг XML после получения примера структуры
 */
declare class ArrivalImportService implements IImportService {
    parse(buffer: Buffer): Promise<ParsedRecord[]>;
    validate(records: ParsedRecord[]): ValidationResult;
    import(records: ParsedRecord[], meta: ImportMeta): Promise<ImportResult>;
}
export declare const arrivalImportService: ArrivalImportService;
export {};
//# sourceMappingURL=arrival-import.service.d.ts.map