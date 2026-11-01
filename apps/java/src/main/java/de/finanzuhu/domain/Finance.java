package de.finanzuhu.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.math.MathContext;

public final class Finance {
    private Finance() {}

    public record Summary(BigDecimal income, BigDecimal expenses, BigDecimal net) {}
    public record CategoryShare(String category, BigDecimal total, BigDecimal share) {}
    public record SeriesPoint(LocalDate date, BigDecimal income, BigDecimal expenses, BigDecimal balance) {}

    public static LocalDate rangeStart(Range range, LocalDate reference) {
        if (range == Range.WEEK) return reference.minusDays(6);
        // Date.setUTCMonth retains the day and overflows into the next month.
        return reference.withDayOfMonth(1).minusMonths(range == Range.MONTH ? 1 : 3)
                .plusDays(reference.getDayOfMonth());
    }

    public static List<Transaction> inRange(List<Transaction> rows, Range range, LocalDate reference) {
        LocalDate start = rangeStart(range, reference);
        return rows.stream().filter(t -> !t.date().isBefore(start) && !t.date().isAfter(reference)).toList();
    }

    public static BigDecimal balance(List<Transaction> rows, BigDecimal opening) {
        return rows.stream().map(Transaction::amount).reduce(opening, BigDecimal::add);
    }
    public static Summary summarize(List<Transaction> rows, Range range, LocalDate reference) {
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expenses = BigDecimal.ZERO;
        for (Transaction row : inRange(rows, range, reference)) {
            if (row.amount().signum() >= 0) income = income.add(row.amount());
            else expenses = expenses.subtract(row.amount());
        }
        return new Summary(income, expenses, income.subtract(expenses));
    }

    public static List<CategoryShare> byCategory(List<Transaction> rows, Range range, LocalDate reference) {
        var totals = new LinkedHashMap<String, BigDecimal>();
        for (Transaction row : inRange(rows, range, reference)) {
            if (row.amount().signum() < 0) totals.merge(row.category(), row.amount().negate(), BigDecimal::add);
        }
        BigDecimal all = totals.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return totals.entrySet().stream()
                .map(entry -> new CategoryShare(entry.getKey(), entry.getValue(), entry.getValue().divide(all, MathContext.DECIMAL128)))
                .sorted((a, b) -> b.total().compareTo(a.total())).toList();
    }

    public static List<SeriesPoint> dailySeries(List<Transaction> rows, Range range, LocalDate reference, BigDecimal opening) {
        LocalDate start = rangeStart(range, reference);
        int days = range == Range.THREE_MONTHS ? 7 : 1;
        BigDecimal running = balance(rows.stream().filter(t -> t.date().isBefore(start)).toList(), opening);
        var points = new ArrayList<SeriesPoint>();
        for (LocalDate from = start; !from.isAfter(reference); from = from.plusDays(days)) {
            BigDecimal income = BigDecimal.ZERO;
            BigDecimal expenses = BigDecimal.ZERO;
            for (Transaction row : rows) {
                if (row.date().isBefore(from) || !row.date().isBefore(from.plusDays(days))) continue;
                if (row.amount().signum() >= 0) income = income.add(row.amount());
                else expenses = expenses.subtract(row.amount());
            }
            running = running.add(income).subtract(expenses);
            points.add(new SeriesPoint(from, income, expenses, running));
        }
        return List.copyOf(points);
    }

    public static BigDecimal freeToSpend(List<Transaction> rows, BigDecimal current) {
        record Contract(String counterparty, String category) {}
        var contracts = new LinkedHashMap<Contract, BigDecimal>();
        for (Transaction row : rows) {
            if (row.recurring() && row.amount().signum() < 0) {
                contracts.put(new Contract(row.counterparty(), row.category()), row.amount().negate());
            }
        }
        return current.subtract(contracts.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add));
    }
}
