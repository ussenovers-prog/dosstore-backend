import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {
  BeksarFileValidationError,
  parseInventoryFile,
} from '../src/modules/beksar/beksar.parser.js';

function workbookBuffer(rows: unknown[][]): Buffer {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
  return XLSX.write(workbook, { bookType: 'xls', type: 'buffer' });
}

const realFormatBuffer = workbookBuffer([
  ['Остатки товаров'],
  [],
  [null, null, 'Артикул', 'Штрихкод', 'Наименование товара', 'Остаток', 'Цена закупки', 'Цена продажи', 'Стоимость продажи'],
  [null, null, 'БАТНИК'],
  [null, null, 'A-100', '4870012345678', 'Батник мужской', '3', '5000', '8900', '26700'],
  [null, null, 'A-101', null, 'Батник женский', 2, null, 7500, null],
  [null, null, 'Итого', null, null, 5, null, null, 41700],
]);

const parsed = parseInventoryFile(realFormatBuffer, 'Остатки товаров  на 08.07.2026.xls');

assert.equal(parsed.snapshotDate.toISOString(), '2026-07-08T00:00:00.000Z');
assert.equal(parsed.items.length, 2);
assert.deepEqual(parsed.items[0], {
  rowNumber: 5,
  snapshotDate: parsed.snapshotDate,
  article: 'A-100',
  barcode: '4870012345678',
  productName: 'Батник мужской',
  quantity: 3,
  purchasePrice: 5000,
  salePrice: 8900,
  totalValue: 26700,
  category: 'БАТНИК',
});
assert.equal(parsed.items[1].totalValue, 15000);

assert.throws(
  () => parseInventoryFile(workbookBuffer([['not an inventory file']]), 'bad.xls'),
  BeksarFileValidationError
);
