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

export class AdsImportError extends Error {
  constructor(
    public readonly code: 'WRONG_FILE' | 'SHEET_NOT_FOUND' | 'NO_ADS_ROWS' | 'ADS_PARSE_ERROR',
    message: string,
    public readonly statusCode = 400
  ) {
    super(message);
    this.name = 'AdsImportError';
  }
}

export function calculateAdsFileHash(fileBuffer: Buffer) {
  return createHash('sha256').update(fileBuffer).digest('hex');
}

export function parseAdvertisingExpenses(fileBuffer: Buffer): ParsedAdvertisingExpense[] {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
  } catch {
    throw new AdsImportError('WRONG_FILE', 'File is not a valid XLS or XLSX workbook');
  }

  const sheetName = workbook.SheetNames.find((name) => normalize(name) === ADS_SHEET_NAME);
  const sheet = sheetName ? workbook.Sheets[sheetName] : null;

  if (!sheet) {
    throw new AdsImportError('SHEET_NOT_FOUND', `Sheet "${ADS_SHEET_NAME}" not found`);
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });
  const expenses: ParsedAdvertisingExpense[] = [];
  let recognizedBlocks = 0;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const title = findBlockTitle(rows[rowIndex]);
    const block = BLOCKS[title];
    if (!block) continue;
    recognizedBlocks += 1;

    const dateMetric = findMetricRow(rows, rowIndex + 1, 'Дата');
    const amountMetric = findMetricRow(rows, rowIndex + 1, 'Сумма затрат');
    if (!dateMetric) {
      throw parseError(title, rowIndex, 'row "Дата" not found');
    }
    if (!amountMetric) {
      throw parseError(title, rowIndex, 'row "Сумма затрат" not found');
    }

    const columnCount = Math.max(dateMetric.row.length, amountMetric.row.length);
    for (let column = dateMetric.labelColumn + 1; column < columnCount; column += 1) {
      const date = parseDate(dateMetric.row[column]);
      if (!date) continue;

      const amountValue = amountMetric.row[column];
      const amount = parseAmount(amountValue);
      if (amount === null && text(amountValue)) {
        throw parseError(title, amountMetric.rowIndex, `invalid amount in column ${column + 1}`);
      }
      if (amount === null || amount <= 0) continue;

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
    const suffix = recognizedBlocks === 0 ? ': supported blocks were not found' : '';
    throw new AdsImportError(
      'NO_ADS_ROWS',
      `No advertising expense rows found in sheet "${ADS_SHEET_NAME}"${suffix}`,
      422
    );
  }

  return expenses;
}

function findMetricRow(rows: unknown[][], start: number, metric: string) {
  for (let index = start; index < Math.min(rows.length, start + 12); index += 1) {
    if (findBlockTitle(rows[index])) return null;
    const labelColumn = rows[index]?.findIndex((cell) => normalize(cell) === metric) ?? -1;
    if (labelColumn >= 0) {
      return { row: rows[index], rowIndex: index, labelColumn };
    }
  }
  return null;
}

function parseDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    return parsed ? new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)) : null;
  }

  const valueText = text(value);
  const ruMatch = valueText.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ruMatch) {
    return utcDate(Number(ruMatch[3]), Number(ruMatch[2]), Number(ruMatch[1]));
  }
  const isoMatch = valueText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return utcDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }
  const slashMatch = valueText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return utcDate(Number(slashMatch[3]), Number(slashMatch[1]), Number(slashMatch[2]));
  }
  return null;
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

function normalize(value: unknown) {
  return text(value).replace(/\s+/g, ' ');
}

function findBlockTitle(row: unknown[] | undefined) {
  if (!row) return '';
  return row.map(normalize).find((value) => BLOCKS[value]) ?? '';
}

function utcDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseError(block: string, rowIndex: number, detail: string) {
  return new AdsImportError(
    'ADS_PARSE_ERROR',
    `Ads parse error in block "${block}", row ${rowIndex + 1}: ${detail}`,
    422
  );
}
