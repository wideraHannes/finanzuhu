// Generates data/transactions.csv — the dummy ledger for Finanzuhu.
//
// Committed for transparency, not because the app needs it: the CSV is the
// source of truth and is checked in. Re-running this script with the same seed
// produces a byte-identical file.
//
//   node scripts/generate-data.mjs
//
// Shape of a month: salary in, twelve fixed costs out, a week-shaped stream of
// variable spending. The variable stream is scaled at the end so every month
// lands on the net result the plan asks for (July and September slightly
// positive, August negative because of the holiday trip).

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'transactions.csv');

const FROM = '2026-07-01';
const TO = '2026-09-25';
const SEED = 20260701;

// Salary lands on the 25th. The plan wrote "28th", but the ledger ends on
// 2026-09-25, and a September without salary would make the month deeply
// negative — two red months instead of the one August is meant to be.
const SALARY_DAY = 25;
const SALARY = 3000.0;

// What each month has to end on. Sum with the 6450.00 opening balance to get
// the closing balance the dashboard shows.
const MONTH_TARGET_NET = {
  '2026-07': 287.4,
  '2026-08': -943.15,
  '2026-09': 212.6,
};

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

const weekday = (date) => new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
const monthOf = (date) => date.slice(0, 7);
const months = [...new Set(eachDay(FROM, TO).map(monthOf))];
const monthName = (date) =>
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][
    Number(date.slice(5, 7)) - 1
  ];

// ------------------------------------------------------------------- ledger

const rows = [];

// `scaled` marks the everyday spending whose amounts may be nudged at the end
// so the month hits its target. Round numbers (ATM, fees, the holiday) stay put.
function add({ date, amount, description, counterparty, category, type, method, recurring = false, scaled = false }) {
  rows.push({ date, amount, description, counterparty, category, type, method, recurring, scaled });
}

function spend(date, amount, description, counterparty, category, method = 'card', scaled = true) {
  add({ date, amount: -amount, description, counterparty, category, type: 'expense', method, scaled });
}

// --- income ----------------------------------------------------------------

for (const month of months) {
  const date = `${month}-${String(SALARY_DAY).padStart(2, '0')}`;
  add({
    date,
    amount: SALARY,
    description: `Salary ${monthName(date)}`,
    counterparty: 'Nordlicht Logistik GmbH',
    category: 'Salary',
    type: 'income',
    method: 'transfer',
    recurring: true,
  });
}

const extraIncome = [
  ['2026-07-17', 600.0, 'Freelance invoice 2026-04', 'Weserwerk Studio', 'Other Income', 'transfer'],
  ['2026-09-08', 341.8, 'Tax assessment 2025', 'Finanzamt Hamburg-Nord', 'Other Income', 'transfer'],
  ['2026-09-21', 45.0, 'Concert tickets paid back', 'Jonas Brinkmann', 'Other Income', 'transfer'],
];
for (const [date, amount, description, counterparty, category, method] of extraIncome) {
  add({ date, amount, description, counterparty, category, type: 'income', method });
}

// --- fixed costs -----------------------------------------------------------

const FIXED = [
  [1, 1180.0, 'Rent', 'Hausverwaltung Meyer', 'Rent', 'direct_debit'],
  [1, 58.0, 'Public transport pass', 'HVV Hamburg', 'Mobility', 'direct_debit'],
  [2, 21.4, 'Liability and household insurance', 'HUK-COBURG', 'Insurance', 'direct_debit'],
  [2, 32.0, 'Health insurance top-up', 'Techniker Krankenkasse', 'Insurance', 'direct_debit'],
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

const TRIP_FROM = '2026-08-07';
const TRIP_TO = '2026-08-16';

const TRIP = [
  ['2026-08-03', 412.0, 'Flights Hamburg - Lisbon', 'Lufthansa', 'Travel', 'card'],
  ['2026-08-03', 638.0, 'Hotel Lisbon 9 nights', 'Booking.com', 'Travel', 'card'],
  ['2026-08-07', 34.2, 'Airport transfer', 'Taxi Lisboa', 'Mobility', 'card'],
  ['2026-08-08', 68.4, 'Dinner Alfama', 'Restaurante Ramiro', 'Restaurants & Cafés', 'card'],
  ['2026-08-09', 24.0, 'Museum tickets', 'Museu Gulbenkian', 'Leisure & Culture', 'card'],
  ['2026-08-10', 12.5, 'Tram day pass', 'Carris Lisboa', 'Mobility', 'card'],
  ['2026-08-11', 52.3, 'Lunch and drinks', 'Time Out Market', 'Restaurants & Cafés', 'card'],
  ['2026-08-12', 81.9, 'Day trip Sintra', 'Comboios de Portugal', 'Travel', 'card'],
  ['2026-08-13', 46.0, 'Souvenirs', 'Loja Alfama', 'Shopping & Clothing', 'card'],
  ['2026-08-14', 39.6, 'Seafood dinner', 'Cervejaria Cabecas', 'Restaurants & Cafés', 'card'],
  ['2026-08-15', 28.8, 'Rooftop bar', 'Park Bar Lisboa', 'Bars & Nightlife', 'card'],
  ['2026-08-16', 33.5, 'Transfer to airport', 'Taxi Lisboa', 'Mobility', 'card'],
];
for (const [date, amount, description, counterparty, category, method] of TRIP) {
  spend(date, amount, description, counterparty, category, method, false);
}

// --- the two larger one-offs ----------------------------------------------

spend('2026-07-19', 449.0, 'Desk and shelving', 'IKEA Hamburg-Moorfleet', 'Household', 'card', false);
spend('2026-09-12', 289.9, 'Autumn wardrobe', 'Zara', 'Shopping & Clothing', 'card', false);

// --- everyday spending -----------------------------------------------------

const GROCERS = ['REWE', 'ALDI SÜD', 'EDEKA Struve', 'Lidl', 'Penny', 'Bio Company'];
const RESTAURANTS = ['Trattoria da Vinci', 'Sushi Kaito', 'Café Nord', 'Bäckerei Junge', 'Burger Base', 'Vapiano'];
const BARS = ['Zum Anker', 'Bar Rossi', 'Clubhaus St. Pauli', 'Weinhandlung Schmitt'];
const STATIONS = ['Shell', 'Aral', 'TotalEnergies'];
const TRANSPORT = ['DB Vertrieb', 'HVV Ticketautomat', 'FREE NOW', 'Nextbike'];
const CLOTHING = ['Zara', 'H&M', 'Uniqlo', 'Zalando', 'Snipes'];
const HOUSEHOLD = ['dm-drogerie markt', 'Rossmann', 'OBI Baumarkt', 'IKEA Hamburg-Moorfleet'];
const PHARMACIES = ['Apotheke am Markt', 'Zahnarztpraxis Dr. Krüger', 'Sanitätshaus Nord'];
const CULTURE = ['Cinemaxx Dammtor', 'Thalia Buchhandlung', 'Elbphilharmonie', 'Kunsthalle Hamburg'];
const GIFTS = ['Blumen Krüger', 'Ärzte ohne Grenzen', 'Manufactum'];
const COURSES = ['Udemy', 'VHS Hamburg', 'Coursera'];

let daysSinceFuel = 9;

for (const date of eachDay(FROM, TO)) {
  const day = weekday(date);
  const away = date >= TRIP_FROM && date <= TRIP_TO;
  daysSinceFuel += 1;
  if (away) continue; // nobody buys groceries in Hamburg while sitting in Lisbon

  const friOrSat = day === 5 || day === 6;

  if (chance(friOrSat ? 0.55 : day === 2 || day === 3 ? 0.24 : 0.1)) {
    spend(date, between(11, 68), 'Groceries', pick(GROCERS), 'Groceries');
  }
  if (chance(day === 5 ? 0.36 : day === 0 ? 0.32 : day === 6 ? 0.22 : 0.07)) {
    spend(date, between(9, 52), 'Eating out', pick(RESTAURANTS), 'Restaurants & Cafés');
  }
  if (chance(day === 6 ? 0.3 : day === 5 ? 0.16 : 0.02)) {
    spend(date, between(14, 46), 'Drinks', pick(BARS), 'Bars & Nightlife');
  }
  if (daysSinceFuel >= 11 && chance(0.45)) {
    spend(date, between(48, 82), 'Refuelling', pick(STATIONS), 'Fuel');
    daysSinceFuel = 0;
  }
  if (chance(0.08)) {
    spend(date, between(2.9, 18.5), 'Ticket', pick(TRANSPORT), 'Mobility');
  }
  if (chance(0.05)) {
    spend(date, between(19, 129), 'Clothing', pick(CLOTHING), 'Shopping & Clothing');
  }
  if (chance(0.05)) {
    spend(date, between(8, 74), 'Household goods', pick(HOUSEHOLD), 'Household');
  }
  if (chance(0.035)) {
    spend(date, between(6, 48), 'Pharmacy', pick(PHARMACIES), 'Health & Pharmacy');
  }
  if (chance(0.04)) {
    spend(date, between(9, 65), 'Culture', pick(CULTURE), 'Leisure & Culture');
  }
  if (chance(0.015)) {
    spend(date, between(15, 60), 'Gift', pick(GIFTS), 'Gifts & Donations');
  }
  if (chance(0.012)) {
    spend(date, between(12, 49), 'Online course', pick(COURSES), 'Education');
  }
  if (chance(0.01)) {
    spend(date, 3.9, 'Foreign ATM fee', 'Hamburger Sparkasse', 'Bank Fees', 'card', false);
  }
  if (chance(0.035)) {
    spend(date, pick([50, 100, 150, 200]), 'Cash withdrawal', 'Hamburger Sparkasse', 'Cash Withdrawal', 'atm', false);
  }
}

// ------------------------------------------------------- hit the month target

const round2 = (n) => Math.round(n * 100) / 100;

for (const month of months) {
  const inMonth = rows.filter((r) => monthOf(r.date) === month);
  const target = MONTH_TARGET_NET[month];
  const fixedPart = inMonth.filter((r) => !r.scaled).reduce((sum, r) => sum + r.amount, 0);
  const scaled = inMonth.filter((r) => r.scaled);
  const rawSum = scaled.reduce((sum, r) => sum + r.amount, 0); // negative
  const wanted = target - fixedPart; // negative: what everyday spending may cost
  const factor = wanted / rawSum;

  if (factor < 0.6 || factor > 1.6) {
    console.warn(`! ${month}: scaling everyday spending by ${factor.toFixed(2)} — amounts may look odd`);
  }
  for (const row of scaled) row.amount = round2(row.amount * factor);

  // Rounding leaves a few cents. Put them on the largest item of the month.
  const drift = round2(target - fixedPart - scaled.reduce((sum, r) => sum + r.amount, 0));
  const biggest = scaled.reduce((a, b) => (a.amount <= b.amount ? a : b));
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
