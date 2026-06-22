interface ParsedAdExpense {
    date: string;
    storeCode: string;
    channel: string;
    campaignName: string;
    amount: number;
}
/**
 * SheetsParserService — парсинг строк из Google Sheets в expenses
 *
 * Ожидаемая структура таблицы:
 * | Дата       | Магазин  | Канал     | Кампания       | Сумма  |
 * |------------|----------|-----------|----------------|--------|
 * | 2024-01-15 | dosstore | Instagram | Winter Sale    | 15000  |
 * | 2024-01-15 | status   | TikTok    | New Collection | 12000  |
 *
 * TODO: Адаптировать под реальную структуру таблицы
 */
declare class SheetsParserService {
    parseRow(row: any[]): ParsedAdExpense | null;
    syncAdExpenses(): Promise<{
        processed: number;
        failed: number;
    }>;
}
export declare const sheetsParserService: SheetsParserService;
export {};
//# sourceMappingURL=sheets-parser.service.d.ts.map