import { spendingOverview } from "@/lib/finance";
import { getTransactions, referenceDate } from "@/lib/transactions";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function isISODate(value: string): boolean {
  if (!ISO_DAY.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function GET(request: Request) {
  const transactions = getTransactions();
  const params = new URL(request.url).searchParams;
  const from = params.get("from") ?? transactions[0].date;
  const to = params.get("to") ?? referenceDate();

  if (!isISODate(from) || !isISODate(to)) {
    return Response.json(
      { error: "Dates must use the YYYY-MM-DD calendar format." },
      { status: 400 },
    );
  }
  if (from > to) {
    return Response.json(
      { error: "The start date must not be after the end date." },
      { status: 400 },
    );
  }

  return Response.json({
    from,
    to,
    ...spendingOverview(transactions, from, to),
  });
}
