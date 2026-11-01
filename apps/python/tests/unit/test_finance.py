from datetime import date
from decimal import Decimal

import pytest

from finanzuhu.finance import (
    balance,
    by_category,
    daily_series,
    free_to_spend,
    range_start,
    summarize,
)
from finanzuhu.models import Transaction


def tx(
    booking_date: str,
    amount: str,
    *,
    recurring: bool = False,
    counterparty: str = "Example",
    category: str = "Groceries",
    identifier: str = "test",
) -> Transaction:
    value = Decimal(amount)
    return Transaction(
        id=identifier,
        date=date.fromisoformat(booking_date),
        amount=value,
        description="Test booking",
        counterparty=counterparty,
        category=category,
        type="income" if value >= 0 else "expense",
        method="card",
        recurring=recurring,
    )


def test_balance_adds_opening_and_every_signed_booking() -> None:
    rows = (tx("2026-09-01", "3000"), tx("2026-09-02", "-800"), tx("2026-09-03", "-45.50"))
    assert balance(rows, Decimal("1000")) == Decimal("3154.50")


def test_week_summary_includes_reference_and_preceding_six_days_only() -> None:
    rows = (tx("2026-09-19", "500"), tx("2026-09-25", "-120"), tx("2026-09-18", "-9999"))
    assert range_start("week", date(2026, 9, 25)) == date(2026, 9, 19)
    assert summarize(rows, "week", date(2026, 9, 25)) == {
        "income": Decimal("500"),
        "expenses": Decimal("120"),
        "net": Decimal("380"),
    }


@pytest.mark.parametrize(
    ("range_name", "reference", "expected"),
    [
        ("month", date(2026, 9, 25), date(2026, 8, 26)),
        ("3m", date(2026, 9, 25), date(2026, 6, 26)),
        # Preserve JavaScript setMonth overflow instead of clamping to month-end.
        ("month", date(2026, 3, 31), date(2026, 3, 4)),
    ],
)
def test_month_ranges_match_javascript_calendar_overflow(range_name, reference, expected) -> None:
    assert range_start(range_name, reference) == expected


def test_category_totals_are_expense_magnitudes_with_shares_of_all_expenses() -> None:
    rows = (
        tx("2026-09-24", "-75", category="Rent"),
        tx("2026-09-25", "-25", category="Food"),
        tx("2026-09-25", "1000"),
    )
    assert by_category(rows, "week", date(2026, 9, 25)) == [
        {"category": "Rent", "total": Decimal("75"), "share": Decimal("0.75")},
        {"category": "Food", "total": Decimal("25"), "share": Decimal("0.25")},
    ]


def test_daily_series_carries_pre_range_balance_and_closes_each_bucket() -> None:
    rows = (tx("2026-09-17", "40"), tx("2026-09-19", "-10"), tx("2026-09-25", "20"))
    points = daily_series(rows, "week", date(2026, 9, 25), Decimal("100"))
    assert len(points) == 7
    assert points[0] == {
        "date": date(2026, 9, 19),
        "income": Decimal("0"),
        "expenses": Decimal("10"),
        "balance": Decimal("130"),
    }
    assert points[-1]["balance"] == Decimal("150")


def test_three_month_series_uses_seven_day_buckets_and_includes_partial_last_bucket() -> None:
    rows = (tx("2026-09-25", "15"),)
    points = daily_series(rows, "3m", date(2026, 9, 25), Decimal("0"))
    assert len(points) == 14
    # The loop emits a final bucket when the reference falls exactly on a
    # bucket boundary, matching the TypeScript implementation.
    assert points[-1]["date"] == date(2026, 9, 25)
    assert points[-1]["income"] == Decimal("15")


def test_free_to_spend_uses_latest_recurring_amount_per_counterparty_and_category() -> None:
    rows = (
        tx("2026-07-01", "-800", recurring=True, category="Rent"),
        tx("2026-08-01", "-825", recurring=True, category="Rent"),
        tx("2026-08-01", "-35", recurring=True, category="Subscriptions"),
        tx("2026-08-02", "-20", recurring=False, category="Rent"),
        tx("2026-08-03", "3000", recurring=True, category="Salary"),
    )
    assert free_to_spend(rows, Decimal("5000")) == Decimal("4140")
