/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { usePurchaseRequestById } from "@/hooks/usePurchaseRequests";
import { formatNaira, formatQuantity } from "@/lib/salesFilters";
import { handoverProgress } from "@/lib/salesRows";
import { VcIcon } from "@/components/inventory/VcIcon";
import ProductThumb from "@/components/inventory/ProductThumb";
import InvoicePaymentPanel from "@/components/inventory/InvoicePaymentPanel";
import {
  useCancelItem,
  useInvoicePayments,
} from "@/hooks/useInventoryOverview";

const CANCEL_REASONS = [
  "Out of stock",
  "Item damaged",
  "Customer asked to cancel",
  "Price error",
  "Other",
];

/** Where a cancelled line's money went, in the seller's words. */
const refundText = (refund: any): string | null => {
  const amount = Number(refund?.amount ?? 0);
  if (!(amount > 0)) return null;
  switch (String(refund?.method ?? "").toUpperCase()) {
    case "BANK":
      return `${formatNaira(amount)} refunded to the buyer's bank account`;
    case "MANUAL":
      return `${formatNaira(amount)} due back to the customer`;
    default:
      return `${formatNaira(amount)} refunded to the buyer's wallet`;
  }
};

export default function OnlineSaleInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: request, isLoading, error } = usePurchaseRequestById(id);
  // Payments on the order (part / over-payments), from the server.
  const { data: payments, isLoading: paymentsLoading } = useInvoicePayments(id);
  const cancelItem = useCancelItem();
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelling, setCancelling] = useState(false);

  // The page is blocked while the server cancels and refunds — it can take
  // a few seconds, and a second tap mustn't cancel or refund twice.
  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const name = cancelTarget.product?.name ?? "Item";
    setCancelling(true);
    try {
      const res = await cancelItem.mutateAsync({
        itemId: cancelTarget.id,
        reason: cancelReason,
      });
      const refund = refundText(res?.refund);
      toast.success(refund ? `${name} cancelled. ${refund}.` : `${name} cancelled.`);
      setCancelTarget(null);
    } catch (e: any) {
      toast.error(e?.message || "Could not cancel the item");
    } finally {
      setCancelling(false);
    }
  };

  React.useEffect(() => {
    if (error) toast.error("Could not load this online sale");
  }, [error]);

  const items = useMemo(() => request?.items ?? [], [request]);
  const { done, total } = handoverProgress(items);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const nextPending = useMemo(
    () =>
      items.find(
        (i: any) => !i.attributes?.handover_completed && !i.attributes?.cancelled,
      ),
    [items],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <ClipLoader color="#0A6DC0" size={34} />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[16px] py-10 px-5 text-center max-w-[600px]">
        <div className="font-bold text-[15px] text-[#2F2F2F]">
          Online sale not found
        </div>
        <button
          type="button"
          onClick={() => router.push("/inventory/sales")}
          className="mt-3 text-[13px] font-bold text-[#0A6DC0] hover:underline"
        >
          Back to Sales History
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[22px] max-w-[1360px]">
      <div className="flex items-start gap-[14px] flex-wrap">
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.push("/inventory/sales")}
          className="w-[42px] h-[42px] rounded-[12px] border border-[#D8D8D8E6] bg-white cursor-pointer inline-flex items-center justify-center shrink-0 mt-1 hover:border-[#0A6DC0]"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#2F2F2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-[260px]">
          <span className="text-[12.5px] font-bold tracking-[.4px] uppercase text-[#8E8E93]">
            Online Sales
          </span>
          <h1 className="mt-1.5 font-clash font-semibold text-[30px] tracking-[-.6px] text-[#2F2F2F]">
            {request.code}
          </h1>
          <p className="mt-[5px] text-[14px] text-[#8E8E93]">
            See items on this online sale
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 items-start">
        {/* ── Requested items ────────────────────────────────────────────── */}
        <div className="flex-[1_1_560px] min-w-0 bg-white border border-[#E4E4E4] rounded-[20px] overflow-hidden">
          <div className="px-[22px] pt-5 pb-4 flex items-center justify-between gap-[14px] flex-wrap">
            <div>
              <h2 className="m-0 font-clash font-semibold text-[19px] tracking-[-.3px] text-[#2F2F2F]">
                Requested items
              </h2>
              <p className="mt-1 text-[13px] text-[#8E8E93]">
                Pick an item to hand it over.
              </p>
            </div>
            {(request.status || "").toUpperCase() === "PAID" && (
              <span className="inline-flex items-center gap-[7px] h-[30px] px-3 rounded-full bg-[#E7F4EB] text-[#003909] text-[12.5px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00681B]" />
                <span>Payment received</span>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid [grid-template-columns:minmax(210px,2.1fr)_84px_104px_108px_78px_132px_22px] gap-3 items-center px-[22px] py-[13px] bg-[#F9FCFF] border-y border-[#D8D8D899] text-[11.5px] font-bold tracking-[.4px] uppercase text-[#6E7480]">
                <span>Product</span>
                <span>Quantity</span>
                <span>Unit cost</span>
                <span>Subtotal</span>
                <span>Delivery</span>
                <span>Handover</span>
                <span />
              </div>

              {items.map((item: any) => {
                const isDone = Boolean(item.attributes?.handover_completed);
                const isCancelled = Boolean(item.attributes?.cancelled);
                const line = item.attributes?.cancelled_line;
                const awaitingPayment =
                  item.attributes?.payment_released === false &&
                  (request.status || "").toUpperCase() === "PARTIALLY_PAID";
                const open = () => {
                  // A cancelled line has nothing left to hand over.
                  if (!isCancelled)
                    router.push(
                      `/inventory/purchase-request/${id}/item/${item.id}`,
                    );
                };
                return (
                  <div
                    key={item.id}
                    data-tour="invoice-item"
                    role="button"
                    tabIndex={0}
                    onClick={open}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") open();
                    }}
                    className={`grid [grid-template-columns:minmax(210px,2.1fr)_84px_104px_108px_78px_132px_22px] gap-3 items-center px-[22px] py-[14px] border-b border-[#D8D8D873] bg-white ${isCancelled ? "cursor-default" : "cursor-pointer hover:bg-[#F9FCFF]"}`}
                  >
                    <div className="flex items-center gap-[13px] min-w-0">
                      <ProductThumb
                        src={item.product?.image}
                        alt={item.product?.name ?? "Product"}
                        size={44}
                      />
                      <div className="min-w-0">
                        <span
                          className={`block text-[14.5px] font-semibold tracking-[-.2px] truncate ${isCancelled ? "line-through text-[#8E8E93]" : "text-[#2F2F2F]"}`}
                        >
                          {item.product?.name ?? "Item"}
                        </span>
                        {isCancelled ? (
                          <span className="block text-[12px] text-[#6E7480] truncate">
                            {[
                              refundText(item.attributes?.refund),
                              item.attributes?.reason_for_cancellation
                                ? `Reason: ${item.attributes.reason_for_cancellation}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        ) : awaitingPayment ? (
                          <span className="block text-[12px] font-semibold text-[#85540A]">
                            Awaiting payment
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span className={`text-[14px] ${isCancelled ? "line-through text-[#8E8E93]" : "text-[#2F2F2F]"}`}>
                      {formatQuantity(isCancelled ? line?.quantity ?? item.quantity : item.quantity)}
                    </span>
                    <span className="text-[14px] text-[#2F2F2F]">
                      {formatNaira(isCancelled ? line?.cost ?? item.cost : item.cost)}
                    </span>
                    <span className={`text-[14px] font-bold ${isCancelled ? "line-through text-[#8E8E93]" : "text-[#2F2F2F]"}`}>
                      {formatNaira(isCancelled ? line?.sub_total ?? item.sub_total : item.sub_total)}
                    </span>
                    <span className="text-[13.5px] text-[#6E7480]">
                      {item.delivery ? "Yes" : "No"}
                    </span>
                    <div className="flex flex-col items-start gap-1.5">
                      {isCancelled ? (
                        <span className="inline-flex items-center h-7 px-[11px] rounded-full bg-[#FDECEC] text-[#B3261E] text-[12px] font-bold">
                          Cancelled
                        </span>
                      ) : isDone ? (
                        <span className="inline-flex items-center gap-1.5 h-7 px-[11px] rounded-full bg-[#E7F4EB] text-[#003909] text-[12px] font-bold">
                          <VcIcon name="check" size={13} stroke="#00681B" strokeWidth={3} />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 h-7 px-[11px] rounded-full bg-[#FFF3DB] text-[#85540A] text-[12px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E0A21A]" />
                          <span>Pending</span>
                        </span>
                      )}
                      {/* Marketplace lines only: the seller can cancel what
                          hasn't been handed over (the buyer is refunded). */}
                      {!isCancelled && !isDone && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelReason(CANCEL_REASONS[0]);
                            setCancelTarget(item);
                          }}
                          className="h-7 px-[11px] rounded-full border border-[#E5A3A0] text-[#B3261E] text-[12px] font-bold hover:bg-[#FDECEC]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <VcIcon name="chevron" size={18} stroke="#B9BCC2" strokeWidth={2.4} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-[14px] px-[22px] py-[18px] flex-wrap">
            <span className="text-[13.5px] text-[#8E8E93]">
              {total} {total === 1 ? "item" : "items"} requested · {done} handed
              over
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-[13.5px] text-[#8E8E93]">Order total</span>
              <span className="font-clash font-bold text-[22px] tracking-[-.4px] text-[#2F2F2F]">
                {formatNaira(request.total ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Handover progress ──────────────────────────────────────────── */}
        <div className="flex-[1_1_300px] min-w-[280px] max-w-[380px] flex flex-col gap-4">
          <InvoicePaymentPanel
            invoice={request}
            payments={payments}
            paymentsLoading={paymentsLoading}
          />
          <div
            data-tour="handover-card"
            className="bg-white border border-[#E4E4E4] rounded-[20px] p-5"
          >
            <div className="font-clash font-semibold text-[18px] tracking-[-.3px] text-[#2F2F2F]">
              Handover progress
            </div>
            <div className="text-[13.5px] text-[#8E8E93] mt-1">
              {done} of {total} items handed over
            </div>
            <div className="mt-[14px] h-2.5 rounded-[5px] bg-[#F1F2F4] overflow-hidden">
              <div
                className="h-full rounded-[5px] bg-[#0A6DC0] transition-[width] duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>

            {nextPending ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/inventory/purchase-request/${id}/item/${nextPending.id}/handover`,
                    )
                  }
                  className="mt-[18px] w-full h-[50px] border-none rounded-[13px] bg-[#FAC136] text-[#1A1400] font-bold text-[15px] cursor-pointer inline-flex items-center justify-center gap-[9px] hover:bg-[#FFB800]"
                >
                  <VcIcon name="truck" size={18} stroke="#1A1400" strokeWidth={2.2} />
                  <span>Hand over next item</span>
                </button>
                <div className="text-[12.5px] text-[#8E8E93] mt-2 text-center">
                  Next up: {nextPending.product?.name ?? "Item"}
                </div>
              </>
            ) : (
              <div className="mt-[18px] flex items-center gap-[11px] p-[14px] rounded-[13px] bg-[#E7F4EB]">
                <VcIcon name="check" size={20} stroke="#00681B" strokeWidth={2.6} className="shrink-0" />
                <span className="text-[13.5px] font-bold text-[#003909]">
                  Every item on this order is handed over.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {cancelTarget && !cancelling && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-white rounded-[20px] p-6">
            <h3 className="font-clash font-semibold text-[19px] text-[#2F2F2F]">
              Cancel {cancelTarget.product?.name ?? "item"}?
            </h3>
            <p className="mt-1.5 text-[13.5px] text-[#6E7480]">
              The buyer is refunded for this item (and its VAT), and its stock goes
              back on the shelf.
            </p>
            <label className="block mt-4 text-[13px] font-semibold text-[#2F2F2F]">
              Reason
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1.5 w-full h-[44px] rounded-[12px] border border-[#D8D8D8E6] px-3 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0A6DC0]"
            >
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="flex-1 h-[46px] rounded-[12px] border border-[#D8D8D8E6] text-[14px] font-semibold text-[#2F2F2F]"
              >
                Keep item
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="flex-1 h-[46px] rounded-[12px] bg-[#B3261E] text-white text-[14px] font-semibold hover:bg-[#9c2019]"
              >
                Cancel item
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelling && (
        // Blocks the page until the cancel and refund are done.
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] px-6 py-5 flex items-center gap-4 max-w-[380px]">
            <ClipLoader color="#0A6DC0" size={24} />
            <span className="text-[14px] text-[#2F2F2F]">
              Cancelling {cancelTarget?.product?.name ?? "item"} and refunding the
              buyer…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
