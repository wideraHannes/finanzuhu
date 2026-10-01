import type { SpendingBucket } from "@/lib/finance";

export type SpendingSummary = "category" | "month";

export type SpendingOverviewResponse = {
  from: string;
  to: string;
  categories: SpendingBucket[];
  months: SpendingBucket[];
};

export async function fetchSpendingOverview(
  from?: string,
  to?: string,
): Promise<SpendingOverviewResponse> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const suffix = params.size ? `?${params}` : "";
  const response = await fetch(`/api/spending${suffix}`);
  if (!response.ok) throw new Error("Could not load historical spending.");
  return response.json();
}
