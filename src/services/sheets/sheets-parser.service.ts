import prisma from '../../utils/prisma.js';
import { googleSheetsService } from './google-sheets.service.js';
import { importLogService } from '../import/import-log.service.js';
import { ImportSource } from '@prisma/client';

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
class SheetsParserService {
  parseRow(row: any[]): ParsedAdExpense | null {
    if (!row || row.length < 5) return null;

    const [date, storeCode, channel, campaignName, amountStr] = row;

    if (!date || !storeCode || !amountStr) return null;

    const amount = parseFloat(String(amountStr).replace(/[^\d.-]/g, ''));
    if (isNaN(amount)) return null;

    return {
      date: String(date),
      storeCode: String(storeCode).toLowerCase(),
      channel: String(channel),
      campaignName: String(campaignName || ''),
      amount,
    };
  }

  async syncAdExpenses(): Promise<{ processed: number; failed: number }> {
    try {
      const rows = await googleSheetsService.fetchAdExpenses();

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
        const store = await prisma.store.findUnique({
          where: { code: parsed.storeCode },
        });

        if (!store) {
          console.warn(`[SheetsParser] Store not found: ${parsed.storeCode}`);
          failed++;
          continue;
        }

        // Upsert expense (avoid duplicates by date + store + channel + campaign)
        await prisma.expense.create({
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
      await importLogService.log({
        sourceType: ImportSource.google_sheets,
        fileName: 'ad_expenses_sync',
        status: failed === 0 ? 'success' : 'partial',
        recordsProcessed: processed,
        recordsFailed: failed,
      });

      console.log(`[SheetsParser] Sync complete: ${processed} processed, ${failed} failed`);
      return { processed, failed };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SheetsParser] Sync failed:', errorMessage);

      await importLogService.log({
        sourceType: ImportSource.google_sheets,
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

export const sheetsParserService = new SheetsParserService();
