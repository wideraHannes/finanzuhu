package de.finanzuhu.browser;

import com.microsoft.playwright.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import java.nio.file.Path;
import java.util.ArrayList;
import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;
import static org.assertj.core.api.Assertions.assertThat;

@EnabledIfSystemProperty(named = "browser.tests", matches = "true")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class BrowserTest {
    @LocalServerPort int port;

    @Test void overviewFiltersSortingThemesAndResponsiveLayouts() {
        try (Playwright playwright = Playwright.create(); Browser browser = playwright.chromium().launch()) {
            Page page = browser.newPage(new Browser.NewPageOptions().setViewportSize(1280, 900));
            var errors = new ArrayList<String>();
            page.onPageError(errors::add);
            page.navigate("http://localhost:" + port);
            assertThat(page.locator("#balance")).containsText("7.846,85");
            assertThat(page.locator("#free-to-spend")).containsText("6.446,19");
            assertThat(page.locator("#chart-data tr")).hasCount(31);
            assertThat(page.locator("#recent li")).hasCount(8);
            assertThat(page.locator("#categories li")).hasCount(6);
            assertThat(page.locator("#summary-error")).isHidden();
            assertThat(page.evaluate("typeof Chart.getChart(document.querySelector('#cashflow'))")).isEqualTo("object");
            page.evaluate("""
                const chart = Chart.getChart(document.querySelector('#cashflow'));
                const point = chart.getDatasetMeta(0).data[10];
                chart.tooltip.setActiveElements([{ datasetIndex: 0, index: 10 }], { x: point.x, y: point.y });
                chart.update();
                """);
            assertThat(page.evaluate("Chart.getChart(document.querySelector('#cashflow')).tooltip.title.length > 0")).isEqualTo(true);
            page.screenshot(new Page.ScreenshotOptions().setPath(Path.of("target/overview-dark.png")).setFullPage(true));
            page.locator("[data-range=week]").click();
            assertThat(page.locator("#income")).containsText("3.045,00");
            assertThat(page.locator("#chart-data tr")).hasCount(7);
            page.locator("[data-range='3m']").click();
            assertThat(page.locator("#chart-data tr")).hasCount(14);
            page.locator("#theme-toggle").click();
            assertThat(page.locator("html")).hasAttribute("data-theme", "light");
            page.screenshot(new Page.ScreenshotOptions().setPath(Path.of("target/overview-desktop.png")).setFullPage(true));
            page.locator("a[href='/transactions']").first().click();
            assertThat(page.locator("#bookings tr")).hasCount(131);
            assertThat(page.locator("html")).hasAttribute("data-theme", "light");
            page.locator("#search").fill("FORREST");
            assertThat(page.locator("#bookings tr")).hasCount(3);
            page.locator("#category").selectOption("Salary");
            page.locator("[data-type=expense]").click();
            assertThat(page.locator("#empty-results")).isVisible();
            assertThat(page.locator("#category option")).hasCount(23);
            page.locator("#clear-filters").click();
            assertThat(page.locator("#bookings tr")).hasCount(131);
            page.locator("[data-sort=amount]").click();
            assertThat(page.locator("#amount-heading")).hasAttribute("aria-sort", "descending");
            assertThat(page.locator("#bookings tr").first()).containsText("+3.000,00");
            page.locator("[data-sort=amount]").click();
            assertThat(page.locator("#bookings tr").first()).containsText("-800,00");
            page.setViewportSize(380, 820);
            assertThat(page.locator("td.wide").first()).isHidden();
            assertThat(page.evaluate("document.documentElement.scrollWidth <= innerWidth")).isEqualTo(true);
            page.screenshot(new Page.ScreenshotOptions().setPath(Path.of("target/transactions-mobile.png")).setFullPage(true));
            page.locator("a[href='/']").last().click();
            assertThat(page.locator("#chart-data tr")).hasCount(31);
            assertThat(page.evaluate("document.documentElement.scrollWidth <= innerWidth")).isEqualTo(true);
            page.screenshot(new Page.ScreenshotOptions().setPath(Path.of("target/overview-mobile.png")).setFullPage(true));
            page.setViewportSize(768, 1024);
            assertThat(page.evaluate("document.documentElement.scrollWidth <= innerWidth")).isEqualTo(true);
            assertThat(errors).isEmpty();
        }
    }

    @Test void loadingFailureAndRetryRecoverWithoutStaleResults() {
        try (Playwright playwright = Playwright.create(); Browser browser = playwright.chromium().launch()) {
            Page page = browser.newPage();
            page.route("**/api/summary*", route -> route.fulfill(new Route.FulfillOptions().setStatus(503).setBody("Unavailable")));
            page.navigate("http://localhost:" + port);
            assertThat(page.locator("#summary-error")).isVisible();
            page.unroute("**/api/summary*");
            page.locator("#summary-retry").click();
            assertThat(page.locator("#summary-error")).isHidden();
            assertThat(page.locator("#chart-data tr")).hasCount(31);
            page.route("**/api/transactions*", route -> route.fulfill(new Route.FulfillOptions().setStatus(503)));
            page.navigate("http://localhost:" + port + "/transactions");
            assertThat(page.locator("#transactions-error")).isVisible();
            page.unroute("**/api/transactions*");
            page.locator("#transactions-retry").click();
            assertThat(page.locator("#bookings tr")).hasCount(131);
            page.locator("#search").fill("Rent");
            page.locator("#search").fill("Salary");
            assertThat(page.locator("#bookings tr")).hasCount(3);
            assertThat(page.locator("#bookings")).containsText("Salary");
        }
    }
}
