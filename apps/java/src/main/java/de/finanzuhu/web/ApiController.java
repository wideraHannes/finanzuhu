package de.finanzuhu.web;

import de.finanzuhu.service.SummaryService;
import de.finanzuhu.service.TransactionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {
    private final SummaryService summaries;
    private final TransactionService transactions;

    public ApiController(SummaryService summaries, TransactionService transactions) {
        this.summaries = summaries;
        this.transactions = transactions;
    }

    @GetMapping("/api/summary")
    public SummaryService.Response summary(@RequestParam(defaultValue = "3m") String range) {
        return summaries.summary(range);
    }

    @GetMapping("/api/transactions")
    public TransactionService.Response transactions(@RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "") String category, @RequestParam(defaultValue = "") String type) {
        return transactions.transactions(q, category, type);
    }
}
