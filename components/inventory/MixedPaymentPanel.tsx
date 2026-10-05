/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { Check, Copy, Landmark, Banknote } from "lucide-react";
import { handlePayInvoice } from "@/lib/utils/api/apiHelper";
import { useInvoicePayments } from "@/hooks/useInventoryOverview";
import { formatNaira } from "@/lib/money";

type LegMethod = "CASH" | "TRANSFER";
type LegState = "waiting" | "sending" | "recorded" | "awaitingTransfer" | "received" | "failed";

interface Leg {
  method: LegMethod;
  amount: number;
}

const parseAmount = (v: string) => {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

/**
 * Mixed payment: one invoice paid by cash + transfer. One `/pay` per leg
 * with its own amount — cash first, then the transfer, whose account is
 * sized to its leg. While the transfer is outstanding the panel re-reads
 * GET …/payments every 5 s and marks it received once the server's paid
 * amount has grown by that leg. Amounts are the server's, VAT included.
 */
export default function MixedPaymentPanel({
  invoiceId,
  total,
  onDone,
}: {
  invoiceId: string;
  /** What this screen collects: the invoice total, or the balance. */
  total: number;
  onDone: () => void;
}) {
  const [cashText, setCashText] = useState("");
  const cash = parseAmount(cashText);
  const transfer = Math.max(0, Math.round((total - cash) * 100) / 100);
  const legs: Leg[] = useMemo(
    () => [
      { method: "CASH", amount: cash },
      { method: "TRANSFER", amount: transfer },
    ],
    [cash, transfer],
  );

  const [states, setStates] = useState<LegState[]>(["waiting", "waiting"]);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [account, setAccount] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const paidAtIssue = useRef<number | null>(null);
  const started = states.some((s) => s !== "waiting");

  const awaiting = states[1] === "awaitingTransfer";
  const { data: payments, refetch } = useInvoicePayments(
    invoiceId,
    awaiting ? 5000 : false,
  );

  // Transfer landed: paid grew by its leg (or nothing is left).
  useEffect(() => {
    if (!awaiting || !payments || paidAtIssue.current == null) return;
    const landed =
      Number(payments.outstanding_balance) <= 0.005 ||
      Number(payments.amount_paid) >= paidAtIssue.current + legs[1].amount - 0.005;
    if (landed) {
      setStates((s) => [s[0], "received"]);
      toast.success("Transfer received");
    }
  }, [awaiting, payments, legs]);

  const valid = cash > 0 && cash < total - 0.005;
  const allSent = states.every((s) =>
    ["recorded", "awaitingTransfer", "received"].includes(s),
  );

  const run = async () => {
    if (busy || !valid) return;
    setBusy(true);
    for (let i = 0; i < legs.length; i++) {
      if (["recorded", "awaitingTransfer", "received"].includes(states[i])) continue;
      setStates((s) => s.map((v, j) => (j === i ? "sending" : v)));
      setErrors((e) => ({ ...e, [i]: "" }));
      try {
        if (legs[i].method === "TRANSFER") {
          const before = await refetch();
          paidAtIssue.current = Number(before.data?.amount_paid ?? 0);
        }
        const res: any = await handlePayInvoice(invoiceId, {
          paymentType: legs[i].method,
          amount: legs[i].amount,
          narration: `Mixed payment leg ${i + 1}/${legs.length}`,
        });
        if (res?.statusCode && res.statusCode >= 400) {
          throw new Error(res?.message || res?.error || "Payment failed");
        }
        if (legs[i].method === "TRANSFER") {
          setAccount(res?.data?.paymentPayload ?? null);
          setStates((s) => s.map((v, j) => (j === i ? "awaitingTransfer" : v)));
        } else {
          setStates((s) => s.map((v, j) => (j === i ? "recorded" : v)));
        }
        await refetch();
      } catch (e: any) {
        setStates((s) => s.map((v, j) => (j === i ? "failed" : v)));
        setErrors((er) => ({ ...er, [i]: e?.message || "Payment failed" }));
        break; // nothing after a failed leg is sent
      }
    }
    setBusy(false);
  };

  const note: Record<LegState, string> = {
    waiting: "Not sent yet",
    sending: "Recording…",
    recorded: "Recorded",
    awaitingTransfer: "Waiting for the transfer to land",
    received: "Received",
    failed: "Failed",
  };

  return (
    <div className="flex flex-col gap-4">
      {payments && started && (
        <div className="flex items-center justify-between rounded-xl border border-[#E4E4E4] bg-white px-4 py-3">
          <span className="font-semibold text-[#298C64]">
            {formatNaira(payments.amount_paid)} of {formatNaira(payments.total)} paid
          </span>
          <span className="font-semibold text-[#85540A]">
            {formatNaira(payments.outstanding_balance)} left
          </span>
        </div>
      )}

      {!started && (
        <div>
          <label className="block text-sm font-medium text-[#2F2F2F] mb-1.5">
            Cash received
          </label>
          <input
            inputMode="decimal"
            value={cashText}
            onChange={(e) => setCashText(e.target.value.replace(/[^0-9.,]/g, ""))}
            placeholder="0"
            className="w-full h-12 rounded-xl border border-gray-300 px-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A6DC0]"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            {cash >= total - 0.005 && cash > 0
              ? "Enter less than the total to split the payment."
              : `The rest, ${formatNaira(transfer)}, is paid by transfer.`}
          </p>
        </div>
      )}

      {legs.map((leg, i) => {
        const st = states[i];
        const Icon = leg.method === "CASH" ? Banknote : Landmark;
        const tone =
          st === "failed"
            ? "#B3261E"
            : st === "recorded" || st === "received"
              ? "#298C64"
              : st === "awaitingTransfer"
                ? "#85540A"
                : "#8E8E93";
        return (
          <div key={leg.method} className="rounded-xl border border-[#E4E4E4] bg-white p-4">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" style={{ color: tone }} />
              <span className="flex-1 font-semibold text-[#2F2F2F]">
                {leg.method === "CASH" ? "Cash" : "Transfer"}
              </span>
              <span className="font-semibold text-[#2F2F2F]">{formatNaira(leg.amount)}</span>
            </div>
            <div className="mt-1 text-[12.5px]" style={{ color: tone }}>
              {errors[i] || note[st]}
            </div>
            {leg.method === "TRANSFER" && st === "awaitingTransfer" && account && (
              <div className="mt-3 rounded-lg bg-[#F9FCFF] border border-[#E1EEFF] p-3 text-sm">
                <div className="text-[#6E7480]">
                  Send exactly <b className="text-[#2F2F2F]">{formatNaira(account.expectedAmount ?? leg.amount)}</b> to
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#2F2F2F]">
                    {account.bankName} · {account.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(account.accountNumber);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="text-[#0A6DC0]"
                    aria-label="Copy account number"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="text-[#6E7480]">{account.accountName}</div>
              </div>
            )}
          </div>
        );
      })}

      {!allSent ? (
        <button
          type="button"
          onClick={run}
          disabled={busy || !valid}
          className="w-full h-12 rounded-xl bg-[#0A6DC0] text-white font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {busy && <ClipLoader size={18} color="white" />}
          {states.some((s) => s === "failed") ? "Retry remaining" : "Record payments"}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onDone}
            className="w-full h-12 rounded-xl bg-[#0A6DC0] text-white font-semibold"
          >
            Done
          </button>
          {awaiting && (
            <button
              type="button"
              onClick={() => refetch()}
              className="w-full h-11 rounded-xl border border-gray-300 font-semibold text-[#2F2F2F]"
            >
              Check for transfer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
