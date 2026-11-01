# Architecture

- **Applications:** language-specific implementations live under `apps/`.
  The TypeScript implementation is in `apps/typescript/` and uses Next.js App
  Router, Tailwind CSS, and TanStack Query.
- **Python UI:** the Python implementation is in `apps/python/` and uses Flask,
  Jinja templates, responsive CSS, and small browser JavaScript modules. Pages
  live in `apps/python/src/finanzuhu/templates/`; static assets live in
  `apps/python/src/finanzuhu/static/`.
- **TypeScript UI:** routes live in `apps/typescript/src/app/`; reusable UI lives
  in `apps/typescript/src/components/`; feature-specific UI lives in
  `apps/typescript/src/features/`.
- **Shared data:** committed sample files live once in the repository-level
  `data/` folder and are read by each implementation.
- **TypeScript domain logic:** keep financial calculations as pure functions in
  `apps/typescript/src/lib/`.
- **TypeScript tests:** test domain logic in `apps/typescript/tests/unit/`.
- **Python domain logic:** keep financial calculations as pure functions in
  `apps/python/src/finanzuhu/finance.py`.
- **Python tests:** unit and API integration tests live under
  `apps/python/tests/` and run with pytest.
- **Java UI:** `apps/java/` uses Java 25, Spring Boot, Thymeleaf templates,
  responsive CSS, small JavaScript modules, and locally served Chart.js.
  Templates and static assets live under `apps/java/src/main/resources/`.
- **Java domain logic:** pure financial calculations live in
  `apps/java/src/main/java/de/finanzuhu/domain/Finance.java`; money uses
  `BigDecimal`. A startup-loaded immutable repository reads shared `data/`.
- **Java tests:** domain and HTTP integration tests live under
  `apps/java/src/test/java/`; Playwright Java browser tests use the
  `browser-tests` Maven profile. Build and test with the app's Maven Wrapper.

Keep data flow one-way in each implementation: shared data → API/domain logic →
features → UI.
