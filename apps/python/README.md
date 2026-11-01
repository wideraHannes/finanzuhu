# Python app

Finanzuhu's Python web app. It uses Flask, server-rendered Jinja templates,
plain responsive CSS, browser JavaScript, and an inline SVG chart. It reads the
shared account and transaction files from the repository's root `data/`
directory; it does not copy or modify that sample data.

## Run

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) and run
from this directory:

```bash
uv sync --extra dev
uv run flask --app finanzuhu run --debug
```

Open http://localhost:5000. Python 3.11 or newer is required.

## Checks

```bash
uv run pytest
uv run ruff check .
```

## Screens and APIs

- Overview: `/`
- Transactions: `/transactions`
- Dashboard summary: `/api/summary?range=week|month|3m`
- Filtered ledger: `/api/transactions?q=...&category=...&type=...`

The app deliberately uses the final booking date as its reference date. It
retains the source app's calendar range boundaries, seven-day buckets for the
three-month chart, latest recurring expense per counterparty/category for the
free-to-spend figure, and source-order filtering before browser-side sorting.

## Browser acceptance checklist

- [ ] Overview range buttons update the chart, category shares, and totals.
- [ ] Overview balance and latest eight bookings match the shared ledger.
- [ ] Search waits briefly after typing and matches descriptions/counterparties.
- [ ] Category and direction filters combine; the count reflects the result.
- [ ] Date and amount headers sort both ways and filters can be cleared.
- [ ] Dark theme is the first-visit default; a selected theme persists after reload.
- [ ] Keyboard focus, empty states, errors, and small-screen layouts remain usable.
