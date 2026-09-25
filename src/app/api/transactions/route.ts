import { getTransactions } from "@/lib/transactions";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q")?.toLowerCase() ?? "";
  const category = params.get("category") ?? "";
  const type = params.get("type") ?? "";

  const items = getTransactions().filter(
    (t) =>
      (!q ||
        t.description.toLowerCase().includes(q) ||
        t.counterparty.toLowerCase().includes(q)) &&
      (!category || t.category === category) &&
      (!type || t.type === type),
  );

  return Response.json({ items });
}
