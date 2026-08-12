import { format, isToday, isYesterday } from "date-fns";
import { Transaction } from "@/types/transactions";

export type TxKind = "sale" | "in" | "out";

export interface TxRowData {
  id: string;
  kind: TxKind;
  title: string;
  sub: string;
  ref: string;
  amount: number;
  /** Signed, formatted: +₦12,400 / −₦45,000 */
  amountDisplay: string;
  amountColor: string;
  createdAt: string;
  source: Transaction;
}

const MONEY_IN = "#31A078";
const MONEY_OUT = "#EA4334";

/** Sales arrive as credits whose narration carries the invoice code. */
export const invoiceCodeOf = (narration?: string | null): string | null => {
  const match = /INV-[A-Z0-9-]+/i.exec(narration ?? "");
  return match ? match[0] : null;
};

export const isUtility = (tx: Transaction) =>
  ["AIRTIME", "DATA", "UTILITY"].includes((tx.category ?? "").toUpperCase());

export const isSale = (tx: Transaction) =>
  tx.direction === "CREDIT" && Boolean(invoiceCodeOf(tx.narration));

const time = (iso: string) => {
  try {
    return format(new Date(iso), "h:mm a");
  } catch {
    return "";
  }
};

const naira = (amount: number, hidden: boolean) =>
  hidden ? "₦ ****" : `₦${Math.round(Math.abs(amount)).toLocaleString("en-NG")}`;

/** Truncates a long reference the way the prototype does. */
export const shortRef = (reference: string) =>
  reference && reference.length > 20
    ? `${reference.slice(0, 10)}…${reference.slice(-8)}`
    : reference;

export const transactionToRow = (
  tx: Transaction,
  hideAmounts = false,
): TxRowData => {
  const credit = tx.direction === "CREDIT";
  const code = invoiceCodeOf(tx.narration);
  const sale = isSale(tx);

  const counterparty = credit ? tx.sender?.name : tx.receiver?.name;
  const bank = credit ? tx.sender?.bankName : tx.receiver?.bankName;

  const title = sale
    ? `Sale · ${code}`
    : (counterparty ?? tx.narration ?? "Transaction");

  const method = sale
    ? (tx.category ?? "Sale").toLowerCase()
    : (bank ?? tx.category ?? "Wallet");

  return {
    id: tx.id,
    kind: sale ? "sale" : credit ? "in" : "out",
    title,
    sub: `${method} · ${time(tx.createdAt)}`,
    ref: tx.transactionReference ? `Ref: ${shortRef(tx.transactionReference)}` : "",
    amount: tx.amount,
    amountDisplay: `${credit ? "+" : "−"}${naira(tx.amount, hideAmounts)}`,
    amountColor: credit ? MONEY_IN : MONEY_OUT,
    createdAt: tx.createdAt,
    source: tx,
  };
};

export interface TxGroup {
  label: string;
  rows: TxRowData[];
}

/** Groups rows by day: "Today · 11 Aug", "Yesterday · 10 Aug", then the date. */
export const groupByDay = (rows: TxRowData[]): TxGroup[] => {
  const groups = new Map<string, TxRowData[]>();

  for (const row of rows) {
    let label: string;
    try {
      const date = new Date(row.createdAt);
      const short = format(date, "d MMM");
      label = isToday(date)
        ? `Today · ${short}`
        : isYesterday(date)
          ? `Yesterday · ${short}`
          : format(date, "EEEE · d MMM");
    } catch {
      label = "Earlier";
    }
    groups.set(label, [...(groups.get(label) ?? []), row]);
  }

  return [...groups.entries()].map(([label, rows]) => ({ label, rows }));
};

/** Money in/out over the trailing `days`, derived from the transaction list. */
export const moneyFlow = (transactions: Transaction[], days = 7) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  let moneyIn = 0;
  let moneyOut = 0;

  for (const tx of transactions) {
    const at = new Date(tx.createdAt).getTime();
    if (!Number.isFinite(at) || at < cutoff) continue;
    if ((tx.status ?? "SUCCESS") === "FAILED") continue;
    if (tx.direction === "CREDIT") moneyIn += tx.amount;
    else moneyOut += tx.amount;
  }

  return { moneyIn, moneyOut, net: moneyIn - moneyOut };
};
