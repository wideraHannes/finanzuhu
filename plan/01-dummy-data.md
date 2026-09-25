# Slice 1 — Dummy data

**Goal.** A committed CSV with three months of plausible bookings. Everything
later reads from it, so it exists before any UI.

## Files

```
data/transactions.csv     the ledger (committed, static)
data/account.json         { "name": "Girokonto", "openingBalance": 2450.00, "openingDate": "2026-06-30" }
scripts/generate-data.mjs one-off generator, committed for transparency
```

## Format

```csv
id,date,amount,description,counterparty,category,type,method,recurring
tx_0001,2026-07-01,-1180.00,Rent July,Hausverwaltung Meyer,Rent,expense,direct_debit,true
tx_0002,2026-07-28,3000.00,Salary July,Nordlicht Logistik GmbH,Salary,income,transfer,true
```

- `amount` signed — income positive, expenses negative. Euros with two decimals,
  no cent-integers, no currency column (everything is EUR).
- No commas or quotes inside any field, so reading the file stays a `split(',')`.
- Sorted by date ascending.

## Content

Period **2026-07-01 → 2026-09-25**, ~130 rows.

- Salary **3000.00 €** on the 28th of each month (June's salary is the opening
  balance's origin, July/Aug/Sep are in the file).
- Fixed costs, `recurring=true`, same day each month:
  Rent 1180 · Electricity 78 · Internet 44.50 · Mobile 29.99 · Insurance 21.40 ·
  Health top-up 32 · Transit pass 58 · Gym 34.90 · Netflix 13.99 · Spotify 11.99 ·
  iCloud 2.99 · Savings transfer 300.
- Variable spend, clustered like a real week (groceries Fri/Sat, restaurants
  Fri/Sun, bars Sat, fuel every ~2 weeks):
  Groceries · Restaurants & Cafés · Bars & Nightlife · Fuel · Mobility ·
  Shopping & Clothing · Household · Health & Pharmacy · Leisure & Culture ·
  Travel · Gifts & Donations · Education · Bank Fees · Cash Withdrawal.
- Extra income: one tax refund (~340 €), one freelance invoice (~600 €), one
  refund from a friend (~45 €).
- Real-sounding counterparties: REWE, ALDI SÜD, dm-drogerie markt, Shell,
  DB Vertrieb, Trattoria da Vinci, Zara, IKEA, Apotheke am Markt …
- **August ends negative** (holiday trip), July and September positive by
  150–350 €. The UI has to show a red month somewhere.

The generator uses a fixed seed so re-running it produces the identical file.

## Verification

```bash
node scripts/generate-data.mjs        # rewrites data/transactions.csv
node scripts/check-data.mjs           # prints per-month in/out/net + end balance
```

`check-data.mjs` is six lines and stays in the repo — it is also the manual
cross-check for the numbers the UI shows later.

**Done when:** the printed monthly nets match the intent (Aug negative), the end
balance is a sane four-digit number, and the file re-generates byte-identical.

## Not in this slice
No app, no parser in `src/`, no framework.
