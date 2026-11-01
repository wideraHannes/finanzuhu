# Python app tests

Python domain and API tests use pytest. Run them from this directory with
`uv run --extra dev pytest` or `uv run pytest` after installing the dev extra.
The integration suite checks API contracts and key output against the committed
shared ledger. Browser interactions can also be checked manually using the
acceptance checklist in `README.md`.
