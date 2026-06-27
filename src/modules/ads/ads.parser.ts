import { createHash } from 'crypto';
import * as XLSX from 'xlsx';

const ADS_SHEET_NAME = '06.2026';

const BLOCKS: Record<string, { storeName: string; storeCode: string; source: string }> = {
  Dosstore: { storeName: 'Dosstore', storeCode: 'dosstore', source: 'traffic' },
  'Status трафик': { storeName: 'Status', storeCode: 'status', source: 'traffic' },
  'Dosstore Вовл': { storeName: 'Dosstore', storeCode: 'dosstore', source: 'engagement' },
};

export interface ParsedAdvertisingExpense {
  date: Date;
  storeName: string;
  storeCode: string;
  platform: 'unknown';
  source: string;
  amount: number;
  currency: 'KZT';
  description: string;
}

export function calculateAdsFileHash(fileBuffer: Buffer) {
  return createHash('sha256').update(fileBuffer).digest('hex');
}

export function parseAdvertisingExpenses(fileBuffer: Buffer): ParsedAdvertisingExpense[] {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: false });
  const sheet = workbook.Sheets[ADS_SHEET_NAME];

  if (!sheet) {
    throw new Error(`Sheet "${ADS_SHEET_NAME}" not found`);
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    defval: null,
  });
  const expenses: ParsedAdvertisingExpense[] = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const title = text(rows[rowIndex]?.[0]);
    const block = BLOCKS[title];
    if (!block) continue;

    const dateRow = findMetricRow(rows, rowIndex + 1, 'Дата');
    const amountRow = findMetricRow(rows, rowIndex + 1, 'Сумма затрат');
    if (!dateRow || !amountRow) continue;

    const columnCount = Math.max(dateRow.length, amountRow.length);
    for (let column = 2; column < columnCount; column += 1) {
      const date = parseDate(dateRow[column]);
      const amount = parseAmount(amountRow[column]);
      if (!date || amount === null || amount <= 0) continue;

      expenses.push({
        date,
        storeName: block.storeName,
        storeCode: block.storeCode,
        platform: 'unknown',
        source: block.source,
        amount,
        currency: 'KZT',
        description: title,
      });
    }
  }

  if (expenses.length === 0) {
    throw new Error(`No advertising expenses found in sheet "${ADS_SHEET_NAME}"`);
  }

  return expenses;
}

function findMetricRow(rows: unknown[][], start: number, metric: string) {
  for (let index = start; index < Math.min(rows.length, start + 12); index += 1) {
    const label = text(rows[index]?.[0]);
    if (BLOCKS[label]) return null;
    if (label === metric) return rows[index];
  }
  return null;
}

function parseDate(value: unknown) {
  const match = text(value).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseAmount(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = text(value)
    .replace(/[₸\s\u00a0]/g, '')
    .replace(',', '.');
  if (!normalized) return null;

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function text(value: unknown) {
  return value === null || value === undefined ? '' : String(value).trim();
}
