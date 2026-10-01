import { resetTransactions } from "@/lib/transactions";

export function POST() {
  try {
    return Response.json({ items: resetTransactions() });
  } catch (error) {
    console.error("Could not reset transactions", error);
    return Response.json(
      { error: "The default transactions could not be restored." },
      { status: 500 },
    );
  }
}
