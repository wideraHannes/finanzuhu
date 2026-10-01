import {
  createTransaction,
  getTransactions,
  InvalidTransactionError,
  type TransactionInput,
} from "@/lib/transactions";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.toLowerCase() ?? "";
  const category = params.get("category") ?? "";
  const type = params.get("type") ?? "";

  const all = getTransactions();
  const items = all.filter(
    (t) =>
      (!q ||
        t.description.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q)) &&
      (!category || t.category === category) &&
      (!type || t.type === type),
  );

  return Response.json({
    items,
    // The filter UI needs both even when the filters match nothing.
    total: all.length,
    categories: [...new Set(all.map((t) => t.category))].sort(),
  });
}

export async function POST(request: Request) {
  let input: TransactionInput;
  try {
    input = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  try {
    return Response.json(createTransaction(input), { status: 201 });
  } catch (error) {
    if (error instanceof InvalidTransactionError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Could not create transaction", error);
    return Response.json(
      { error: "The transaction could not be saved." },
      { status: 500 },
    );
  }
}
