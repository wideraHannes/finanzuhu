package de.finanzuhu.service;

import de.finanzuhu.data.LedgerRepository;
import de.finanzuhu.domain.Transaction;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Locale;

@Service
public class TransactionService {
    private final LedgerRepository ledger;
    public TransactionService(LedgerRepository ledger) { this.ledger = ledger; }
    public record Response(List<Transaction> items, int total, List<String> categories) {}

    public Response transactions(String q, String category, String type) {
        String search = q.toLowerCase(Locale.ROOT);
        var all = ledger.transactions();
        var items = all.stream().filter(t ->
                (search.isEmpty() || t.description().toLowerCase(Locale.ROOT).contains(search)
                        || t.counterparty().toLowerCase(Locale.ROOT).contains(search))
                && (category.isEmpty() || t.category().equals(category))
                && (type.isEmpty() || t.type().equals(type))).toList();
        return new Response(items, all.size(), all.stream().map(Transaction::category).distinct().sorted().toList());
    }
}
