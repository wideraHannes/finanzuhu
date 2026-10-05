# ST-005 — Implementation plan: Transaction CSV export

**Story:** [`refined/ST-005.md`](../../refined/done/ST-005.md)

## Approach

Add an **Export CSV** action to `/transactions`. On click it fetches the
unfiltered ledger, serializes the five visible table fields, and starts a
browser download. Keep serialization pure and test it directly.

## Changes

1. **New `src/features/transactions/transaction-csv.ts`**
   - Add a pure function that converts `Transaction[]` to CSV.
   - Preserve the input order and output exactly: date, description, category,
     method, amount.
   - Reuse the table's date, amount, and method display formatting; safely
     escape CSV fields.

2. **`src/lib/format.ts` and `src/features/transactions/transaction-table.tsx`**
   - Move the table's private method-label formatter into the shared format
     module and use it in both the table and CSV serializer, preventing format
     drift.

3. **`src/app/transactions/page.tsx`**
   - Add the export control.
   - Fetch `fetchTransactions(NO_FILTERS)` on activation, not the currently
     displayed filtered list.
   - Download the generated CSV via a browser `Blob` and object URL; show a
     concise failure state if the request fails. No mutation or navigation.

4. **New `tests/unit/transaction-csv.test.ts`**
   - Cover header/field order, table-equivalent German date and signed amount
     formatting, method labels, CSV escaping, preserved input order, and
     exclusion of non-exported fields.

## Data flow

`GET /api/transactions` (without filters) → `fetchTransactions(NO_FILTERS)` →
`transactionsToCsv()` → browser download.

The existing endpoint already returns the complete ledger in its stored order,
so no API or data-layer change is planned.

## Acceptance-criteria verification

| AC  | Verification                                                                              |
| --- | ----------------------------------------------------------------------------------------- |
| 1–2 | Manually confirm the Transactions page download action creates a file without navigation. |
| 3   | Manually apply filters, export, and confirm all ledger entries are present.               |
| 4–6 | Unit-test serializer columns, values, and input order.                                    |
| 7   | Manually confirm exporting leaves the table and ledger unchanged.                         |

## Open decisions

- Filename is unresolved.
- CSV dialect is unresolved. For German-formatted amounts, confirm delimiter,
  encoding/BOM, quoting, and spreadsheet target before implementation. A
  semicolon-delimited UTF-8 CSV is a practical default but is not assumed here.