"""HTML views and JSON read APIs."""

from flask import Flask, jsonify, render_template, request

from finanzuhu.finance import RANGES
from finanzuhu.models import Account, Transaction
from finanzuhu.services import summary_payload, transaction_payload


def register_routes(app: Flask) -> None:
    @app.get("/")
    def overview():
        return render_template("overview.html", account=_account(app))

    @app.get("/transactions")
    def transactions_page():
        return render_template("transactions.html", account=_account(app))

    @app.get("/api/summary")
    def summary_api():
        requested_range = request.args.get("range", "")
        range_name = requested_range if requested_range in RANGES else "3m"
        return jsonify(summary_payload(_transactions(app), _account(app), range_name))

    @app.get("/api/transactions")
    def transactions_api():
        query = request.args.get("q", "")
        category = request.args.get("category", "")
        transaction_type = request.args.get("type", "")
        if len(query) > 200:
            return jsonify({"error": "Search text must be 200 characters or fewer."}), 400
        if len(category) > 100:
            return jsonify({"error": "Category must be 100 characters or fewer."}), 400
        return jsonify(transaction_payload(_transactions(app), query, category, transaction_type))


def _account(app: Flask) -> Account:
    return app.extensions["finanzuhu_account"]


def _transactions(app: Flask) -> tuple[Transaction, ...]:
    return app.extensions["finanzuhu_transactions"]
