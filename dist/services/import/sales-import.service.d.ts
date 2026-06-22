import { IImportService, ParsedRecord, ValidationResult, ImportResult, ImportMeta } from './interfaces/import-service.interface.js';
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
declare class SalesImportService implements IImportService {
    parse(buffer: Buffer): Promise<ParsedRecord[]>;
    validate(records: ParsedRecord[]): ValidationResult;
    import(records: ParsedRecord[], meta: ImportMeta): Promise<ImportResult>;
}
export declare const salesImportService: SalesImportService;
export {};
//# sourceMappingURL=sales-import.service.d.ts.map