package de.finanzuhu.domain;

public enum Range {
    WEEK("week"), MONTH("month"), THREE_MONTHS("3m");

    private final String value;

    Range(String value) { this.value = value; }

    public String value() { return value; }

    public static Range from(String value) {
        for (Range range : values()) {
            if (range.value.equals(value)) return range;
        }
        return THREE_MONTHS;
    }
}
