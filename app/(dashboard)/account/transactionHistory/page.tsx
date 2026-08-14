/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTransactionsInPeriod } from "@/hooks/useTransactions";
import { useWallet } from "@/hooks/useWallet";
import {
  groupByDay,
  invoiceCodeOf,
  isSale,
  isUtility,
  transactionToRow,
} from "@/lib/transactionRows";
import { formatNaira } from "@/lib/salesFilters";
import {
  PERIOD_PRESETS,
  defaultPeriod,
  isValidPeriod,
  periodFromPreset,
  periodLabel,
  type PeriodPreset,
  type StatementPeriod,
} from "@/lib/statementPeriod";
import { VcIcon } from "@/components/inventory/VcIcon";
import TransactionReceiptModal from "@/components/account/TransactionReceiptModal";
import StatementDownloadDialog from "@/components/account/StatementDownloadDialog";
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

/** The chosen period outlives a reload, so a refresh does not snap back. */
const PERIOD_KEY = "vc.transactions.selectedPeriod";

const storedPeriod = (): StatementPeriod | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PERIOD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StatementPeriod;
    return isValidPeriod(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const TransactionHistoryPage = () => {
  const router = useRouter();
  const { wallet, fetchWallet, newTransactions, clearNewTransactions } =
    useWallet();

  // Opens on the current month; a period chosen earlier in the session wins.
  const [period, setPeriod] = useState<StatementPeriod>(() => defaultPeriod());
  const [draft, setDraft] = useState<StatementPeriod>(period);
  const [pickerOpen, setPickerOpen] = useState(false);
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const saved = storedPeriod();
    if (saved) {
      setPeriod(saved);
      setDraft(saved);
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(PERIOD_KEY, JSON.stringify(period));
    } catch {
      // Losing the preference is harmless.
    }
  }, [period]);

  // The page reads the wallet for the statement header; overview normally
  // fills it in, but landing here directly should not leave it empty.
  useEffect(() => {
    if (!wallet) fetchWallet();
  }, [wallet, fetchWallet]);

  const {
    data: transactions,
    isLoading,
    isFetching,
    error,
    refresh,
  } = useTransactionsInPeriod(period);

  const [filter, setFilter] = useState<TxFilter>("all");
  const [query, setQuery] = useState("");
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);

  // Live wallet pushes sit in front of the fetched pages, when they fall in
  // the period being shown.
  const all = useMemo(() => {
    const fetched = transactions ?? [];
    if (!newTransactions?.length) return fetched;
    const from = new Date(`${period.from}T00:00:00`).getTime();
    const to = new Date(`${period.to}T23:59:59.999`).getTime();
    const seen = new Set(fetched.map((tx) => tx.id));
    const fresh = (newTransactions as Transaction[]).filter((tx) => {
      if (!tx?.id || seen.has(tx.id) || tx.amount === undefined) return false;
      const at = new Date(tx.createdAt).getTime();
      return Number.isFinite(at) && at >= from && at <= to;
    });
    return fresh.length ? [...fresh, ...fetched] : fetched;
  }, [transactions, newTransactions, period]);

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

  const account = useMemo(() => {
    if (!wallet) return null;
    const provider = Object.keys(wallet.accountNumbers ?? {})[0] ?? "WEMA";
    return {
      accountName: wallet.accountName || "—",
      accountNumber: wallet.accountNumbers?.[provider] ?? "",
      provider,
      currency: wallet.currency || "NGN",
      balance: Number(wallet.balance) || 0,
    };
  }, [wallet]);

  const applyPreset = (preset: PeriodPreset) => {
    if (preset === "custom") {
      setDraft({ ...period, preset: "custom" });
      return;
    }
    const next = periodFromPreset(preset);
    setDraft(next);
    setPeriod(next);
    setPickerOpen(false);
  };

  const applyCustom = () => {
    if (!isValidPeriod(draft)) {
      toast.error("Pick a start date on or before the end date.");
      return;
    }
    setPeriod({ ...draft, preset: "custom" });
    setPickerOpen(false);
  };

  const presetLabel =
    PERIOD_PRESETS.find((p) => p.id === period.preset)?.label ?? "Custom";

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
          title="Refresh transactions"
          onClick={() => {
            refresh();
            toast("Refreshing transactions…");
          }}
          className="w-[46px] h-[46px] rounded-[12px] border border-[#D8D8D8E6] bg-white cursor-pointer inline-flex items-center justify-center shrink-0 mt-1 hover:border-[#0A6DC0]"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#2F2F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 11a8 8 0 0 0-13.7-5.7L3 8.5" />
            <path d="M4 13a8 8 0 0 0 13.7 5.7L21 15.5" />
            <path d="M3 4v4.5h4.5" />
            <path d="M21 20v-4.5h-4.5" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Download statement"
          title="Download statement"
          onClick={() => setDownloadOpen(true)}
          className="w-[46px] h-[46px] rounded-[12px] border-none bg-[#0A6DC0] cursor-pointer inline-flex items-center justify-center shrink-0 mt-1 hover:bg-[#09599A]"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13" />
            <path d="m7 11 5 5 5-5" />
            <path d="M4 21h16" />
          </svg>
        </button>
      </div>

      {/* ── Period filter ────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E4E4E4] rounded-[18px]">
        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          aria-expanded={pickerOpen}
          className="w-full text-left px-[18px] py-4 flex items-center gap-[14px] bg-transparent border-none cursor-pointer rounded-[18px]"
        >
          <span className="w-[42px] h-[42px] rounded-[12px] bg-[#E1EEFF] inline-flex items-center justify-center shrink-0">
            <VcIcon name="calendar" size={20} stroke="#0A6DC0" strokeWidth={1.9} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[11.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93]">
              Showing · {presetLabel}
            </span>
            <span className="block text-[15.5px] font-bold text-[#2F2F2F] mt-[3px] truncate">
              {periodLabel(period)}
            </span>
          </span>
          <span className="shrink-0 text-[13px] font-bold text-[#0A6DC0]">
            {pickerOpen ? "Close" : "Change"}
          </span>
        </button>

        {pickerOpen && (
          <div className="px-[18px] pb-[18px] pt-1 border-t border-[#EDEDED]">
            <div className="flex gap-2 flex-wrap mt-3">
              {PERIOD_PRESETS.map((preset) => {
                const active = period.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    className={`h-9 px-4 rounded-full cursor-pointer text-[13px] whitespace-nowrap ${
                      active
                        ? "border-none bg-[#0A6DC0] text-white font-bold"
                        : "border border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-semibold hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2.5 flex-wrap items-end mt-4">
              <label className="flex-1 min-w-[150px]">
                <span className="block text-[11.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93] mb-1.5">
                  From
                </span>
                <input
                  type="date"
                  value={draft.from}
                  max={draft.to || undefined}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      preset: "custom",
                      from: e.target.value,
                    }))
                  }
                  className="w-full h-11 px-3 box-border rounded-[10px] border border-[#D8D8D8E6] bg-white text-[14px] text-[#2F2F2F] outline-none focus:border-[#0A6DC0]"
                />
              </label>
              <label className="flex-1 min-w-[150px]">
                <span className="block text-[11.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93] mb-1.5">
                  To
                </span>
                <input
                  type="date"
                  value={draft.to}
                  min={draft.from || undefined}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      preset: "custom",
                      to: e.target.value,
                    }))
                  }
                  className="w-full h-11 px-3 box-border rounded-[10px] border border-[#D8D8D8E6] bg-white text-[14px] text-[#2F2F2F] outline-none focus:border-[#0A6DC0]"
                />
              </label>
              <button
                type="button"
                onClick={applyCustom}
                className="h-11 px-5 rounded-[10px] border-none bg-[#0A6DC0] text-white text-[14px] font-bold cursor-pointer hover:bg-[#09599A]"
              >
                Apply
              </button>
            </div>
          </div>
        )}
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
            onClick={() => refresh()}
            className="mt-3 text-[13px] font-bold text-[#0A6DC0] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : groups.length > 0 ? (
        <>
          {isFetching && (
            <div className="text-[12.5px] text-[#8E8E93] -mb-1">
              Updating…
            </div>
          )}
          {groups.map((group) => (
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
          ))}
        </>
      ) : (
        <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[18px] py-10 px-5 text-center">
          <div className="font-bold text-[15px] text-[#2F2F2F]">
            No transactions in {periodLabel(period)}
          </div>
          <div className="text-[13px] text-[#8E8E93] mt-1">
            {query || filter !== "all"
              ? "Try another category or search term."
              : "Pick a wider date range to see more."}
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

      <StatementDownloadDialog
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        period={period}
        transactions={all}
        account={account}
      />
    </div>
  );
};

export default TransactionHistoryPage;
