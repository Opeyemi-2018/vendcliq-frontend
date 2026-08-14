import { format } from "date-fns";
import { fetchTransactionsBetween } from "@/hooks/useTransactions";
import {
  periodEndIso,
  periodFileLabel,
  periodLabel,
  periodStartIso,
  type StatementPeriod,
} from "@/lib/statementPeriod";
import type { Transaction } from "@/types/transactions";

export interface StatementAccount {
  accountName: string;
  accountNumber: string;
  provider: string;
  currency: string;
  balance: number;
}

export interface StatementLine {
  dateTime: string;
  reference: string;
  narration: string;
  status: string;
  debit: number | null;
  credit: number | null;
  balance: number;
}

export interface Statement {
  account: StatementAccount;
  period: StatementPeriod;
  periodLabel: string;
  generatedAt: string;
  openingBalance: number;
  closingBalance: number;
  openingDate: string;
  closingDate: string;
  creditTotal: number;
  debitTotal: number;
  creditCount: number;
  debitCount: number;
  lines: StatementLine[];
}

/**
 * Only a settled posting moved the balance. Pending ones have not landed and
 * failed or reversed ones came back, so all three are listed on the statement
 * but leave the running balance where it was.
 */
const moved = (tx: Transaction) => (tx.status ?? "SUCCESS") === "SUCCESS";

const signedAmount = (tx: Transaction) =>
  tx.direction === "CREDIT" ? tx.amount : -tx.amount;

const oldestFirst = (list: Transaction[]) =>
  [...list].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

/**
 * The balance standing after each posting in the period.
 *
 * Postings carry an amount but no running balance, and the only balance we know
 * for certain is the wallet's right now. So we walk backwards from it through
 * everything that happened after the period, then forwards across the period
 * itself. `after` is every posting later than the period end — without it the
 * closing figure would be today's balance rather than the period's.
 */
export const buildStatement = ({
  account,
  period,
  inPeriod,
  after,
  generatedAt = new Date(),
}: {
  account: StatementAccount;
  period: StatementPeriod;
  inPeriod: Transaction[];
  after: Transaction[];
  generatedAt?: Date;
}): Statement => {
  const settledAfter = after.filter(moved);
  const closingBalance = settledAfter.reduce(
    (balance, tx) => balance - signedAmount(tx),
    account.balance,
  );

  const ordered = oldestFirst(inPeriod);
  const settled = ordered.filter(moved);
  const openingBalance = settled.reduce(
    (balance, tx) => balance - signedAmount(tx),
    closingBalance,
  );

  let running = openingBalance;
  const lines: StatementLine[] = ordered.map((tx) => {
    if (moved(tx)) running += signedAmount(tx);
    const credit = tx.direction === "CREDIT";
    return {
      dateTime: safeFormat(tx.createdAt, "dd-MMM-yyyy | HH:mm:ss"),
      reference: tx.transactionReference || tx.reference || "—",
      narration: tx.narration || tx.category || "—",
      status: tx.status ?? "SUCCESS",
      debit: credit ? null : tx.amount,
      credit: credit ? tx.amount : null,
      balance: running,
    };
  });

  let creditTotal = 0;
  let debitTotal = 0;
  let creditCount = 0;
  let debitCount = 0;
  for (const tx of settled) {
    if (tx.direction === "CREDIT") {
      creditTotal += tx.amount;
      creditCount += 1;
    } else {
      debitTotal += tx.amount;
      debitCount += 1;
    }
  }

  const first = ordered[0];
  const last = ordered[ordered.length - 1];

  return {
    account,
    period,
    periodLabel: periodLabel(period),
    generatedAt: format(generatedAt, "d MMM yyyy, HH:mm 'WAT'"),
    openingBalance,
    closingBalance,
    openingDate: first
      ? safeFormat(first.createdAt, "d MMM yyyy, HH:mm")
      : safeFormat(`${period.from}T00:00:00`, "d MMM yyyy"),
    closingDate: last
      ? safeFormat(last.createdAt, "d MMM yyyy, HH:mm")
      : safeFormat(`${period.to}T00:00:00`, "d MMM yyyy"),
    creditTotal,
    debitTotal,
    creditCount,
    debitCount,
    lines,
  };
};

function safeFormat(value: string, pattern: string) {
  try {
    return format(new Date(value), pattern);
  } catch {
    return "—";
  }
}

/**
 * Everything the statement needs that the screen does not already hold: the
 * postings after the period, so the closing balance is the period's own rather
 * than the wallet's balance today.
 */
export const fetchStatementTail = async (period: StatementPeriod) => {
  const end = periodEndIso(period);
  if (new Date(end).getTime() >= Date.now()) return [] as Transaction[];
  return await fetchTransactionsBetween(end, undefined);
};

export const statementFileName = (
  statement: Statement,
  extension: "pdf" | "xlsx",
) => {
  const name = (statement.account.accountName || "Account")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_");
  const bank = (statement.account.provider || "Wallet").toUpperCase();
  const span = periodFileLabel(statement.period);
  return `Statement_of_Account_${bank}_${name}_${span}.${extension}`;
};

export const statementRangeIso = (period: StatementPeriod) => ({
  start: periodStartIso(period),
  end: periodEndIso(period),
});
