/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { useUser } from "@/context/userContext";
import { useWallet } from "@/hooks/useWallet";
import { useStores } from "@/hooks/useStores";
import { useTransactions } from "@/hooks/useTransactions";
import { formatNaira } from "@/lib/salesFilters";
import { groupByDay, moneyFlow, transactionToRow } from "@/lib/transactionRows";
import { useShortcutPins } from "@/lib/shortcutStore";
import { VcIcon } from "@/components/inventory/VcIcon";
import QuickActionsStrip, {
  ACCOUNT_ACTIONS,
  DEFAULT_ACCOUNT_PINS,
} from "@/components/QuickActionsStrip";
import ShortcutPickerModal from "@/components/inventory/ShortcutPickerModal";
import TransactionReceiptModal from "@/components/account/TransactionReceiptModal";
import FundWalletModal from "@/components/account/FundWalletModal";
import type { Transaction } from "@/types/transactions";

const KIND_TILE = {
  sale: { bg: "#E7F4EB", fg: "#31A078", icon: "cart" as const },
  in: { bg: "#E7F4EB", fg: "#31A078", icon: "arrowIn" as const },
  out: { bg: "#FCEAE7", fg: "#EA4334", icon: "arrowOut" as const },
};

const AccountOverview = () => {
  const router = useRouter();
  const { user, isUserWalletNull } = useUser();
  const {
    wallet,
    isLoading: walletLoading,
    fetchWallet,
    getBalance,
    getAccountNumber,
  } = useWallet();

  // The hook only seeds from localStorage, so a fresh login has no wallet
  // until this runs. Without it the balance reads zero and the business
  // account prompt shows to people who already have an account.
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Whether the vendor has a store decides which prompt to offer them.
  const { data: stores = [] } = useStores();

  const { data: transactions = [], isLoading: txLoading } = useTransactions();

  const [hideBalance, setHideBalance] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  const { pins, setPins, reset } = useShortcutPins(
    "account",
    DEFAULT_ACCOUNT_PINS,
  );

  const balance = Number(getBalance?.() ?? 0);
  const accountNumber = getAccountNumber?.("WEMA") ?? "";
  const hasWallet =
    !isUserWalletNull &&
    Boolean(wallet?.accountNumbers && Object.keys(wallet.accountNumbers).length);

  const rows = useMemo(
    () => transactions.map((tx) => transactionToRow(tx, hideBalance)),
    [transactions, hideBalance],
  );
  const groups = useMemo(() => groupByDay(rows.slice(0, 8)), [rows]);

  // Derived from the transaction list — there is no 7-day aggregate endpoint.
  const { moneyIn, moneyOut, net } = useMemo(
    () => moneyFlow(transactions, 7),
    [transactions],
  );
  const flowMax = Math.max(moneyIn, moneyOut, 1);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast.success("Account number copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the account number");
    }
  };

  const walletActions: {
    label: string;
    icon: "send" | "plus" | "sim";
    onPress: () => void;
  }[] = [
    {
      label: "Send Money",
      icon: "send",
      onPress: () => router.push("/account/send-money"),
    },
    { label: "Fund Wallet", icon: "plus", onPress: () => setFundOpen(true) },
    {
      label: "Airtime & Data",
      icon: "sim",
      onPress: () => router.push("/account/pay-utility"),
    },
  ];

  return (
    <div className="flex flex-col gap-[22px] max-w-[1360px]">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-5 flex-wrap">
        <div>
          <h1 className="m-0 font-clash font-semibold text-[28px] tracking-[-.5px] text-[#2F2F2F]">
            Welcome back, {user?.firstname ?? "there"}
          </h1>
          <p className="mt-[5px] text-[14px] text-[#8E8E93]">
            Here is what moved through your wallet.
          </p>
        </div>
        {hasWallet && (
          <button
            type="button"
            onClick={copyAccount}
            className="inline-flex items-center gap-[14px] h-[46px] px-[18px] rounded-[10px] border border-black/10 bg-white cursor-pointer text-[14px] font-bold text-[#2F2F2F] whitespace-nowrap shrink-0 hover:border-[#0A6DC0]"
          >
            <span>WEMA</span>
            <span className="w-px h-4 bg-black/10" />
            <span>{accountNumber}</span>
            <span className="text-[#0A6DC0] font-bold text-[13px]">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
        )}
      </div>

      {/* ── No-wallet banner ─────────────────────────────────────────────── */}
      {!hasWallet && !walletLoading && (
        <div className="bg-white border border-[#D8D8D8B3] rounded-[20px] px-[26px] py-6 flex items-center gap-7 flex-wrap shadow-[0_2px_10px_-6px_rgba(10,37,64,.18)]">
          <div className="flex-[1_1_340px] min-w-[280px]">
            <div className="flex items-center gap-2.5">
              <span className="text-[11.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93]">
                In partnership with
              </span>
              <Image
                src="/wema.png"
                alt="Wema Bank"
                width={90}
                height={44}
                className="h-11 w-auto object-contain"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <h2 className="mt-3 font-clash font-semibold text-[25px] tracking-[-.5px] text-[#2F2F2F]">
              Create A Business Account
            </h2>
            <p className="mt-[7px] text-[14.5px] text-[#6E7480] leading-[1.5] max-w-[460px]">
              Open a free Wema account inside Vendcliq to collect payments from
              customers, pay your suppliers and unlock Cliq Credit. No paperwork
              needed.
            </p>
          </div>

          <div className="flex-[0_1_260px] min-w-[220px] flex flex-col gap-2.5">
            {[
              "Free account number",
              "Instant transfers to any bank",
              "Access up to ₦50,000,000 credit",
            ].map((line) => (
              <div key={line} className="flex items-center gap-2.5">
                <VcIcon name="check" size={18} stroke="#00681B" strokeWidth={2.6} className="shrink-0" />
                <span className="text-[14px] font-medium text-[#2F2F2F]">
                  {line}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-none flex flex-col gap-2 items-stretch">
            {stores.length === 0 && (
              <button
                type="button"
                onClick={() => router.push("/inventory/create-store")}
                className="h-[54px] px-[26px] rounded-[12px] border border-[#D8D8D8E6] bg-white text-[#2F2F2F] cursor-pointer text-[15px] font-bold whitespace-nowrap hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              >
                Create A Store
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push("/business-account")}
              className="h-[54px] px-[26px] rounded-[12px] border-none bg-[#0A6DC0] text-white cursor-pointer text-[15.5px] font-bold whitespace-nowrap inline-flex items-center justify-center gap-2.5 hover:bg-[#09599A]"
            >
              <span>Create A Business Account</span>
              <VcIcon name="chevron" size={18} stroke="#fff" strokeWidth={2.4} />
            </button>
            <span className="text-[12.5px] text-[#8E8E93] text-center">
              Takes about 2 minutes · BVN needed
            </span>
          </div>
        </div>
      )}

      {/* ── Wallet hero + money flow ─────────────────────────────────────── */}
      <div className="grid gap-5 items-stretch [grid-template-columns:minmax(0,1fr)] lg:[grid-template-columns:minmax(0,1.6fr)_minmax(300px,1fr)]">
        <section
          data-tour="wallet-hero"
          className="relative overflow-hidden rounded-[20px] p-6 text-white bg-[linear-gradient(135deg,#0A6DC0_0%,#3A6BC4_100%)] shadow-[0_12px_28px_-10px_rgba(10,109,192,.45)]"
        >
          <div className="absolute -top-[70px] -right-[50px] w-[220px] h-[220px] rounded-full bg-white/[.06] pointer-events-none" />

          <div className="relative flex items-start justify-between gap-x-5 gap-y-3 flex-wrap">
            <div className="min-w-0 flex-[1_1_200px]">
              <div className="flex items-center gap-2.5">
                <span className="text-[13px] font-medium text-white/85">
                  Available balance
                </span>
                <button
                  type="button"
                  aria-label="Toggle balance"
                  onClick={() => setHideBalance((v) => !v)}
                  className="w-[26px] h-[26px] rounded-full border-none bg-white/15 cursor-pointer inline-flex items-center justify-center"
                >
                  {hideBalance ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 3 18 18" />
                      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
                      <path d="M6.8 6.9C4 8.6 2 12 2 12s4 7 10 7c1.6 0 3-.3 4.3-.9" />
                      <path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6 0 10 7 10 7a19.6 19.6 0 0 1-3.2 4" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="font-clash font-bold text-[clamp(30px,3.3vw,46px)] tracking-[-1.2px] leading-[1.05] mt-1.5 whitespace-nowrap">
                {walletLoading ? (
                  <ClipLoader color="#fff" size={30} />
                ) : (
                  formatNaira(balance, hideBalance)
                )}
              </div>

              <div className="text-[12.5px] text-white/75 mt-1.5 pr-[58px]">
                Vendcliq Wallet{accountNumber ? ` · WEMA ${accountNumber}` : ""}
              </div>
            </div>
          </div>

          <span className="absolute top-6 right-6 w-[46px] h-[46px] rounded-[14px] bg-white/[.16] inline-flex items-center justify-center pointer-events-none">
            <VcIcon name="card" size={24} stroke="#fff" strokeWidth={1.9} />
          </span>

          <div
            data-tour="wallet-actions"
            className="relative grid grid-cols-3 gap-3 mt-6"
          >
            {walletActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onPress}
                className="bg-white/[.14] border border-white/[.18] rounded-[14px] px-2 py-[14px] cursor-pointer flex flex-col items-center gap-[9px] min-w-0 hover:bg-white/[.24]"
              >
                <VcIcon name={action.icon} size={22} stroke="#fff" strokeWidth={2.1} />
                <span className="text-[12.5px] font-semibold text-white text-center leading-[1.25] tracking-[-.2px]">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section
          data-tour="money-flow"
          className="bg-white border border-[#E4E4E4] rounded-[20px] p-[22px] flex flex-col"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 font-clash font-semibold text-[18px] tracking-[-.3px] text-[#2F2F2F]">
              Money in vs out
            </h2>
            <span className="inline-flex items-center gap-1.5 bg-[#F4F5F7] rounded-full px-[11px] py-1.5 text-[12px] font-semibold text-[#6B6B70]">
              <VcIcon name="clock" size={13} stroke="#6B6B70" />
              <span>Last 7 days</span>
            </span>
          </div>

          <div className="mt-[22px] flex flex-col gap-[18px]">
            {[
              {
                label: "Money in",
                value: moneyIn,
                colour: "#00681B",
                bar: "#22A34A",
                tile: "#E7F4EB",
                icon: "arrowIn" as const,
              },
              {
                label: "Money out",
                value: moneyOut,
                colour: "#C0392B",
                bar: "#E4694F",
                tile: "#FCEAE7",
                icon: "arrowOut" as const,
              },
            ].map((flow) => (
              <div key={flow.label}>
                <div className="flex items-baseline justify-between gap-2.5">
                  <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6B6B70]">
                    <span
                      className="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center"
                      style={{ background: flow.tile }}
                    >
                      <VcIcon name={flow.icon} size={13} stroke={flow.colour} strokeWidth={2.6} />
                    </span>
                    <span>{flow.label}</span>
                  </span>
                  <span
                    className="font-clash font-bold text-[20px] tracking-[-.3px]"
                    style={{ color: flow.colour }}
                  >
                    {formatNaira(flow.value, hideBalance)}
                  </span>
                </div>
                <div className="mt-[9px] h-2.5 rounded-[5px] bg-[#F1F2F4] overflow-hidden">
                  <div
                    className="h-full rounded-[5px]"
                    style={{
                      width: `${(flow.value / flowMax) * 100}%`,
                      background: flow.bar,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-5">
            <div className="bg-[#F9FCFF] border border-[#0A6DC029] rounded-[14px] px-4 py-[15px] flex items-center justify-between gap-3">
              <div>
                <div className="text-[12.5px] text-[#6B6B70] font-medium">
                  Net for the week
                </div>
                <div className="font-clash font-bold text-[24px] text-[#0A6DC0] tracking-[-.5px] mt-0.5">
                  {net < 0 ? "−" : ""}
                  {formatNaira(Math.abs(net), hideBalance)}
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-[11px] py-1.5 text-[12.5px] font-bold"
                style={{
                  background: net >= 0 ? "#E7F4EB" : "#FCEAE7",
                  color: net >= 0 ? "#00681B" : "#C0392B",
                }}
              >
                <VcIcon
                  name={net >= 0 ? "arrowUp" : "arrowDown"}
                  size={13}
                  stroke={net >= 0 ? "#00681B" : "#C0392B"}
                  strokeWidth={2.6}
                />
                <span>{net >= 0 ? "Positive" : "Negative"}</span>
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <QuickActionsStrip
        actions={ACCOUNT_ACTIONS}
        pinnedIds={pins}
        onEditShortcuts={() => setPickerOpen(true)}
      />

      {/* ── Recent transactions ──────────────────────────────────────────── */}
      <section
        data-tour="tx-list"
        className="bg-white border border-[#E4E4E4] rounded-[20px] px-[22px] pt-5 pb-3.5"
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="m-0 font-clash font-semibold text-[19px] tracking-[-.3px] text-[#2F2F2F]">
              Recent transactions
            </h2>
            <p className="mt-1 text-[13px] text-[#8E8E93]">
              Live from your Vendcliq wallet.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/account/transactionHistory")}
            className="text-[13px] font-bold text-[#0A6DC0] hover:underline"
          >
            Show all
          </button>
        </div>

        {txLoading ? (
          <p className="text-center text-[#8E8E93] py-8 text-[13px]">
            Loading transactions…
          </p>
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.label} className="pt-3">
              <div className="text-[11.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93] px-1 pt-1 pb-1.5">
                {group.label}
              </div>
              {group.rows.map((row) => {
                const tile = KIND_TILE[row.kind];
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setReceiptTx(row.source)}
                    className="w-full text-left flex items-center gap-[14px] py-[13px] px-1 border-t border-[#D8D8D873] cursor-pointer hover:bg-[#F9FCFF]"
                  >
                    <span
                      className="w-[42px] h-[42px] rounded-[13px] inline-flex items-center justify-center shrink-0"
                      style={{ background: tile.bg }}
                    >
                      <VcIcon name={tile.icon} size={20} stroke={tile.fg} strokeWidth={2.2} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-bold text-[14.5px] text-[#2F2F2F] tracking-[-.2px] truncate">
                        {row.title}
                      </span>
                      <span className="block text-[12.5px] text-[#8E8E93] mt-[3px] truncate">
                        {row.sub}
                      </span>
                    </span>
                    <span className="text-right shrink-0">
                      <span
                        className="block font-bold text-[15px] tracking-[-.2px]"
                        style={{ color: row.amountColor }}
                      >
                        {row.amountDisplay}
                      </span>
                      <span className="block text-[12px] text-[#8E8E93] mt-[3px]">
                        {row.ref}
                      </span>
                    </span>
                    <VcIcon name="chevron" size={17} stroke="#B9BCC2" strokeWidth={2.4} className="shrink-0" />
                  </button>
                );
              })}
            </div>
          ))
        ) : (
          <p className="text-center text-[#8E8E93] py-8 text-[13px]">
            No transactions yet — they will appear here as money moves.
          </p>
        )}
      </section>

      <FundWalletModal
        open={fundOpen}
        onOpenChange={setFundOpen}
        accountNumber={accountNumber}
      />

      <TransactionReceiptModal
        transaction={receiptTx}
        open={Boolean(receiptTx)}
        onOpenChange={(next) => {
          if (!next) setReceiptTx(null);
        }}
      />

      <ShortcutPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        actions={ACCOUNT_ACTIONS}
        pinnedIds={pins}
        onChange={setPins}
        onReset={reset}
      />
    </div>
  );
};

export default AccountOverview;
