const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const day = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** The single place euro amounts get rounded and formatted. */
export function formatEUR(amount: number): string {
  return eur.format(amount);
}

/** Same as formatEUR, but an explicit + in front of positive numbers. */
export function formatSignedEUR(amount: number): string {
  return amount > 0 ? `+${eur.format(amount)}` : eur.format(amount);
}

/** "2026-09-25" -> "25. Sep. 2026" */
export function formatDate(iso: string): string {
  return day.format(new Date(`${iso}T00:00:00`));
}
