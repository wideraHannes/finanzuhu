import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Account = {
  name: string;
  openingBalance: number;
  openingDate: string;
};

/** The one account this demo knows about. */
export const account: Account = JSON.parse(
  readFileSync(join(process.cwd(), "..", "..", "data", "account.json"), "utf8"),
);
