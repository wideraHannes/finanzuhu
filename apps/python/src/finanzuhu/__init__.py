"""Finanzuhu's Python web application."""

from flask import Flask

from finanzuhu.data import load_account, load_transactions
from finanzuhu.routes import register_routes


def create_app(test_config: dict | None = None) -> Flask:
    """Create the Flask app, loading the shared ledger once per process."""
    app = Flask(__name__)
    app.config.from_mapping(TESTING=False)
    if test_config:
        app.config.update(test_config)

    app.extensions["finanzuhu_account"] = load_account()
    app.extensions["finanzuhu_transactions"] = load_transactions()
    register_routes(app)
    return app
