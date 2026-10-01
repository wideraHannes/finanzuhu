import {
  removeTransaction,
  TransactionNotFoundError,
} from "@/lib/transactions";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    return Response.json({ items: removeTransaction(id) });
  } catch (error) {
    if (error instanceof TransactionNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("Could not remove transaction", error);
    return Response.json(
      { error: "The transaction could not be removed." },
      { status: 500 },
    );
  }
}
