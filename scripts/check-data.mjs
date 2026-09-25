// Prints per-month in / out / net and the closing balance for data/transactions.csv.
// The manual cross-check for every number the UI shows later.
//
//   node scripts/check-data.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const data = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const account = JSON.parse(readFileSync(join(data, 'account.json'), 'utf8'));
const rows = readFileSync(join(data, 'transactions.csv'), 'utf8').trim().split('\n').slice(1);

const eur = (n) => n.toFixed(2).padStart(10);
const months = new Map();
for (const row of rows) {
  const [, date, amount] = row.split(',');
  const m = months.get(date.slice(0, 7)) ?? { in: 0, out: 0, rows: 0 };
  const value = Number(amount);
  if (value > 0) m.in += value;
  else m.out += value;
  m.rows += 1;
  months.set(date.slice(0, 7), m);
}

let balance = account.openingBalance;
console.log(`${account.name} — opening ${eur(balance)} on ${account.openingDate}\n`);
console.log('month        rows          in         out         net     balance');
for (const [month, m] of months) {
  balance += m.in + m.out;
  console.log(`${month}    ${String(m.rows).padStart(5)}  ${eur(m.in)}  ${eur(m.out)}  ${eur(m.in + m.out)}  ${eur(balance)}`);
}
console.log(`\n${rows.length} transactions, closing balance ${eur(balance)}`);
