import { createHash } from 'crypto';
import * as XLSX from 'xlsx';

const DEFAULT_ADS_SHEET_NAME = '06.2026';
const GOOGLE_ADS_SPREADSHEET_ID = '1WK4x-u-m9rMXMhtGHAk1KHd4zatgppwMpHjwv9RNZZQ';
const GOOGLE_ADS_GID = '2053740277';

const BLOCKS: Record<string, { storeName: string; storeCode: string; source: string; platform: string }> = {
  Dosstore: { storeName: 'Dosstore', storeCode: 'dosstore', source: 'traffic', platform: 'unknown' },
  'Status трафик': { storeName: 'Status', storeCode: 'status', source: 'traffic', platform: 'unknown' },
  'Dosstore Вовл': { storeName: 'Dosstore', storeCode: 'dosstore', source: 'engagement', platform: 'unknown' },
};

type SheetRow = unknown[];

export interface ParsedAdvertisingExpense {
  rowNumber: number;
  date: Date;
  storeName: string;
  storeCode: string;
  platform: string;
  source: string;
  campaignName: string | null;
  amount: number;
  currency: 'KZT';
  description: string;
  sourceKey?: string;
}

export interface ParsedAdvertisingSheet {
  expenses: ParsedAdvertisingExpense[];
  columns: {
    date: string | null;
    store: string | null;
    platform: string | null;
    campaign: string | null;
    amount: string | null;
  };
  format: 'metric_blocks' | 'table';
}

export class AdsImportError extends Error {
  constructor(
    public readonly code: 'WRONG_FILE' | 'SHEET_NOT_FOUND' | 'NO_ADS_ROWS' | 'ADS_PARSE_ERROR' | 'SHEET_FETCH_FAILED',
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

export function calculateAdsRowsHash(rows: SheetRow[]) {
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex');
}

export function parseAdvertisingExpenses(fileBuffer: Buffer): ParsedAdvertisingExpense[] {
  return parseAdvertisingWorkbook(fileBuffer).expenses;
}

export function parseAdvertisingWorkbook(fileBuffer: Buffer, sheetName = DEFAULT_ADS_SHEET_NAME): ParsedAdvertisingSheet {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
  } catch {
    throw new AdsImportError('WRONG_FILE', 'File is not a valid XLS or XLSX workbook');
  }

  const resolvedSheetName = workbook.SheetNames.find((name) => normalize(name) === sheetName) ?? workbook.SheetNames[0];
  const sheet = resolvedSheetName ? workbook.Sheets[resolvedSheetName] : null;

  if (!sheet) {
    throw new AdsImportError('SHEET_NOT_FOUND', `Sheet "${sheetName}" not found`);
  }

  const rows = XLSX.utils.sheet_to_json<SheetRow>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });

  return parseAdvertisingRows(rows);
}

export function parseAdvertisingCsv(csvText: string, sourceKeyPrefix = googleSheetSourcePrefix()): ParsedAdvertisingSheet {
  const workbook = XLSX.read(csvText, { type: 'string', raw: true, cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json<SheetRow>(workbook.Sheets[sheetName], {
    header: 1,
    raw: true,
    defval: null,
  });

  return parseAdvertisingRows(rows, sourceKeyPrefix);
}

export function parseAdvertisingRows(rows: SheetRow[], sourceKeyPrefix?: string): ParsedAdvertisingSheet {
  const table = parseTabularRows(rows, sourceKeyPrefix);
  if (table.expenses.length > 0) return table;

  const blocks = parseMetricBlockRows(rows, sourceKeyPrefix);
  if (blocks.expenses.length > 0) return blocks;

  throw new AdsImportError('NO_ADS_ROWS', 'No advertising expense rows found in sheet', 422);
}

export function googleSheetCsvUrl(spreadsheetId = GOOGLE_ADS_SPREADSHEET_ID, gid = GOOGLE_ADS_GID) {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
}

export function googleSheetSourcePrefix(spreadsheetId = GOOGLE_ADS_SPREADSHEET_ID, gid = GOOGLE_ADS_GID) {
  return `google-sheet:${spreadsheetId}:${gid}`;
}

function parseMetricBlockRows(rows: SheetRow[], sourceKeyPrefix?: string): ParsedAdvertisingSheet {
  const expenses: ParsedAdvertisingExpense[] = [];
  let recognizedBlocks = 0;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const title = findBlockTitle(rows[rowIndex]);
    const block = BLOCKS[title];
    if (!block) continue;
    recognizedBlocks += 1;

    const dateMetric = findMetricRow(rows, rowIndex + 1, ['Дата']);
    const amountMetric = findMetricRow(rows, rowIndex + 1, ['Сумма затрат', 'Расход', 'Затраты', 'Spend']);
    if (!dateMetric) throw parseError(title, rowIndex, 'row "Дата" not found');
    if (!amountMetric) throw parseError(title, rowIndex, 'row "Сумма затрат" not found');

    const columnCount = Math.max(dateMetric.row.length, amountMetric.row.length);
    for (let column = dateMetric.labelColumn + 1; column < columnCount; column += 1) {
      if (normalize(dateMetric.row[column]).toLowerCase() === 'общий') continue;

      const date = parseDate(dateMetric.row[column]);
      if (!date) continue;

      const amountValue = amountMetric.row[column];
      const amount = parseAmount(amountValue);
      if (amount === null && text(amountValue)) {
        throw parseError(title, amountMetric.rowIndex, `invalid amount in column ${column + 1}`);
      }
      if (amount === null || amount <= 0) continue;

      const sourceKey = sourceKeyPrefix
        ? makeSourceKey(sourceKeyPrefix, [dateKey(date), block.storeCode, block.platform, block.source, title])
        : undefined;

      expenses.push({
        rowNumber: amountMetric.rowIndex + 1,
        date,
        storeName: block.storeName,
        storeCode: block.storeCode,
        platform: block.platform,
        source: block.source,
        campaignName: null,
        amount,
        currency: 'KZT',
        description: title,
        sourceKey,
      });
    }
  }

  if (expenses.length === 0 && recognizedBlocks > 0) {
    throw new AdsImportError('NO_ADS_ROWS', 'No positive advertising spend values found in metric blocks', 422);
  }

  return {
    expenses,
    columns: {
      date: 'Дата',
      store: 'block title',
      platform: 'block title',
      campaign: null,
      amount: 'Сумма затрат',
    },
    format: 'metric_blocks',
  };
}

function parseTabularRows(rows: SheetRow[], sourceKeyPrefix?: string): ParsedAdvertisingSheet {
  const header = findTabularHeader(rows);
  if (!header) {
    return emptyTableResult();
  }

  const expenses: ParsedAdvertisingExpense[] = [];
  for (let rowIndex = header.rowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (!row || row.every((cell) => !text(cell))) continue;

    const date = parseDate(row[header.columns.date]);
    const amount = parseAmount(row[header.columns.amount]);
    const storeValue = normalize(row[header.columns.store]);
    if (!date || amount === null || amount <= 0 || !storeValue) continue;

    const store = detectStore(storeValue);
    const platform = header.columns.platform === null ? 'unknown' : normalize(row[header.columns.platform]) || 'unknown';
    const campaignName = header.columns.campaign === null ? null : nullableText(row[header.columns.campaign]);
    const source = platform === 'unknown' ? 'advertising' : platform.toLowerCase();
    const sourceKey = sourceKeyPrefix
      ? makeSourceKey(sourceKeyPrefix, [dateKey(date), store.storeCode, platform, source, campaignName ?? ''])
      : undefined;

    expenses.push({
      rowNumber: rowIndex + 1,
      date,
      storeName: store.storeName,
      storeCode: store.storeCode,
      platform,
      source,
      campaignName,
      amount,
      currency: 'KZT',
      description: campaignName ?? source,
      sourceKey,
    });
  }

  return {
    expenses,
    columns: {
      date: cellHeader(rows[header.rowIndex][header.columns.date]),
      store: cellHeader(rows[header.rowIndex][header.columns.store]),
      platform: header.columns.platform === null ? null : cellHeader(rows[header.rowIndex][header.columns.platform]),
      campaign: header.columns.campaign === null ? null : cellHeader(rows[header.rowIndex][header.columns.campaign]),
      amount: cellHeader(rows[header.rowIndex][header.columns.amount]),
    },
    format: 'table',
  };
}

function findTabularHeader(rows: SheetRow[]) {
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 30); rowIndex += 1) {
    const row = rows[rowIndex];
    const columns = {
      date: findColumn(row, ['date', 'дата', 'күн']),
      store: findColumn(row, ['store', 'магазин', 'точка', 'дүкен']),
      platform: findOptionalColumn(row, ['platform', 'source', 'channel', 'платформа', 'источник', 'канал']),
      campaign: findOptionalColumn(row, ['campaign', 'кампания', 'кампан']),
      amount: findColumn(row, ['amount', 'spent', 'spend', 'сумма', 'затрат', 'расход', 'стоимость']),
    };

    if (columns.date !== -1 && columns.store !== -1 && columns.amount !== -1) {
      return { rowIndex, columns };
    }
  }
  return null;
}

function emptyTableResult(): ParsedAdvertisingSheet {
  return {
    expenses: [],
    columns: { date: null, store: null, platform: null, campaign: null, amount: null },
    format: 'table',
  };
}

function findMetricRow(rows: SheetRow[], start: number, metrics: string[]) {
  for (let index = start; index < Math.min(rows.length, start + 14); index += 1) {
    if (findBlockTitle(rows[index])) return null;
    const labelColumn = rows[index]?.findIndex((cell) =>
      metrics.some((metric) => normalizeHeader(cellText(cell)).includes(normalizeHeader(metric)))
    ) ?? -1;
    if (labelColumn >= 0) {
      return { row: rows[index], rowIndex: index, labelColumn };
    }
  }
  return null;
}

function findColumn(row: SheetRow, aliases: string[]): number {
  return row.findIndex((cell) => aliases.some((alias) => normalizeHeader(cellText(cell)).includes(normalizeHeader(alias))));
}

function findOptionalColumn(row: SheetRow, aliases: string[]): number | null {
  const index = findColumn(row, aliases);
  return index === -1 ? null : index;
}

function detectStore(value: string) {
  const normalized = normalizeHeader(value);
  if (normalized.includes('status')) return { storeName: 'Status', storeCode: 'status' };
  if (normalized.includes('dosstore') || normalized.includes('dos')) return { storeName: 'Dosstore', storeCode: 'dosstore' };
  return { storeName: value, storeCode: normalized || value.toLowerCase() };
}

function parseDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    return parsed ? utcDate(parsed.y, parsed.m, parsed.d) : null;
  }

  const valueText = text(value);
  const ruMatch = valueText.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ruMatch) return utcDate(Number(ruMatch[3]), Number(ruMatch[2]), Number(ruMatch[1]));

  const isoMatch = valueText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) return utcDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));

  const slashMatch = valueText.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) return utcDate(Number(slashMatch[3]), Number(slashMatch[1]), Number(slashMatch[2]));

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

function nullableText(value: unknown) {
  const valueText = text(value);
  return valueText || null;
}

function normalize(value: unknown) {
  return text(value).replace(/\s+/g, ' ');
}

function cellText(value: unknown): string {
  return value === null || value === undefined ? '' : String(value).trim();
}

function cellHeader(value: unknown): string {
  return normalize(value) || 'unknown';
}

function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/g, '');
}

function findBlockTitle(row: SheetRow | undefined) {
  if (!row) return '';
  return row.map(normalize).find((value) => BLOCKS[value]) ?? '';
}

function utcDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function makeSourceKey(prefix: string, parts: Array<string | number>) {
  return `${prefix}:${parts.map((part) => normalize(String(part)).toLowerCase()).join(':')}`;
}

function parseError(block: string, rowIndex: number, detail: string) {
  return new AdsImportError(
    'ADS_PARSE_ERROR',
    `Ads parse error in block "${block}", row ${rowIndex + 1}: ${detail}`,
    422
  );
}
