package de.finanzuhu.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Transaction(String id, LocalDate date, BigDecimal amount,
        String description, String counterparty, String category,
        String type, String method, boolean recurring) {}
