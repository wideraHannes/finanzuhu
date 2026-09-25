// Generates data/transactions.csv — the dummy ledger for Finanzuhu.
//
// Committed for transparency, not because the app needs it: the CSV is the
// source of truth and is checked in. Re-running this script with the same seed
// produces a byte-identical file.
//
//   node scripts/generate-data.mjs
//
// Shape of a month: salary in, eleven fixed costs out, a week-shaped stream of
// variable spending. Every merchant carries its own price range, so a bakery
// stays cheap and a trattoria stays expensive. The variable stream is then
// scaled so each month lands on the net result below — at least 300 EUR left
// over everywhere, August the tightest because of the summer trip.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'transactions.csv');

const FROM = '2026-07-01';
const TO = '2026-09-25';
const SEED = 20260701;

// Salary lands on the 25th. The plan wrote "28th", but the ledger ends on
// 2026-09-25, and a September without salary would leave the month 1400 EUR
// short instead of the 300 EUR up every month is supposed to be.
const SALARY_DAY = 25;
const SALARY = 3000.0;

// Net result each month has to end on. Add them to the 6450.00 opening balance
// for the closing balance the dashboard shows.
const MONTH_TARGET_NET = {
  '2026-07': 330.6,
  '2026-08': 301.35,
  '2026-09': 764.9,
};

// At most this many days in a row without a single booking. Without the cap the
// coin flips below happily leave a five-day hole at the end of a month.
const MAX_QUIET_DAYS = 2;

// ---------------------------------------------------------------- randomness

// mulberry32 — four lines, deterministic, good enough for fake groceries.
function makeRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = makeRandom(SEED);
const chance = (p) => random() < p;
const pick = (list) => list[Math.floor(random() * list.length)];
const between = (min, max) => min + random() * (max - min);

// --------------------------------------------------------------------- dates

function eachDay(from, to) {
  const days = [];
  for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const DAYS = eachDay(FROM, TO);
const weekday = (date) => new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
const monthOf = (date) => date.slice(0, 7);
const months = [...new Set(DAYS.map(monthOf))];
const monthName = (date) =>
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][
    Number(date.slice(5, 7)) - 1
  ];

// ------------------------------------------------------------------- ledger

const rows = [];

// `scaled` marks everyday spending whose amount may be nudged so the month hits
// its target; `floor` is how far down it may go before the merchant stops being
// believable. Round numbers — ATM, fees, the trip, the two one-offs — stay put.
function add(row) {
  rows.push({ recurring: false, scaled: false, floor: 0, ...row });
}

function spend(date, amount, description, counterparty, category, method = 'card', extra = {}) {
  add({ date, amount: -amount, description, counterparty, category, type: 'expense', method, ...extra });
}

// A catalogue entry is [counterparty, min, max, description]. Prices per
// merchant, not per category — that is what keeps the ledger from reading like
// a random number generator.
function buy(date, category, catalogue, method = 'card') {
  const [counterparty, min, max, description] = pick(catalogue);
  spend(date, between(min, max), description, counterparty, category, method, { scaled: true, floor: min * 0.9 });
}

// --- income ----------------------------------------------------------------

for (const month of months) {
  const date = `${month}-${String(SALARY_DAY).padStart(2, '0')}`;
  add({
    date,
    amount: SALARY,
    description: `Salary ${monthName(date)}`,
    counterparty: 'ForrestAnimals AG',
    category: 'Salary',
    type: 'income',
    method: 'transfer',
    recurring: true,
  });
}

const EXTRA_INCOME = [
  ['2026-09-08', 341.8, 'Tax assessment 2025', 'Finanzamt Hamburg-Nord'],
  ['2026-09-21', 45.0, 'Concert tickets paid back', 'Jonas Brinkmann'],
];
for (const [date, amount, description, counterparty] of EXTRA_INCOME) {
  add({ date, amount, description, counterparty, category: 'Other Income', type: 'income', method: 'transfer' });
}

// --- fixed costs -----------------------------------------------------------

// No health insurance here: the contribution comes off the gross salary and
// never touches the current account.
const FIXED = [
  [1, 800.0, 'Rent', 'Hausverwaltung Meyer', 'Rent', 'direct_debit'],
  [1, 58.0, 'Public transport pass', 'HVV Hamburg', 'Mobility', 'direct_debit'],
  [1, 4.9, 'Account maintenance fee', 'Hamburger Sparkasse', 'Bank Fees', 'fee'],
  [2, 21.4, 'Liability and household insurance', 'HUK-COBURG', 'Insurance', 'direct_debit'],
  [2, 300.0, 'Savings standing order', 'Tagesgeldkonto', 'Savings', 'transfer'],
  [3, 34.9, 'Gym membership', 'FitnessFirst Hamburg', 'Subscriptions', 'direct_debit'],
  [4, 78.0, 'Electricity', 'Stadtwerke Hamburg', 'Utilities', 'direct_debit'],
  [5, 44.5, 'Internet', 'Telekom Deutschland', 'Internet & Phone', 'direct_debit'],
  [5, 29.99, 'Mobile contract', 'Vodafone', 'Internet & Phone', 'direct_debit'],
  [8, 13.99, 'Netflix', 'Netflix International', 'Subscriptions', 'card'],
  [12, 11.99, 'Spotify', 'Spotify AB', 'Subscriptions', 'card'],
  [15, 2.99, 'iCloud storage', 'Apple Services', 'Subscriptions', 'card'],
];

for (const month of months) {
  for (const [day, amount, description, counterparty, category, method] of FIXED) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    if (date > TO) continue;
    add({
      date,
      amount: -amount,
      description: `${description} ${monthName(date)}`,
      counterparty,
      category,
      type: 'expense',
      method,
      recurring: true,
    });
  }
}

// --- the August holiday ----------------------------------------------------

// Four nights on Rügen by train. Modest on purpose: the month still has to end
// 300 EUR up, so a flight-and-hotel holiday does not fit any more.
const TRIP_FROM = '2026-08-07';
const TRIP_TO = '2026-08-11';

const TRIP = [
  ['2026-08-02', 84.0, 'Train tickets Hamburg - Binz', 'DB Fernverkehr', 'Travel', 'card'],
  ['2026-08-02', 152.0, 'Apartment Binz 4 nights', 'Ostsee Ferienwohnungen', 'Travel', 'transfer'],
  ['2026-08-07', 38.5, 'Dinner at the pier', 'Strandrestaurant Seebrücke', 'Restaurants & Cafés', 'card'],
  ['2026-08-08', 24.0, 'Bike rental', 'Radverleih Binz', 'Mobility', 'card'],
  ['2026-08-09', 18.0, 'Chalk cliffs park entry', 'Nationalpark Jasmund', 'Leisure & Culture', 'card'],
  ['2026-08-10', 29.4, 'Groceries for the flat', 'EDEKA Binz', 'Groceries', 'card'],
  ['2026-08-11', 12.6, 'Bus to the station', 'Rügener Personennahverkehr', 'Mobility', 'card'],
];
for (const [date, amount, description, counterparty, category, method] of TRIP) {
  spend(date, amount, description, counterparty, category, method);
}

// --- the two larger one-offs ----------------------------------------------

spend('2026-07-19', 159.0, 'Desk and shelving', 'IKEA Hamburg-Moorfleet', 'Household', 'card');
spend('2026-09-12', 289.9, 'Autumn wardrobe', 'Zara', 'Shopping & Clothing', 'card');

// --- catalogues ------------------------------------------------------------

const GROCERS = [
  ['REWE', 14, 58, 'Groceries'],
  ['EDEKA Struve', 16, 60, 'Groceries'],
  ['ALDI SÜD', 9, 54, 'Groceries'],
  ['Lidl', 9, 54, 'Groceries'],
  ['Penny', 8, 46, 'Groceries'],
  ['Bio Company', 14, 49, 'Groceries'],
];
const RESTAURANTS = [
  ['Bäckerei Junge', 3.2, 11, 'Bakery'],
  ['Café Nord', 6.5, 19, 'Coffee and cake'],
  ['Burger Base', 11, 27, 'Eating out'],
  ['Vapiano', 12, 31, 'Eating out'],
  ['Sushi Kaito', 22, 52, 'Dinner'],
  ['Trattoria da Vinci', 24, 64, 'Dinner'],
];
const BARS = [
  ['Zum Anker', 12, 34, 'Drinks'],
  ['Bar Rossi', 16, 42, 'Drinks'],
  ['Clubhaus St. Pauli', 18, 55, 'Night out'],
  ['Weinhandlung Schmitt', 15, 39, 'Wine'],
];
const STATIONS = [
  ['Shell', 58, 92, 'Refuelling'],
  ['Aral', 58, 92, 'Refuelling'],
  ['TotalEnergies', 56, 88, 'Refuelling'],
];
const TRANSPORT = [
  ['HVV Ticketautomat', 2.4, 3.9, 'Single ticket'],
  ['Nextbike', 1.5, 9, 'Bike rental'],
  ['DB Vertrieb', 8.9, 49, 'Train ticket'],
  ['FREE NOW', 8.5, 24, 'Ride'],
];
const CLOTHING = [
  ['Zara', 29, 108, 'Clothing'],
  ['H&M', 19, 79, 'Clothing'],
  ['Uniqlo', 25, 85, 'Clothing'],
  ['Zalando', 35, 112, 'Online order'],
  ['Snipes', 49, 115, 'Sneakers'],
];
const HOUSEHOLD = [
  ['dm-drogerie markt', 8, 42, 'Drugstore'],
  ['Rossmann', 8, 39, 'Drugstore'],
  ['OBI Baumarkt', 14, 78, 'Hardware store'],
  ['IKEA Hamburg-Moorfleet', 19, 92, 'Household goods'],
];
const PHARMACIES = [
  ['Apotheke am Markt', 9, 44, 'Pharmacy'],
  ['Zahnarztpraxis Dr. Krüger', 28, 95, 'Dentist'],
  ['Sanitätshaus Nord', 14, 68, 'Medical supplies'],
];
const CULTURE = [
  ['Cinemaxx Dammtor', 11, 26, 'Cinema'],
  ['Thalia Buchhandlung', 9, 42, 'Books'],
  ['Elbphilharmonie', 32, 78, 'Concert'],
  ['Kunsthalle Hamburg', 12, 28, 'Museum'],
];
const GIFTS = [
  ['Blumen Krüger', 15, 45, 'Flowers'],
  ['Ärzte ohne Grenzen', 20, 60, 'Donation'],
  ['Manufactum', 25, 85, 'Gift'],
];
const COURSES = [
  ['Udemy', 12, 34, 'Online course'],
  ['VHS Hamburg', 45, 92, 'Evening class'],
  ['Coursera', 39, 59, 'Course subscription'],
];

// --- everyday spending -----------------------------------------------------

let daysSinceFuel = 9;

for (const date of DAYS) {
  const day = weekday(date);
  daysSinceFuel += 1;
  if (date >= TRIP_FROM && date <= TRIP_TO) continue; // nobody shops in Hamburg while sitting in Binz

  const friOrSat = day === 5 || day === 6;

  if (chance(friOrSat ? 0.48 : day === 2 || day === 3 ? 0.2 : 0.08)) buy(date, 'Groceries', GROCERS);
  if (chance(day === 5 ? 0.3 : day === 0 ? 0.26 : day === 6 ? 0.18 : 0.05)) buy(date, 'Restaurants & Cafés', RESTAURANTS);
  if (chance(day === 6 ? 0.3 : day === 5 ? 0.16 : 0.02)) buy(date, 'Bars & Nightlife', BARS);
  if (daysSinceFuel >= 11 && chance(0.45)) {
    buy(date, 'Fuel', STATIONS);
    daysSinceFuel = 0;
  }
  if (chance(0.07)) buy(date, 'Mobility', TRANSPORT);
  if (chance(0.035)) buy(date, 'Shopping & Clothing', CLOTHING);
  if (chance(0.04)) buy(date, 'Household', HOUSEHOLD);
  if (chance(0.035)) buy(date, 'Health & Pharmacy', PHARMACIES);
  if (chance(0.03)) buy(date, 'Leisure & Culture', CULTURE);
  if (chance(0.015)) buy(date, 'Gifts & Donations', GIFTS);
  if (chance(0.012)) buy(date, 'Education', COURSES);
  if (chance(0.022)) {
    spend(date, pick([50, 100, 150]), 'Cash withdrawal', 'Hamburger Sparkasse', 'Cash Withdrawal', 'atm');
  }
}

// --- make every month readable --------------------------------------------

const atHome = (month) => DAYS.filter((d) => monthOf(d) === month && !(d >= TRIP_FROM && d <= TRIP_TO));

// A category the dashboard breaks down should not be missing from a month, or
// the chart gets a hole that looks like a bug rather than like a quiet month.
const PER_MONTH = [
  ['Health & Pharmacy', PHARMACIES],
  ['Bars & Nightlife', BARS],
  ['Leisure & Culture', CULTURE],
  ['Shopping & Clothing', CLOTHING],
  ['Household', HOUSEHOLD],
  ['Gifts & Donations', GIFTS],
  ['Education', COURSES],
];

for (const month of months) {
  for (const [category, catalogue] of PER_MONTH) {
    if (rows.some((r) => monthOf(r.date) === month && r.category === category)) continue;
    buy(pick(atHome(month)), category, catalogue);
  }
  // Cash is its own case: round notes, never scaled.
  if (!rows.some((r) => monthOf(r.date) === month && r.category === 'Cash Withdrawal')) {
    spend(pick(atHome(month)), pick([50, 100]), 'Cash withdrawal', 'Hamburger Sparkasse', 'Cash Withdrawal', 'atm');
  }
}

// Close the long quiet stretches — groceries or a coffee, whatever fits the day.
for (let i = MAX_QUIET_DAYS; i < DAYS.length; i++) {
  const run = DAYS.slice(i - MAX_QUIET_DAYS, i + 1);
  if (run.every((d) => !rows.some((r) => r.date === d))) {
    if (chance(0.6)) buy(DAYS[i], 'Groceries', GROCERS);
    else buy(DAYS[i], 'Restaurants & Cafés', RESTAURANTS);
  }
}

// ------------------------------------------------------- hit the month target

const round2 = (n) => Math.round(n * 100) / 100;
const clamped = (row, factor) => Math.min(row.amount * factor, -row.floor); // both negative

for (const month of months) {
  const inMonth = rows.filter((r) => monthOf(r.date) === month);
  const target = MONTH_TARGET_NET[month];
  const rest = inMonth.filter((r) => !r.scaled).reduce((sum, r) => sum + r.amount, 0);
  const scaled = inMonth.filter((r) => r.scaled);
  const wanted = target - rest; // negative: what everyday spending may cost

  // Binary search instead of one division: the floors bend the total, so a
  // single ratio would overshoot.
  let lo = 0.1;
  let hi = 4;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (scaled.reduce((sum, r) => sum + clamped(r, mid), 0) < wanted) hi = mid;
    else lo = mid;
  }
  const factor = (lo + hi) / 2;
  if (factor < 0.85 || factor > 1.2) {
    console.warn(`! ${month}: everyday spending scaled by ${factor.toFixed(2)} — too far off 1.0, retune MONTH_TARGET_NET`);
  }

  const free = scaled.filter((r) => r.amount * factor > -r.floor * 1.05); // not sitting on its floor
  for (const row of scaled) row.amount = round2(clamped(row, factor));

  // Rounding leaves a few cents. Put them on the largest item that can take them.
  const drift = round2(target - rest - scaled.reduce((sum, r) => sum + r.amount, 0));
  const biggest = (free.length ? free : scaled).reduce((a, b) => (a.amount <= b.amount ? a : b));
  biggest.amount = round2(biggest.amount + drift);
}

// ---------------------------------------------------------------------- write

rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

const HEADER = 'id,date,amount,description,counterparty,category,type,method,recurring';
const lines = rows.map((row, i) => {
  const id = `tx_${String(i + 1).padStart(4, '0')}`;
  const fields = [id, row.date, row.amount.toFixed(2), row.description, row.counterparty, row.category, row.type, row.method, String(row.recurring)];
  const offender = fields.find((f) => f.includes(',') || f.includes('"'));
  if (offender) throw new Error(`Field contains a comma or quote: ${offender}`);
  return fields.join(',');
});

writeFileSync(OUT, `${HEADER}\n${lines.join('\n')}\n`);
console.log(`${OUT} — ${rows.length} rows, ${FROM} to ${TO}`);
