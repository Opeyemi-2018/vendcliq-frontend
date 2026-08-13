/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { usePurchaseRequestById } from "@/hooks/usePurchaseRequests";
import { formatNaira, formatQuantity } from "@/lib/salesFilters";
import { handoverProgress } from "@/lib/salesRows";
import { VcIcon } from "@/components/inventory/VcIcon";
import ProductThumb from "@/components/inventory/ProductThumb";

export default function OnlineSaleInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: request, isLoading, error } = usePurchaseRequestById(id);

  React.useEffect(() => {
    if (error) toast.error("Could not load this online sale");
  }, [error]);

  const items = useMemo(() => request?.items ?? [], [request]);
  const { done, total } = handoverProgress(items);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const nextPending = useMemo(
    () => items.find((i: any) => !i.attributes?.handover_completed),
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
                return (
                  <div
                    key={item.id}
                    data-tour="invoice-item"
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      router.push(
                        `/inventory/purchase-request/${id}/item/${item.id}`,
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        router.push(
                          `/inventory/purchase-request/${id}/item/${item.id}`,
                        );
                    }}
                    className="grid [grid-template-columns:minmax(210px,2.1fr)_84px_104px_108px_78px_132px_22px] gap-3 items-center px-[22px] py-[14px] border-b border-[#D8D8D873] cursor-pointer bg-white hover:bg-[#F9FCFF]"
                  >
                    <div className="flex items-center gap-[13px] min-w-0">
                      <ProductThumb
                        src={item.product?.image}
                        alt={item.product?.name ?? "Product"}
                        size={44}
                      />
                      <span className="text-[14.5px] font-semibold text-[#2F2F2F] tracking-[-.2px] truncate">
                        {item.product?.name ?? "Item"}
                      </span>
                    </div>
                    <span className="text-[14px] text-[#2F2F2F]">
                      {formatQuantity(item.quantity)}
                    </span>
                    <span className="text-[14px] text-[#2F2F2F]">
                      {formatNaira(item.cost)}
                    </span>
                    <span className="text-[14px] font-bold text-[#2F2F2F]">
                      {formatNaira(item.sub_total)}
                    </span>
                    <span className="text-[13.5px] text-[#6E7480]">
                      {item.delivery ? "Yes" : "No"}
                    </span>
                    <div>
                      {isDone ? (
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
    </div>
  );
}
