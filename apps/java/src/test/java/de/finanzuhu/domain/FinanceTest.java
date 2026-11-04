package de.finanzuhu.domain;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

class FinanceTest {
    private static final LocalDate REFERENCE = LocalDate.parse("2026-09-25");

    private Transaction tx(String date, String amount, String category, String party, boolean recurring) {
        return new Transaction(date + amount, LocalDate.parse(date), new BigDecimal(amount),
                "Test", party, category, "expense", "card", recurring);
    }

    @Test void addsOpeningAndAllBookings() {
        assertThat(Finance.balance(List.of(tx("2026-09-01", "3000", "Salary", "Employer", false),
                tx("2026-09-02", "-800", "Rent", "Landlord", true),
                tx("2026-09-03", "-45.50", "Groceries", "Shop", false)), new BigDecimal("1000")))
                .isEqualByComparingTo("3154.50");
    }

    @Test void rollingRangesIncludeBothBoundariesAndIgnoreTheClock() {
        assertThat(Finance.rangeStart(Range.WEEK, REFERENCE)).isEqualTo(LocalDate.parse("2026-09-19"));
        assertThat(Finance.rangeStart(Range.MONTH, REFERENCE)).isEqualTo(LocalDate.parse("2026-08-26"));
        assertThat(Finance.rangeStart(Range.THREE_MONTHS, REFERENCE)).isEqualTo(LocalDate.parse("2026-06-26"));
        var summary = Finance.summarize(List.of(tx("2026-09-18", "-999", "Other", "Shop", false),
                tx("2026-09-19", "500", "Salary", "Employer", false),
                tx("2026-09-25", "-120", "Rent", "Landlord", false),
                tx("2026-09-26", "999", "Other", "Shop", false)), Range.WEEK, REFERENCE);
        assertThat(summary.income()).isEqualByComparingTo("500");
        assertThat(summary.expenses()).isEqualByComparingTo("120");
        assertThat(summary.net()).isEqualByComparingTo("380");
    }

    @Test void monthSubtractionMatchesJavascriptOverflowRatherThanJavaClamping() {
        assertThat(Finance.rangeStart(Range.MONTH, LocalDate.parse("2026-03-31"))).isEqualTo(LocalDate.parse("2026-03-04"));
        assertThat(Finance.rangeStart(Range.MONTH, LocalDate.parse("2024-03-31"))).isEqualTo(LocalDate.parse("2024-03-03"));
        assertThat(Finance.rangeStart(Range.THREE_MONTHS, LocalDate.parse("2026-01-31"))).isEqualTo(LocalDate.parse("2025-11-01"));
    }

    @Test void categoriesUseOnlyExpensesAndStableDescendingTotals() {
        var categories = Finance.byCategory(List.of(tx("2026-09-20", "-75", "Rent", "A", false),
                tx("2026-09-20", "-25", "Food", "B", false),
                tx("2026-09-20", "1000", "Salary", "C", false)), Range.WEEK, REFERENCE);
        assertThat(categories).extracting(Finance.CategoryShare::category).containsExactly("Rent", "Food");
        assertThat(categories.get(0).share()).isEqualByComparingTo("0.75");
        assertThat(Finance.byCategory(List.of(), Range.MONTH, REFERENCE)).isEmpty();
    }

    @Test void chartIncludesEarlierBalanceZeroDaysAndAnUnclippedFinalWeeklyBucket() {
        var rows = List.of(tx("2026-09-01", "100", "Salary", "A", false),
                tx("2026-09-19", "-20", "Food", "B", false),
                tx("2026-09-25", "50", "Salary", "A", false));
        var series = Finance.dailySeries(rows, Range.WEEK, REFERENCE, new BigDecimal("1000"));
        assertThat(series).hasSize(7);
        assertThat(series.get(0).balance()).isEqualByComparingTo("1080");
        assertThat(series.get(1).expenses()).isZero();
        assertThat(series.get(series.size() - 1).balance()).isEqualByComparingTo("1130");
        var weekly = Finance.dailySeries(List.of(tx("2026-09-26", "10", "Salary", "A", false)),
                Range.THREE_MONTHS, REFERENCE, BigDecimal.ZERO);
        assertThat(weekly).hasSize(14);
        assertThat(weekly.get(weekly.size() - 1).balance()).isEqualByComparingTo("10");
    }

    @Test void reserveUsesLatestExpensePerContractAndCanMakeFreeToSpendNegative() {
        var rows = List.of(tx("2026-08-01", "-80", "Rent", "A", true),
                tx("2026-09-01", "-100", "Rent", "A", true),
                tx("2026-09-02", "-20", "Insurance", "A", true),
                tx("2026-09-03", "3000", "Salary", "B", true),
                tx("2026-09-04", "-99", "Food", "C", false));
        assertThat(Finance.freeToSpend(rows, new BigDecimal("110"))).isEqualByComparingTo("-10");
        assertThat(Finance.balance(List.of(), new BigDecimal("10"))).isEqualByComparingTo("10");
        assertThat(Finance.summarize(List.of(), Range.WEEK, REFERENCE).net()).isZero();
    }
}
