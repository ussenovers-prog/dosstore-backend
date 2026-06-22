"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheetsParserService = void 0;
const prisma_js_1 = __importDefault(require("../../utils/prisma.js"));
const google_sheets_service_js_1 = require("./google-sheets.service.js");
const import_log_service_js_1 = require("../import/import-log.service.js");
const client_1 = require("@prisma/client");
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
class SheetsParserService {
    parseRow(row) {
        if (!row || row.length < 5)
            return null;
        const [date, storeCode, channel, campaignName, amountStr] = row;
        if (!date || !storeCode || !amountStr)
            return null;
        const amount = parseFloat(String(amountStr).replace(/[^\d.-]/g, ''));
        if (isNaN(amount))
            return null;
        return {
            date: String(date),
            storeCode: String(storeCode).toLowerCase(),
            channel: String(channel),
            campaignName: String(campaignName || ''),
            amount,
        };
    }
    async syncAdExpenses() {
        try {
            const rows = await google_sheets_service_js_1.googleSheetsService.fetchAdExpenses();
            if (rows.length === 0) {
                console.log('[SheetsParser] No data fetched from Google Sheets');
                return { processed: 0, failed: 0 };
            }
            // Skip header row
            const dataRows = rows.slice(1);
            let processed = 0;
            let failed = 0;
            for (const row of dataRows) {
                const parsed = this.parseRow(row);
                if (!parsed) {
                    failed++;
                    continue;
                }
                // Resolve store
                const store = await prisma_js_1.default.store.findUnique({
                    where: { code: parsed.storeCode },
                });
                if (!store) {
                    console.warn(`[SheetsParser] Store not found: ${parsed.storeCode}`);
                    failed++;
                    continue;
                }
                // Upsert expense (avoid duplicates by date + store + channel + campaign)
                await prisma_js_1.default.expense.create({
                    data: {
                        storeId: store.id,
                        category: 'target_ads',
                        expenseDate: new Date(parsed.date),
                        amount: parsed.amount,
                        channel: parsed.channel,
                        campaignName: parsed.campaignName,
                        source: 'google_sheets',
                    },
                });
                processed++;
            }
            // Log import
            await import_log_service_js_1.importLogService.log({
                sourceType: client_1.ImportSource.google_sheets,
                fileName: 'ad_expenses_sync',
                status: failed === 0 ? 'success' : 'partial',
                recordsProcessed: processed,
                recordsFailed: failed,
            });
            console.log(`[SheetsParser] Sync complete: ${processed} processed, ${failed} failed`);
            return { processed, failed };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[SheetsParser] Sync failed:', errorMessage);
            await import_log_service_js_1.importLogService.log({
                sourceType: client_1.ImportSource.google_sheets,
                fileName: 'ad_expenses_sync',
                status: 'error',
                recordsProcessed: 0,
                recordsFailed: 0,
                errorMessage,
            });
            return { processed: 0, failed: 0 };
        }
    }
}
exports.sheetsParserService = new SheetsParserService();
//# sourceMappingURL=sheets-parser.service.js.map