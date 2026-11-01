# Java app

Finanzuhu implemented with Java 25, Spring Boot 4, Thymeleaf, responsive CSS,
small browser JavaScript modules, and locally served Chart.js (via WebJars).
It reads the same repository-level `data/` files as the TypeScript app.

## Run

From the repository root (Java 25 required; Maven is downloaded by the wrapper):

```bash
./apps/java/mvnw -f apps/java/pom.xml spring-boot:run
```

Open http://localhost:8080. Screens: Overview (`/`) and Transactions
(`/transactions`). Set `PORT` to use a different port.

The default data path is `../../data`, relative to the application working
directory. The Maven run command launches the app from `apps/java/`.
To launch the packaged application from the repository root:

```bash
./apps/java/mvnw -f apps/java/pom.xml verify
java -jar apps/java/target/finanzuhu-0.1.0.jar --finanzuhu.data-dir=data
```

`FINANZUHU_DATA_DIR` can specify an absolute data directory for any launch
location. Data is loaded once at startup; restart after editing it. Missing,
empty, malformed, or unsorted ledgers fail startup with a descriptive error.

## Tests

```bash
./apps/java/mvnw -f apps/java/pom.xml verify
# Install Chromium once, then run the browser tests as well:
./apps/java/mvnw -f apps/java/pom.xml exec:java \
  -Dexec.mainClass=com.microsoft.playwright.CLI \
  -Dexec.classpathScope=test -Dexec.args="install chromium"
./apps/java/mvnw -f apps/java/pom.xml -Pbrowser-tests verify
```

Domain tests cover rolling ranges (including JavaScript month overflow),
category shares, chart balances, and recurring-cost reserves. HTTP integration
tests exercise the real server and shared ledger. Browser tests exercise
navigation, filtering, sorting, themes, charts, error recovery, and mobile
layouts. Screenshots are written to `apps/java/target/`.

For full response parity against the TypeScript financial functions, start the
Java app, then run (Node 22.18+ is only needed for this comparison):

```bash
cd apps/java
node src/test/parity.mjs http://localhost:8080
```

## Structure and behavior

- Pure money calculations: `src/main/java/de/finanzuhu/domain/Finance.java`.
- Immutable shared-data loader: `data/LedgerRepository.java`.
- Query services: `service/`; page and JSON controllers: `web/`.
- Templates: `src/main/resources/templates/`; browser modules and CSS: `static/`.
- APIs: `/api/summary?range=week|month|3m` and
  `/api/transactions?q=...&category=...&type=income|expense`.

The dashboard starts with Month; the summary API defaults to 3 Months for
missing or unsupported ranges. The last booking defines “today”. Money uses
`BigDecimal` and is serialized as JSON numbers. Free to spend reserves the
latest recurring expense for each counterparty/category pair. The final
seven-day chart bucket follows the TypeScript implementation without clipping
its end to the reference date.

Successful browser requests are cached for the page lifetime, failed requests
are retried once, and stale responses cannot replace newer filter results.
Date and money formatting uses `de-DE`; theme preferences persist in local
storage. The chart also has an accessible data-table alternative.
