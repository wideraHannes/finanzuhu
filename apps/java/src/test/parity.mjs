// Run from apps/java after starting the Java app. Requires Node 22.18+.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const finance = await import(pathToFileURL(resolve('../../apps/typescript/src/lib/finance.ts')));
const rows = readFileSync('../../data/transactions.csv', 'utf8').trim().split('\n').slice(1).map(line => {
  const [id, date, amount, description, counterparty, category, type, method, recurring] = line.split(',');
  return { id, date, amount: Number(amount), description, counterparty, category, type, method, recurring: recurring === 'true' };
});
const account = JSON.parse(readFileSync('../../data/account.json', 'utf8'));
const reference = rows.at(-1).date;
const base = process.argv[2] || 'http://localhost:8080';
function compare(actual, expected, path = '') {
  if (typeof expected === 'number') {
    assert.ok(Math.abs(actual - expected) < 1e-8, `${path}: ${actual} != ${expected}`);
  } else if (Array.isArray(expected)) {
    assert.equal(actual.length, expected.length, path);
    expected.forEach((value, index) => compare(actual[index], value, `${path}[${index}]`));
  } else if (expected && typeof expected === 'object') {
    assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), path);
    for (const key of Object.keys(expected)) compare(actual[key], expected[key], `${path}.${key}`);
  } else assert.equal(actual, expected, path);
}
for (const range of ['week', 'month', '3m']) {
  const balance = finance.balance(rows, account.openingBalance);
  compare(await (await fetch(`${base}/api/summary?range=${range}`)).json(), {
    balance, freeToSpend: finance.freeToSpend(rows, balance), asOf: reference, range,
    ...finance.summarize(rows, range, reference),
    series: finance.dailySeries(rows, range, reference, account.openingBalance),
    categories: finance.byCategory(rows, range, reference)
  }, range);
}
for (const filters of [{}, { q: 'BÄCKEREI' }, { q: 'FORREST', category: 'Salary', type: 'income' },
  { category: 'Groceries', type: 'expense' }, { q: 'Salary', type: 'expense' }, { type: 'invalid' }]) {
  const q = (filters.q || '').toLowerCase();
  compare(await (await fetch(`${base}/api/transactions?${new URLSearchParams(filters)}`)).json(), {
    items: rows.filter(t => (!q || t.description.toLowerCase().includes(q) || t.counterparty.toLowerCase().includes(q))
      && (!filters.category || t.category === filters.category) && (!filters.type || t.type === filters.type)),
    total: rows.length, categories: [...new Set(rows.map(t => t.category))].sort()
  }, JSON.stringify(filters));
}
console.log('Full TypeScript/Java response parity passed: 3 ranges and 6 filter combinations.');
