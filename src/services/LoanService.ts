import { Loan } from "../interfaces/Loan";
import { mockDatabase } from "../data/mock/mockData";

const networkDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T>(obj: T): T => {
  const json = JSON.stringify(obj);
  return JSON.parse(json, (key, value) => {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return new Date(value);
    }
    return value;
  });
};

export const LoanService = {
  async getLoans(): Promise<Loan[]> {
    await networkDelay(300);
    return clone(mockDatabase.loans);
  }
};
