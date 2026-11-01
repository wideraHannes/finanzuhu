package de.finanzuhu.service;

import de.finanzuhu.data.LedgerRepository;
import de.finanzuhu.domain.Finance;
import de.finanzuhu.domain.Range;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class SummaryService {
    private final LedgerRepository ledger;
    public SummaryService(LedgerRepository ledger) { this.ledger = ledger; }

    public record Response(BigDecimal balance, BigDecimal freeToSpend, LocalDate asOf, String range,
            BigDecimal income, BigDecimal expenses, BigDecimal net,
            List<Finance.SeriesPoint> series, List<Finance.CategoryShare> categories) {}

    public Response summary(String value) {
        Range range = Range.from(value);
        var rows = ledger.transactions();
        var reference = ledger.referenceDate();
        var current = Finance.balance(rows, ledger.account().openingBalance());
        var totals = Finance.summarize(rows, range, reference);
        return new Response(current, Finance.freeToSpend(rows, current), reference, range.value(),
                totals.income(), totals.expenses(), totals.net(),
                Finance.dailySeries(rows, range, reference, ledger.account().openingBalance()),
                Finance.byCategory(rows, range, reference));
    }
}
