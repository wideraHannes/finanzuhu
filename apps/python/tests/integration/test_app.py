from decimal import Decimal

from finanzuhu import create_app


def test_shared_data_and_api_parity_values() -> None:
    app = create_app({"TESTING": True})
    client = app.test_client()
    response = client.get("/api/summary?range=month")
    assert response.status_code == 200
    data = response.get_json()
    assert data["asOf"] == "2026-09-25"
    assert data["balance"] == 7846.85
    assert data["freeToSpend"] == 6446.19
    assert (data["income"], data["expenses"], data["net"]) == (3386.8, 2762.39, 624.41)
    assert data["range"] == "month"
    assert len(data["series"]) == 31
    assert data["categories"][0]["category"] == "Rent"
    assert app.extensions["finanzuhu_account"].opening_balance == Decimal("6450.00")
    assert len(app.extensions["finanzuhu_transactions"]) == 131


def test_summary_uses_three_months_for_missing_or_unsupported_range() -> None:
    client = create_app({"TESTING": True}).test_client()
    assert client.get("/api/summary").get_json()["range"] == "3m"
    assert client.get("/api/summary?range=invalid").get_json()["range"] == "3m"
    assert len(client.get("/api/summary?range=3m").get_json()["series"]) == 14


def test_transaction_filters_combine_case_insensitive_search_category_and_type() -> None:
    client = create_app({"TESTING": True}).test_client()
    response = client.get("/api/transactions?q=HVV&category=Mobility&type=expense")
    data = response.get_json()
    assert response.status_code == 200
    assert data["total"] == 131
    assert "Mobility" in data["categories"]
    assert [item["id"] for item in data["items"]] == [
        "tx_0002",
        "tx_0010",
        "tx_0046",
        "tx_0094",
        "tx_0124",
    ]


def test_transaction_payload_preserves_csv_order_and_returns_stable_categories() -> None:
    client = create_app({"TESTING": True}).test_client()
    data = client.get("/api/transactions?type=income").get_json()
    assert [item["id"] for item in data["items"]] == [
        "tx_0039",
        "tx_0087",
        "tx_0107",
        "tx_0126",
        "tx_0130",
    ]
    assert data["categories"] == sorted(data["categories"])


def test_invalid_and_oversized_filter_inputs_return_clear_client_errors() -> None:
    client = create_app({"TESTING": True}).test_client()
    unknown_type = client.get("/api/transactions?type=transfer")
    assert unknown_type.status_code == 200
    assert unknown_type.get_json()["items"] == []
    assert client.get(f"/api/transactions?q={'x' * 201}").status_code == 400
    assert client.get(f"/api/transactions?category={'x' * 101}").status_code == 400


def test_both_pages_render_accessible_navigation_and_controls() -> None:
    client = create_app({"TESTING": True}).test_client()
    overview = client.get("/").get_data(as_text=True)
    transactions = client.get("/transactions").get_data(as_text=True)
    assert "aria-current=\"page\"" in overview
    assert "data-range=\"month\"" in overview
    assert "cashflow-chart" in overview
    assert "Search description or counterparty" in transactions
    assert "data-sort=\"date\"" in transactions
    assert "data-sort=\"amount\"" in transactions
