"""Assemble API payloads from the ledger and pure domain calculations."""

from datetime import date

from finanzuhu.finance import (
    RANGES,
    Range,
    balance,
    by_category,
    daily_series,
    free_to_spend,
    summarize,
)
from finanzuhu.models import Account, Transaction


def reference_date(transactions: tuple[Transaction, ...]) -> date:
    return transactions[-1].date


def summary_payload(
    transactions: tuple[Transaction, ...], account: Account, range_name: Range
) -> dict:
    reference = reference_date(transactions)
    current_balance = balance(transactions, account.opening_balance)
    return {
        "balance": float(current_balance),
        "freeToSpend": float(free_to_spend(transactions, current_balance)),
        "asOf": reference.isoformat(),
        "range": range_name,
        **{
            key: float(value)
            for key, value in summarize(transactions, range_name, reference).items()
        },
        "series": [
            {
                key: value.isoformat() if key == "date" else float(value)
                for key, value in point.items()
            }
            for point in daily_series(transactions, range_name, reference, account.opening_balance)
        ],
        "categories": [
            {key: float(value) if key != "category" else value for key, value in category.items()}
            for category in by_category(transactions, range_name, reference)
        ],
    }


def transaction_payload(
    transactions: tuple[Transaction, ...], query: str, category: str, transaction_type: str
) -> dict:
    normalized_query = query.casefold()
    items = [
        transaction.to_json()
        for transaction in transactions
        if (not normalized_query or normalized_query in transaction.description.casefold()
            or normalized_query in transaction.counterparty.casefold())
        and (not category or transaction.category == category)
        and (not transaction_type or transaction.type == transaction_type)
    ]
    return {
        "items": items,
        "total": len(transactions),
        "categories": sorted({transaction.category for transaction in transactions}),
    }


__all__ = ["RANGES", "summary_payload", "transaction_payload"]
