package de.finanzuhu.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Account(String name, BigDecimal openingBalance, LocalDate openingDate) {}
