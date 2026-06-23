import { createHash } from 'crypto';
import * as XLSX from 'xlsx';

export const STATUS_STORE_ID = 2;
export const STATUS_SALES_SOURCE = 'beksar_status_sales';
export const STATUS_INVENTORY_SOURCE = 'beksar_status_inventory';

export interface ParsedBeksarSale {
  rowNumber: number;
  saleDate: Date;
  saleTime: string | null;
  article: string;
  barcode: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalAmount: number;
  paymentType: string | null;
  seller: string | null;
  category: string | null;
}

export interface ParsedBeksarInventoryItem {
  rowNumber: number;
  snapshotDate: Date;
  article: string;
  barcode: string | null;
  productName: string;
  quantity: number;
  purchasePrice: number | null;
  salePrice: number | null;
  totalValue: number;
  category: string | null;
}

export interface ParsedSalesFile {
  reportDate: Date | null;
  sales: ParsedBeksarSale[];
}

export interface ParsedInventoryFile {
  snapshotDate: Date;
  items: ParsedBeksarInventoryItem[];
}

const CATEGORY_NAMES = ['БАТНИК', 'БРЮКИ', 'ОБУВЬ', 'РУБАШКА', 'РУБАЖКА', 'ФУТБОЛКА', 'ШОРТЫ'];

type SheetRow = unknown[];

export function calculateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export function parseSalesFile(buffer: Buffer): ParsedSalesFile {
  const rows = readFirstSheet(buffer);
  const headerRowIndex = rows.findIndex((row) => cellText(row[1]) === 'Дата' && cellText(row[3]) === 'Артикул');

  if (headerRowIndex === -1) {
    throw new Error('Sales header row was not found');
  }

  const reportDate = findReportDate(rows.slice(0, headerRowIndex));
  const sales: ParsedBeksarSale[] = [];
  let category: string | null = null;

  for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    const firstDataCell = cellText(row[1]);
    const article = cellText(row[3]);

    if (!firstDataCell && !article) continue;

    const categoryName = parseCategory(firstDataCell);
    if (categoryName) {
      category = categoryName;
      continue;
    }

    if (firstDataCell.includes('Итого') || article.includes('Итого')) continue;
    if (!article) continue;

    const saleDate = parseDate(row[1]) ?? reportDate;
    const productName = cellText(row[6]);

    if (!saleDate || !productName) continue;

    sales.push({
      rowNumber: i + 1,
      saleDate,
      saleTime: parseTime(row[2]),
      article,
      barcode: nullableText(row[4]),
      productName,
      quantity: parseInteger(row[7], 1),
      unitPrice: parseNumber(row[8], 0),
      discount: parseNumber(row[9], 0),
      totalAmount: parseNumber(row[10], 0),
      paymentType: nullableText(row[12]),
      seller: nullableText(row[14]),
      category,
    });
  }

  return { reportDate, sales };
}

export function parseInventoryFile(buffer: Buffer): ParsedInventoryFile {
  const rows = readFirstSheet(buffer);
  const headerRowIndex = rows.findIndex((row) => cellText(row[1]) === 'Артикул' && cellText(row[2]) === 'Штрихкод');

  if (headerRowIndex === -1) {
    throw new Error('Inventory header row was not found');
  }

  const snapshotDate = findSnapshotDate(rows.slice(0, headerRowIndex));
  if (!snapshotDate) {
    throw new Error('Inventory snapshot date was not found');
  }

  const items: ParsedBeksarInventoryItem[] = [];
  let category: string | null = null;

  for (let i = headerRowIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    const article = cellText(row[1]);

    if (!article) continue;

    const categoryName = parseCategory(article);
    if (categoryName) {
      category = categoryName;
      continue;
    }

    if (article.includes('Итого')) continue;

    const productName = cellText(row[4]);
    if (!productName) continue;

    const salePrice = parseNullableNumber(row[9]);
    const totalSaleValue = parseNullableNumber(row[10]);
    const quantity = parseInteger(row[5], 0);

    items.push({
      rowNumber: i + 1,
      snapshotDate,
      article,
      barcode: nullableText(row[2]),
      productName,
      quantity,
      purchasePrice: parseNullableNumber(row[7]),
      salePrice,
      totalValue: totalSaleValue ?? (salePrice ?? 0) * quantity,
      category,
    });
  }

  return { snapshotDate, items };
}

function readFirstSheet(buffer: Buffer): SheetRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error('Workbook has no sheets');

  return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    header: 1,
    raw: true,
    defval: null,
  }) as SheetRow[];
}

function findReportDate(rows: SheetRow[]): Date | null {
  for (const row of rows) {
    for (let i = 0; i < row.length; i += 1) {
      if (!cellText(row[i]).includes('За период с')) continue;

      for (let j = i + 1; j < Math.min(i + 6, row.length); j += 1) {
        const date = parseDate(row[j]);
        if (date) return date;
      }
    }
  }

  return null;
}

function findSnapshotDate(rows: SheetRow[]): Date | null {
  for (const row of rows) {
    for (const cell of row) {
      const value = cellText(cell);
      if (!value.includes('На дату')) continue;

      const dateMatch = value.match(/(\d{2}\.\d{2}\.\d{4})/);
      if (!dateMatch) continue;

      return parseDate(dateMatch[1]);
    }
  }

  return null;
}

function parseCategory(value: string): string | null {
  const upper = value.toUpperCase();
  const category = CATEGORY_NAMES.find((name) => upper.includes(name));
  return category ?? null;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }

  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }

  const text = cellText(value);
  const ruMatch = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (ruMatch) {
    return new Date(Date.UTC(Number(ruMatch[3]), Number(ruMatch[2]) - 1, Number(ruMatch[1])));
  }

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])));
  }

  return null;
}

function parseTime(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(11, 19);
  }

  const text = cellText(value);
  const match = text.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (!match) return null;

  return [match[1].padStart(2, '0'), match[2], match[3]].join(':');
}

function parseInteger(value: unknown, fallback: number): number {
  const parsed = Math.trunc(parseNumber(value, fallback));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseNumber(value: unknown, fallback: number): number {
  const parsed = parseNullableNumber(value);
  return parsed ?? fallback;
}

function parseNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const parsed = Number(cellText(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function nullableText(value: unknown): string | null {
  const text = cellText(value);
  return text || null;
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}
