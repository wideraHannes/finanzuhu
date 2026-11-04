<div align="center">

<img src="apps/typescript/public/finanzuhu-logo.png" alt="Finanzuhu" width="420">

# AI-Assisted Enablement Repository

**A starter project for AI-assisted development. Make it whatever you need.**

</div>

## Choose an app

Finanzuhu is a teaching project for AI-assisted coding. Choose a language
implementation under [`apps/`](apps/); each app has its own stack and setup.
Shared workflow, sample data, and tickets stay at the repository root.

The TypeScript web app is in [`apps/typescript/`](apps/typescript/README.md).
The Python web app is in [`apps/python/`](apps/python/README.md).
The Java web app is in [`apps/java/`](apps/java/README.md).

## Quickstart: TypeScript

```bash
npm --prefix apps/typescript install
npm --prefix apps/typescript run dev     # http://localhost:3000
npm --prefix apps/typescript test
```

Then take the first ticket through the loop in OpenCode:

```text
/refine-ticket ST-001
```

## Quickstart: Python

```bash
cd apps/python
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
flask --app finanzuhu run --debug  # http://localhost:5000
pytest
ruff check .
```

## Quickstart: Java

```bash
./apps/java/mvnw -f apps/java/pom.xml spring-boot:run  # http://localhost:8080
./apps/java/mvnw -f apps/java/pom.xml verify
```

Requires Java 25. See the [Java README](apps/java/README.md) for browser tests
and packaged-JAR setup.

## Finanzuhu, the starter app

<img src="assets/app-demo.png" alt="The Finanzuhu overview: balance, cashflow chart, in-out-net tiles" width="820">

Two screens: **Overview** (`/`) and **Transactions** (`/transactions`). The TypeScript app
uses Next.js, Tailwind v4, shadcn/ui, TanStack Query, Recharts, and Vitest. The
Python implementation uses Flask, Jinja templates, responsive CSS, browser
JavaScript, an inline SVG chart, and pytest.
The Java implementation uses Spring Boot, Thymeleaf, responsive CSS, browser
JavaScript, Chart.js, JUnit, and Playwright for Java.

- **Shared static data:** root `data/transactions.csv` and `data/account.json`.
  No database, no clock, the same numbers on every machine and in every app.
- **Seams:** UI (pages), API (`/api/summary`, `/api/transactions`), domain
  (pure functions in each app's finance module).

Demo only, not a real financial product.

<div align="center">
  <a href="https://www.codecentric.de/">
    <img src="assets/codecentric_PrimLogo_farbe_rgb.png" alt="codecentric" width="180">
  </a>
  <br>
  <sub>Created in the workshop <em>AI-Assisted Coding</em> ·
  <a href="https://www.codecentric.de/">codecentric AG</a></sub>
</div>
