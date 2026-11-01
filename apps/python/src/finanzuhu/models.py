"""Typed records used by the data and finance layers."""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Literal, TypedDict


class TransactionJSON(TypedDict):
    id: str
    date: str
    amount: float
    description: str
    counterparty: str
    category: str
    type: Literal["income", "expense"]
    method: str
    recurring: bool


@dataclass(frozen=True)
class Transaction:
    id: str
    date: date
    amount: Decimal
    description: str
    counterparty: str
    category: str
    type: Literal["income", "expense"]
    method: str
    recurring: bool

    def to_json(self) -> TransactionJSON:
        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "amount": float(self.amount),
            "description": self.description,
            "counterparty": self.counterparty,
            "category": self.category,
            "type": self.type,
            "method": self.method,
            "recurring": self.recurring,
        }


@dataclass(frozen=True)
class Account:
    name: str
    opening_balance: Decimal
    opening_date: date
