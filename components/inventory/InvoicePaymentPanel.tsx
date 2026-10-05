/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Banknote, CreditCard, Landmark, Wallet } from "lucide-react";
import { formatNaira } from "@/lib/money";
import type { InvoiceOverpayment, InvoicePayments } from "@/types/sales";

/** Payment method → label + icon, as the mobile app shows them. */
const METHOD: Record<string, { label: string; Icon: typeof Banknote }> = {
  CASH: { label: "Cash", Icon: Banknote },
  TRANSFER: { label: "Transfer", Icon: Landmark },
  WALLET: { label: "Wallet", Icon: Wallet },
  POS: { label: "Card", Icon: CreditCard },
  CARD: { label: "Card", Icon: CreditCard },
  CREDIT: { label: "Credit", Icon: Wallet },
};

export const methodLabel = (method?: string | null) =>
  METHOD[(method || "").toUpperCase()]?.label ??
  (method ? method.charAt(0) + method.slice(1).toLowerCase() : "Payment");

/** What happened to an overpayment, in plain words. */
export const overpaymentStatusLabel = (op: InvoiceOverpayment) => {
  switch ((op.status || "").toUpperCase()) {
    case "REFUNDED":
      return "Refunded";
    case "PAID_TO_STORE":
      return "Paid to store";
    case "REFUNDING_TO_BANK":
      return "Refunding to bank";
    case "FAILED":
      return "Refund failed";
    case "MANUAL_REVIEW":
      return "Under review";
    default:
      return op.status ? op.status.replace(/_/g, " ").toLowerCase() : "Pending";
  }
};

const Row = ({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: string;
  tone?: string;
  strong?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 py-2">
    <span className={`text-[13.5px] ${strong ? "font-semibold text-[#2F2F2F]" : "text-[#6B6B70]"}`}>
      {label}
    </span>
    <span
      className={`text-right ${strong ? "font-clash font-semibold text-[17px]" : "text-[14px] font-semibold"}`}
      style={{ color: tone ?? "#2F2F2F" }}
    >
      {value}
    </span>
  </div>
);

interface Props {
  invoice: any;
  payments?: InvoicePayments | null;
  paymentsLoading?: boolean;
  /** In-store sales owing money get a Collect Balance button. */
  onCollect?: () => void;
}

/**
 * Summary + Payment details for an invoice. Totals are the server's: the
 * invoice `total` already includes VAT and sold empties, and "Balance to be
 * paid" is `outstanding_balance` — never a sum worked out here.
 */
export default function InvoicePaymentPanel({
  invoice,
  payments,
  paymentsLoading,
  onCollect,
}: Props) {
  const attrs = invoice?.attributes ?? {};
  const subTotal = Number(invoice?.sub_total ?? attrs.sub_total ?? 0);
  const discount = Number(invoice?.total_discount ?? attrs.total_discount ?? 0);
  const emptiesValue = Number(invoice?.empties_value ?? 0);
  const vat = Number(invoice?.vat ?? 0);
  const returned = Number(attrs.total_returned ?? 0);
  const total = Number(
    payments?.total ?? invoice?.total ?? invoice?.amount_payable ?? 0,
  );
  const paid = Number(payments?.amount_paid ?? invoice?.amount_paid ?? 0);
  const outstanding = Number(
    payments?.outstanding_balance ??
      invoice?.outstanding_balance ??
      Math.max(0, total - paid),
  );
  const legs = payments?.payments ?? [];
  const overpayments = payments?.overpayments ?? [];

  return (
    <div className="w-full lg:w-[320px] lg:flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-hidden">
      <div className="border border-[#E4E4E4] rounded-[20px] bg-white p-5">
        <h3 className="text-base font-semibold text-[#2F2F2F] mb-1">Summary</h3>
        <div className="divide-y divide-[#F0F0F0]">
          <Row label="Subtotal" value={formatNaira(subTotal)} />
          <Row
            label="Discount"
            value={discount > 0 ? `– ${formatNaira(discount)}` : formatNaira(0)}
            tone={discount > 0 ? "#B3261E" : undefined}
          />
          {emptiesValue > 0 && (
            <Row label="Empties value" value={formatNaira(emptiesValue)} />
          )}
          {vat > 0 && <Row label="VAT (7.5%)" value={formatNaira(vat)} />}
          {returned > 0 && (
            <Row label="Returned" value={`– ${formatNaira(returned)}`} tone="#B3261E" />
          )}
          <Row label="Total" value={formatNaira(total)} tone="#0A6DC0" strong />
        </div>
      </div>

      <div className="border border-[#E4E4E4] rounded-[20px] bg-white p-5">
        <h3 className="text-base font-semibold text-[#2F2F2F] mb-2">
          Payment details
          {legs.length > 1 && (
            <span className="ml-2 text-[12.5px] font-medium text-[#8E8E93]">
              · Mixed payment
            </span>
          )}
        </h3>

        {paymentsLoading && legs.length === 0 ? (
          <p className="text-[13px] text-[#8E8E93] py-2">Loading payments…</p>
        ) : legs.length === 0 ? (
          <p className="text-[13px] text-[#8E8E93] py-2">No payment recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[#F0F0F0]">
            {legs.map((p) => {
              const { label, Icon } =
                METHOD[(p.method || "").toUpperCase()] ?? {
                  label: methodLabel(p.method),
                  Icon: Banknote,
                };
              return (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-9 h-9 rounded-[10px] bg-[#F4F5F7] inline-flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px] text-[#2F2F2F]" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#2F2F2F]">{label}</div>
                    <div className="text-[12px] text-[#8E8E93]">
                      {new Date(p.created_at).toLocaleString("en-NG", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <span className="text-[14px] font-semibold text-[#2F2F2F]">
                    {formatNaira(p.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-2 pt-1 border-t border-[#F0F0F0] divide-y divide-[#F0F0F0]">
          <Row label="Amount paid" value={formatNaira(paid)} tone="#298C64" />
          {overpayments.map((op) => (
            <Row
              key={op.id}
              label={`Overpaid · ${overpaymentStatusLabel(op)}`}
              value={formatNaira(op.amount)}
              tone="#85540A"
            />
          ))}
          <Row
            label="Balance to be paid"
            value={outstanding > 0.005 ? formatNaira(outstanding) : `${formatNaira(0)} · Fully paid`}
            tone={outstanding > 0.005 ? "#B3261E" : "#298C64"}
            strong
          />
        </div>

        {onCollect && outstanding > 0.005 && (
          <button
            type="button"
            onClick={onCollect}
            className="mt-4 w-full h-[46px] rounded-[12px] bg-[#0A6DC0] text-white text-[14.5px] font-semibold hover:bg-[#095ea6]"
          >
            {paid > 0 ? `Collect Balance · ${formatNaira(outstanding)}` : "Record Payment"}
          </button>
        )}
      </div>
    </div>
  );
}
