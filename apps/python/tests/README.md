# Python app tests

Python domain and API tests use pytest. Run them from this directory with
`pytest` after creating and activating the virtual environment and installing
the development dependencies with `python -m pip install -e ".[dev]"`.
The integration suite checks API contracts and key output against the committed
shared ledger. Browser interactions can also be checked manually using the
acceptance checklist in `README.md`.
