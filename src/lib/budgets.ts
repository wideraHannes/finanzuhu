import "server-only";

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FILE = join(process.cwd(), "data", "budgets.json");

/** Category name -> planned monthly amount in positive euros. */
export type Budgets = Record<string, number>;

let cache: Budgets | null = null;

/**
 * The committed budget plan, parsed once per process.
 *
 * Read at runtime rather than imported statically: the dashboard has to keep
 * working when the file is absent or unreadable (AC 9), and an import would
 * turn that into a build error. Entries that are not a non-negative finite
 * number are dropped — a typo in the seed file must not produce NaN bars.
 */
export function getBudgets(): Budgets {
  if (cache) return cache;

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    cache = {};
    return cache;
  }

  const budgets: Budgets = {};
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    for (const [category, amount] of Object.entries(parsed)) {
      if (typeof amount === "number" && Number.isFinite(amount) && amount >= 0) {
        budgets[category] = amount;
      }
    }
  }
  cache = budgets;
  return cache;
}

/**
 * Write one category's planned amount back to the plan file.
 *
 * The whole file is rewritten from the sanitised plan, so a hand-edited typo
 * never survives a save. The amount is rounded to cents — the euro input in
 * the UI has no use for more precision, and a float tail would show up in the
 * ratio. Returns the new plan; the in-process cache is replaced with it, which
 * is the only reason a reader sees the change without a restart.
 */
export function setBudget(category: string, amount: number): Budgets {
  const next: Budgets = { ...getBudgets(), [category]: Math.round(amount * 100) / 100 };
  writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  cache = next;
  return next;
}
