/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAllTransactions } from "@/hooks/useTransactions";
import { useWallet } from "@/hooks/useWallet";
import {
  groupByDay,
  invoiceCodeOf,
  isSale,
  isUtility,
  transactionToRow,
} from "@/lib/transactionRows";
import { formatNaira } from "@/lib/salesFilters";
import { VcIcon } from "@/components/inventory/VcIcon";
import TransactionReceiptModal from "@/components/account/TransactionReceiptModal";
import type { Transaction } from "@/types/transactions";

type TxFilter = "all" | "credit" | "debit" | "sales" | "utilities";

const FILTERS: { id: TxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "credit", label: "Credit" },
  { id: "debit", label: "Debit" },
  { id: "sales", label: "Sales" },
  { id: "utilities", label: "Utilities" },
];

const KIND_TILE = {
  sale: { bg: "#E7F4EB", fg: "#31A078", icon: "cart" as const },
  in: { bg: "#E7F4EB", fg: "#31A078", icon: "arrowIn" as const },
  out: { bg: "#FCEAE7", fg: "#EA4334", icon: "arrowOut" as const },
};

const TransactionHistoryPage = () => {
  const router = useRouter();
  const { newTransactions, clearNewTransactions } = useWallet();

  const { data: transactions, isLoading, error, refetch } = useAllTransactions();

  const [filter, setFilter] = useState<TxFilter>("all");
  const [query, setQuery] = useState("");
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  // Live wallet pushes sit in front of the fetched pages.
  const all = useMemo(() => {
    const fetched = transactions ?? [];
    if (!newTransactions?.length) return fetched;
    const seen = new Set(fetched.map((tx) => tx.id));
    const fresh = (newTransactions as Transaction[]).filter(
      (tx) => tx?.id && !seen.has(tx.id) && tx.amount !== undefined,
    );
    return fresh.length ? [...fresh, ...fetched] : fetched;
  }, [transactions, newTransactions]);

  React.useEffect(() => {
    if (newTransactions?.length) clearNewTransactions();
  }, [newTransactions, clearNewTransactions]);

  const filtered = useMemo(() => {
    let list = all;

    switch (filter) {
      case "credit":
        list = list.filter((tx) => tx.direction === "CREDIT");
        break;
      case "debit":
        list = list.filter((tx) => tx.direction === "DEBIT");
        break;
      case "sales":
        list = list.filter(isSale);
        break;
      case "utilities":
        list = list.filter(isUtility);
        break;
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((tx) =>
        [
          tx.narration,
          tx.sender?.name,
          tx.receiver?.name,
          tx.transactionReference,
          invoiceCodeOf(tx.narration),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [all, filter, query]);

  const rows = useMemo(
    () => filtered.map((tx) => transactionToRow(tx)),
    [filtered],
  );
  const groups = useMemo(() => groupByDay(rows), [rows]);

  // Totals follow the active filter, so they always describe what is on screen.
  const { moneyIn, moneyOut } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    for (const tx of filtered) {
      if (tx.status === "FAILED") continue;
      if (tx.direction === "CREDIT") inSum += tx.amount;
      else outSum += tx.amount;
    }
    return { moneyIn: inSum, moneyOut: outSum };
  }, [filtered]);

  const rangeLabel = useMemo(() => {
    if (!filtered.length) return "No transactions yet";
    const dates = filtered.map((tx) => new Date(tx.createdAt).getTime());
    try {
      return `${format(new Date(Math.min(...dates)), "d MMM yyyy")} – ${format(
        new Date(Math.max(...dates)),
        "d MMM yyyy",
      )}`;
    } catch {
      return "All time";
    }
  }, [filtered]);

  return (
    <div className="flex flex-col gap-[18px] max-w-[900px]">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-[14px] flex-wrap">
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.push("/account/overview")}
          className="w-[42px] h-[42px] rounded-[12px] border border-[#D8D8D8E6] bg-white cursor-pointer inline-flex items-center justify-center shrink-0 mt-1 hover:border-[#0A6DC0]"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#2F2F2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-[240px]">
          <h1 className="m-0 font-clash font-semibold text-[30px] tracking-[-.6px] text-[#2F2F2F]">
            Transactions
          </h1>
          <p className="mt-[5px] text-[14.5px] text-[#8E8E93]">
            Every movement in and out of your wallet.
          </p>
        </div>
        <button
          type="button"
          aria-label="Refresh transactions"
          onClick={() => {
            refetch();
            toast("Refreshing transactions…");
          }}
          className="w-[46px] h-[46px] rounded-[12px] border border-[#D8D8D8E6] bg-white cursor-pointer inline-flex items-center justify-center shrink-0 mt-1 hover:border-[#0A6DC0]"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#2F2F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13" />
            <path d="m7 11 5 5 5-5" />
            <path d="M4 21h16" />
          </svg>
        </button>
      </div>

      {/* ── Range ────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E4E4E4] rounded-[18px] px-[18px] py-4 flex items-center gap-[14px]">
        <span className="w-[42px] h-[42px] rounded-[12px] bg-[#E1EEFF] inline-flex items-center justify-center shrink-0">
          <VcIcon name="clock" size={20} stroke="#0A6DC0" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93]">
            Date range
          </div>
          <div className="text-[15.5px] font-bold text-[#2F2F2F] mt-[3px]">
            {rangeLabel}
          </div>
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <label className="flex items-center gap-[10px] h-[46px] px-[14px] box-border rounded-[12px] border border-[#D8D8D8E6] bg-white">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, narration or reference"
          className="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] text-[#2F2F2F]"
        />
      </label>

      {/* ── Filter chips ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((chip) => {
          const active = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={`h-10 px-5 rounded-full cursor-pointer text-[13.5px] whitespace-nowrap ${
                active
                  ? "border-none bg-[#0A6DC0] text-white font-bold"
                  : "border border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-semibold hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* ── Totals for the current filter ────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-[1_1_200px] bg-[#E7F4EB] rounded-[16px] px-[18px] py-4">
          <div className="text-[13px] text-[#00681B]">Money in</div>
          <div className="font-clash font-bold text-[24px] tracking-[-.5px] text-[#00681B] mt-1">
            +{formatNaira(moneyIn)}
          </div>
        </div>
        <div className="flex-[1_1_200px] bg-[#FCEAE7] rounded-[16px] px-[18px] py-4">
          <div className="text-[13px] text-[#C0392B]">Money out</div>
          <div className="font-clash font-bold text-[24px] tracking-[-.5px] text-[#C0392B] mt-1">
            −{formatNaira(moneyOut)}
          </div>
        </div>
      </div>

      {/* ── Grouped rows ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[18px] py-10 px-5 text-center">
          <div className="font-bold text-[15px] text-[#2F2F2F]">
            Loading transactions…
          </div>
        </div>
      ) : error ? (
        <div className="bg-white border border-dashed border-[#E5A3A0] rounded-[18px] py-10 px-5 text-center">
          <div className="font-bold text-[15px] text-[#B3261E]">
            Failed to load transactions
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-[13px] font-bold text-[#0A6DC0] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : groups.length > 0 ? (
        groups.map((group) => (
          <div key={group.label}>
            <div className="text-[11.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93] mb-2">
              {group.label}
            </div>
            <div className="bg-white border border-[#E4E4E4] rounded-[18px] overflow-hidden">
              {group.rows.map((row) => {
                const tile = KIND_TILE[row.kind];
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setReceiptTx(row.source)}
                    className="w-full text-left flex items-center gap-[14px] px-[18px] py-[15px] border-b border-[#D8D8D873] last:border-b-0 cursor-pointer bg-white hover:bg-[#F9FCFF]"
                  >
                    <span
                      className="w-11 h-11 rounded-[13px] inline-flex items-center justify-center shrink-0"
                      style={{ background: tile.bg }}
                    >
                      <VcIcon name={tile.icon} size={21} stroke={tile.fg} strokeWidth={2.2} />
                    </span>
                    {/* Name and amount on one line, bank and time beneath. */}
                    <span className="flex-1 min-w-0">
                      <span className="flex items-baseline gap-2">
                        <span className="flex-1 min-w-0 font-bold text-[14px] sm:text-[15px] text-[#2F2F2F] tracking-[-.2px] truncate">
                          {row.title}
                        </span>
                        <span
                          className="shrink-0 font-clash font-bold text-[15px] sm:text-[16px] tracking-[-.3px] whitespace-nowrap"
                          style={{ color: row.amountColor }}
                        >
                          {row.amountDisplay}
                        </span>
                      </span>
                      <span className="flex items-baseline gap-2 mt-[3px]">
                        <span className="flex-1 min-w-0 text-[12px] sm:text-[12.5px] text-[#8E8E93] truncate">
                          {row.sub}
                        </span>
                        <span className="hidden md:block shrink-0 text-[12px] text-[#8E8E93]">
                          {row.ref}
                        </span>
                      </span>
                    </span>
                    <VcIcon name="chevron" size={17} stroke="#B9BCC2" strokeWidth={2.4} className="hidden sm:block shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[18px] py-10 px-5 text-center">
          <div className="font-bold text-[15px] text-[#2F2F2F]">
            No transactions match this filter
          </div>
          <div className="text-[13px] text-[#8E8E93] mt-1">
            Try another category or search term.
          </div>
        </div>
      )}

      <TransactionReceiptModal
        transaction={receiptTx}
        open={Boolean(receiptTx)}
        onOpenChange={(next) => {
          if (!next) setReceiptTx(null);
        }}
      />
    </div>
  );
};

export default TransactionHistoryPage;
