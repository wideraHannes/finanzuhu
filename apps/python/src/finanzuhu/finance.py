"""Pure financial functions over immutable transactions."""

from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal
from typing import Literal, TypedDict

from finanzuhu.models import Transaction

Range = Literal["week", "month", "3m"]
RANGES: tuple[Range, ...] = ("week", "month", "3m")
ZERO = Decimal("0.00")


class Summary(TypedDict):
    income: Decimal
    expenses: Decimal
    net: Decimal


def _subtract_months_with_overflow(reference: date, months: int) -> date:
    """Match JavaScript UTC setMonth overflow when the target month is shorter."""
    month_index = reference.year * 12 + reference.month - 1 - months
    year, month_zero_indexed = divmod(month_index, 12)
    month = month_zero_indexed + 1
    first_of_month = date(year, month, 1)
    return first_of_month + timedelta(days=reference.day - 1)


def range_start(range_name: Range, reference: date) -> date:
    """Return the first included date in a dashboard range."""
    if range_name == "week":
        return reference - timedelta(days=6)
    months = 1 if range_name == "month" else 3
    return _subtract_months_with_overflow(reference, months) + timedelta(days=1)


def in_range(
    transactions: tuple[Transaction, ...], range_name: Range, reference: date
) -> list[Transaction]:
    start = range_start(range_name, reference)
    return [transaction for transaction in transactions if start <= transaction.date <= reference]


def balance(transactions: tuple[Transaction, ...], opening: Decimal) -> Decimal:
    return opening + sum((transaction.amount for transaction in transactions), ZERO)


def summarize(transactions: tuple[Transaction, ...], range_name: Range, reference: date) -> Summary:
    income = ZERO
    expenses = ZERO
    for transaction in in_range(transactions, range_name, reference):
        if transaction.amount >= ZERO:
            income += transaction.amount
        else:
            expenses -= transaction.amount
    return {"income": income, "expenses": expenses, "net": income - expenses}


def by_category(
    transactions: tuple[Transaction, ...], range_name: Range, reference: date
) -> list[dict[str, Decimal | str]]:
    totals: dict[str, Decimal] = defaultdict(lambda: ZERO)
    for transaction in in_range(transactions, range_name, reference):
        if transaction.amount < ZERO:
            totals[transaction.category] += -transaction.amount
    all_expenses = sum(totals.values(), ZERO)
    return [
        {
            "category": category,
            "total": total,
            "share": total / all_expenses if all_expenses else ZERO,
        }
        for category, total in sorted(totals.items(), key=lambda item: -item[1])
    ]


def daily_series(
    transactions: tuple[Transaction, ...],
    range_name: Range,
    reference: date,
    opening: Decimal,
) -> list[dict[str, date | Decimal]]:
    start = range_start(range_name, reference)
    bucket_days = 7 if range_name == "3m" else 1
    running = opening + sum(
        (transaction.amount for transaction in transactions if transaction.date < start), ZERO
    )
    points: list[dict[str, date | Decimal]] = []
    current = start
    while current <= reference:
        boundary = current + timedelta(days=bucket_days)
        income = sum(
            (
                transaction.amount
                for transaction in transactions
                if current <= transaction.date < boundary and transaction.amount >= ZERO
            ),
            ZERO,
        )
        expenses = sum(
            (
                -transaction.amount
                for transaction in transactions
                if current <= transaction.date < boundary and transaction.amount < ZERO
            ),
            ZERO,
        )
        running += income - expenses
        points.append({"date": current, "income": income, "expenses": expenses, "balance": running})
        current = boundary
    return points


def free_to_spend(transactions: tuple[Transaction, ...], current_balance: Decimal) -> Decimal:
    """Subtract the latest expense for each recurring counterparty/category."""
    per_contract: dict[tuple[str, str], Decimal] = {}
    for transaction in transactions:
        if transaction.recurring and transaction.amount < ZERO:
            per_contract[(transaction.counterparty, transaction.category)] = -transaction.amount
    return current_balance - sum(per_contract.values(), ZERO)
