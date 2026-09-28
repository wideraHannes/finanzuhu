import { getBudgets, setBudget } from "@/lib/budgets";
import { getTransactions } from "@/lib/transactions";

/** Upper bound for a monthly plan — a guard against a slipped decimal point. */
const MAX_BUDGET = 1_000_000;

export function GET() {
  return Response.json(getBudgets());
}

/**
 * Change the planned amount of a single category.
 *
 * Only categories that already appear in the ledger can be budgeted: the plan
 * exists to be compared against bookings, and a budget nothing can ever book
 * against would be an invisible row. A category without a plan entry yet is
 * fine — that is how a new budget is created.
 */
export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { category, amount } = (body ?? {}) as {
    category?: unknown;
    amount?: unknown;
  };

  if (typeof category !== "string" || category.length === 0) {
    return Response.json({ error: "A category is required." }, { status: 400 });
  }
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    amount > MAX_BUDGET
  ) {
    return Response.json(
      { error: `The amount must be between 0 and ${MAX_BUDGET}.` },
      { status: 400 },
    );
  }
  if (!getTransactions().some((t) => t.category === category)) {
    return Response.json({ error: "Unknown category." }, { status: 404 });
  }

  return Response.json(setBudget(category, amount));
}
