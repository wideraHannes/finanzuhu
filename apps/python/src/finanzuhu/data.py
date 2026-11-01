"""Read and validate the repository's single shared account and ledger files."""

import csv
import json
from datetime import date
from decimal import Decimal, InvalidOperation
from pathlib import Path

from finanzuhu.models import Account, Transaction

DATA_DIRECTORY = Path(__file__).resolve().parents[4] / "data"
TRANSACTION_FIELDS = {
    "id",
    "date",
    "amount",
    "description",
    "counterparty",
    "category",
    "type",
    "method",
    "recurring",
}


class DataError(ValueError):
    """Raised when shared sample data is missing or invalid."""


def load_account() -> Account:
    """Load the demo account without relying on the current working directory."""
    path = DATA_DIRECTORY / "account.json"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        name = payload["name"]
        opening_balance = Decimal(str(payload["openingBalance"]))
        opening_date = date.fromisoformat(payload["openingDate"])
        if not isinstance(name, str) or not name.strip():
            raise ValueError("account name must be a non-empty string")
    except (
        OSError,
        json.JSONDecodeError,
        KeyError,
        TypeError,
        ValueError,
        InvalidOperation,
    ) as error:
        raise DataError(f"Could not load valid account data from {path}: {error}") from error
    return Account(name, opening_balance, opening_date)


def load_transactions() -> tuple[Transaction, ...]:
    """Parse the ledger once, preserving its source order."""
    path = DATA_DIRECTORY / "transactions.csv"
    transactions: list[Transaction] = []
    try:
        with path.open(newline="", encoding="utf-8") as source:
            reader = csv.DictReader(source)
            if set(reader.fieldnames or ()) != TRANSACTION_FIELDS:
                raise ValueError("unexpected transaction CSV columns")
            for row in reader:
                if None in row or any(value is None for value in row.values()):
                    raise ValueError("transaction row has a missing or extra field")
                amount = Decimal(row["amount"])
                if not amount.is_finite():
                    raise ValueError("transaction amount must be finite")
                transaction_type = row["type"]
                if transaction_type not in {"income", "expense"}:
                    raise ValueError(f"unknown transaction type: {transaction_type}")
                if (amount >= 0) != (transaction_type == "income"):
                    raise ValueError("transaction type does not match signed amount")
                recurring = row["recurring"]
                if recurring not in {"true", "false"}:
                    raise ValueError("recurring must be true or false")
                transactions.append(
                    Transaction(
                        id=row["id"],
                        date=date.fromisoformat(row["date"]),
                        amount=amount,
                        description=row["description"],
                        counterparty=row["counterparty"],
                        category=row["category"],
                        type=transaction_type,
                        method=row["method"],
                        recurring=recurring == "true",
                    )
                )
    except (OSError, csv.Error, KeyError, TypeError, ValueError, InvalidOperation) as error:
        if isinstance(error, DataError):
            raise
        raise DataError(f"Could not load valid transaction data from {path}: {error}") from error
    if not transactions:
        raise DataError(f"Transaction ledger at {path} must not be empty")
    return tuple(transactions)
