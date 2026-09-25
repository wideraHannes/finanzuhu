import data from "../../data/account.json";

export type Account = {
  name: string;
  openingBalance: number;
  openingDate: string;
};

/** The one account this demo knows about. */
export const account: Account = data;
