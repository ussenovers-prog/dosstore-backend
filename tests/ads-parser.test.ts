import assert from 'node:assert/strict';
import { parseAdvertisingCsv } from '../src/modules/ads/ads.parser.js';

const csv = [
  'Dosstore,,,,',
  'Дата,Общий,01.07.2026,02.07.2026,03.07.2026',
  'Сумма затрат,"₸5 000,00","₸2 000,00","₸0,00","₸3 000,00"',
  ',,,,,',
  'Status трафик,,,,',
  'Дата,Общий,01.07.2026,02.07.2026,03.07.2026',
  'Сумма затрат,"₸1 500,00","₸1 500,00",,',
].join('\n');

const parsed = parseAdvertisingCsv(csv, 'test-sheet');

assert.equal(parsed.format, 'metric_blocks');
assert.deepEqual(parsed.columns, {
  date: 'Дата',
  store: 'block title',
  platform: 'block title',
  campaign: null,
  amount: 'Сумма затрат',
});
assert.equal(parsed.expenses.length, 3);
assert.equal(parsed.expenses[0].storeCode, 'dosstore');
assert.equal(parsed.expenses[0].source, 'traffic');
assert.equal(parsed.expenses[0].platform, 'unknown');
assert.equal(parsed.expenses[0].date.toISOString(), '2026-07-01T00:00:00.000Z');
assert.equal(parsed.expenses[0].amount, 2000);
assert.equal(parsed.expenses[1].amount, 3000);
assert.equal(parsed.expenses[2].storeCode, 'status');
assert.equal(parsed.expenses[2].amount, 1500);
assert.match(parsed.expenses[0].sourceKey ?? '', /^test-sheet:2026-07-01:dosstore:unknown:traffic:dosstore$/);
