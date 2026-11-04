package de.finanzuhu.data;

import de.finanzuhu.domain.Account;
import de.finanzuhu.domain.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.json.JsonMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Repository
public class LedgerRepository {
    private final Account account;
    private final List<Transaction> transactions;

    public LedgerRepository(@Value("${finanzuhu.data-dir}") String directory) {
        Path path = Path.of(directory).toAbsolutePath().normalize();
        try {
            account = JsonMapper.builder().build().readValue(Files.readString(path.resolve("account.json")), Account.class);
            if (account.name() == null || account.name().isBlank() || account.openingBalance() == null || account.openingDate() == null) {
                throw new IllegalArgumentException("Account fields are required");
            }
            List<String> lines = Files.readAllLines(path.resolve("transactions.csv"));
            if (lines.isEmpty() || !lines.get(0).equals("id,date,amount,description,counterparty,category,type,method,recurring")) {
                throw new IllegalArgumentException("Unexpected ledger header");
            }
            var rows = new ArrayList<Transaction>();
            var ids = new HashSet<String>();
            for (int i = 1; i < lines.size(); i++) {
                // The committed CSV has no quoted fields or embedded commas.
                String[] fields = lines.get(i).split(",", -1);
                if (fields.length != 9) throw new IllegalArgumentException("Expected nine fields at line " + (i + 1));
                for (String field : fields) if (field.isBlank()) throw new IllegalArgumentException("Empty field at line " + (i + 1));
                if (!ids.add(fields[0])) throw new IllegalArgumentException("Duplicate booking ID: " + fields[0]);
                if (!List.of("income", "expense").contains(fields[6]) || !List.of("true", "false").contains(fields[8])) {
                    throw new IllegalArgumentException("Invalid type or recurring flag at line " + (i + 1));
                }
                var row = new Transaction(fields[0], LocalDate.parse(fields[1]), new BigDecimal(fields[2]),
                        fields[3], fields[4], fields[5], fields[6], fields[7], Boolean.parseBoolean(fields[8]));
                if (!rows.isEmpty() && row.date().isBefore(rows.get(rows.size() - 1).date())) {
                    throw new IllegalArgumentException("Ledger must be sorted by date");
                }
                rows.add(row);
            }
            if (rows.isEmpty()) throw new IllegalArgumentException("Ledger contains no bookings");
            transactions = List.copyOf(rows);
        } catch (Exception e) {
            throw new IllegalStateException("Cannot load shared Finanzuhu data from " + path + ": " + e.getMessage(), e);
        }
    }

    public Account account() { return account; }
    public List<Transaction> transactions() { return transactions; }
    public LocalDate referenceDate() { return transactions.get(transactions.size() - 1).date(); }
}
