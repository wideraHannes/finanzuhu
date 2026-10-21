import { getTransactions } from "@/lib/transactions";

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
