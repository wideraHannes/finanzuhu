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

// The table shows one date per row and has to fit a 380px phone next to the
// amount, so there it is numbers only.
const shortDay = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
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

/** "2026-09-25" -> "25.09.26" */
export function formatShortDate(iso: string): string {
  return shortDay.format(new Date(`${iso}T00:00:00`));
}
