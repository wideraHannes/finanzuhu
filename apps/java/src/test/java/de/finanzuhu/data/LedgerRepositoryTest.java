package de.finanzuhu.data;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.assertj.core.api.Assertions.*;

class LedgerRepositoryTest {
    @TempDir Path directory;

    @Test void missingDataReportsTheConfiguredLocation() {
        assertThatThrownBy(() -> new LedgerRepository(directory.toString()))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining(directory.toString());
    }

    @Test void malformedAndUnsortedLedgersFailClearly() throws Exception {
        Files.copy(Path.of("../../data/account.json"), directory.resolve("account.json"));
        String header = "id,date,amount,description,counterparty,category,type,method,recurring\n";
        Files.writeString(directory.resolve("transactions.csv"), header + "broken\n");
        assertThatThrownBy(() -> new LedgerRepository(directory.toString())).hasMessageContaining("nine fields");
        Files.writeString(directory.resolve("transactions.csv"), header
                + "a,2026-09-02,-10,Test,Shop,Food,expense,card,false\n"
                + "b,2026-09-01,-10,Test,Shop,Food,expense,card,false\n");
        assertThatThrownBy(() -> new LedgerRepository(directory.toString())).hasMessageContaining("sorted");
        Files.writeString(directory.resolve("transactions.csv"), header);
        assertThatThrownBy(() -> new LedgerRepository(directory.toString())).hasMessageContaining("no bookings");
    }
}
