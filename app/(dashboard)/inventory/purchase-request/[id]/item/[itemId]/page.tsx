/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { usePurchaseRequestItem } from "@/hooks/usePurchaseRequests";
import { formatNaira, formatQuantity } from "@/lib/salesFilters";
import { VcIcon } from "@/components/inventory/VcIcon";
import ProductThumb from "@/components/inventory/ProductThumb";

const handedAt = (item: any) => {
  const at = item?.attributes?.handover_verified_at;
  if (!at) return null;
  try {
    return format(new Date(at), "h:mm a");
  } catch {
    return null;
  }
};

export default function OnlineSaleItemPage() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const router = useRouter();

  const { data: item, request, isLoading, error } = usePurchaseRequestItem(
    id,
    itemId,
  );

  React.useEffect(() => {
    if (error) toast.error("Could not load this item");
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <ClipLoader color="#0A6DC0" size={34} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[16px] py-10 px-5 text-center max-w-[600px]">
        <div className="font-bold text-[15px] text-[#2F2F2F]">
          Item not found on this order
        </div>
      </div>
    );
  }

  const isDone = Boolean(item.attributes?.handover_completed);
  const time = handedAt(item);
  const usedCode = (item.attributes as any)?.handover_type === "driver"
    ? item.otp_codes?.driver_otp
    : item.otp_codes?.customer_otp;

  const backToInvoice = () =>
    router.push(`/inventory/purchase-request/${id}`);

  const fields = [
    { label: "Product name", value: item.product?.name ?? "—" },
    { label: "Quantity", value: formatQuantity(item.quantity) },
    { label: "Unit cost", value: formatNaira(item.cost) },
    {
      label: "Total cost",
      value: formatNaira(item.sub_total),
      strong: true,
    },
    { label: "Delivery required", value: item.delivery ? "Yes" : "No" },
    { label: "Pack size", value: item.stock?.sku ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-[22px] max-w-[1360px]">
      <div className="flex items-start gap-[14px] flex-wrap">
        <button
          type="button"
          aria-label="Back"
          onClick={backToInvoice}
          className="w-[42px] h-[42px] rounded-[12px] border border-[#D8D8D8E6] bg-white cursor-pointer inline-flex items-center justify-center shrink-0 mt-1 hover:border-[#0A6DC0]"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#2F2F2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-[260px]">
          <span className="text-[12.5px] font-bold tracking-[.4px] uppercase text-[#8E8E93]">
            Online Sales · {request?.code ?? ""}
          </span>
          <h1 className="mt-1.5 font-clash font-semibold text-[30px] tracking-[-.6px] text-[#2F2F2F]">
            {item.product?.name ?? "Item"}
          </h1>
          <p className="mt-[5px] text-[14px] text-[#8E8E93]">
            Here are the details of this particular item
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E4E4E4] rounded-[20px] p-[22px] flex flex-col gap-[22px]">
        <div className="flex flex-wrap gap-[26px] items-start">
          <div className="flex-[0_1_300px] min-w-[240px] border border-[#D8D8D8B3] rounded-[15px] bg-[#FBFCFD] p-[22px] flex flex-col items-center gap-[14px]">
            <div className="w-full aspect-square rounded-[12px] bg-white border border-[#D8D8D88C] flex items-center justify-center overflow-hidden">
              <ProductThumb
                src={item.product?.image}
                alt={item.product?.name ?? "Product"}
                size={240}
                className="!bg-transparent !border-0 !rounded-[12px]"
              />
            </div>
            <span className="text-[12.5px] text-[#8E8E93] text-center">
              Product photo
            </span>
          </div>

          <div className="flex-[1_1_380px] min-w-[280px] flex flex-col gap-[22px]">
            {isDone ? (
              <div className="flex items-center gap-3 px-4 py-[14px] rounded-[13px] bg-[#E7F4EB]">
                <VcIcon name="check" size={20} stroke="#00681B" strokeWidth={2.6} className="shrink-0" />
                <span className="text-[14px] font-bold text-[#003909]">
                  Handed to the{" "}
                  {(item.attributes as any)?.handover_type === "driver"
                    ? "driver"
                    : "customer"}
                  {time ? ` at ${time}` : ""}
                  {usedCode ? ` · code ${usedCode}` : ""}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-[14px] rounded-[13px] bg-[#FFF3DB]">
                <VcIcon name="clock" size={20} stroke="#85540A" strokeWidth={2.1} className="shrink-0" />
                <span className="text-[14px] font-bold text-[#85540A]">
                  Awaiting handover — the customer has already paid for this
                  item.
                </span>
              </div>
            )}

            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-x-5 gap-y-[22px]">
              {fields.map((field) => (
                <div key={field.label}>
                  <div className="text-[13px] font-bold text-[#6E7480]">
                    {field.label}
                  </div>
                  <div
                    className={`text-[15.5px] text-[#2F2F2F] mt-1.5 ${field.strong ? "font-bold" : ""}`}
                  >
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {isDone ? (
            <button
              type="button"
              onClick={backToInvoice}
              className="flex-1 min-w-[240px] h-[54px] rounded-[13px] border border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-bold text-[15px] cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
            >
              Back to order
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={backToInvoice}
                className="h-[54px] px-[22px] rounded-[13px] border border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-bold text-[15px] cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              >
                Back to order
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/inventory/purchase-request/${id}/item/${itemId}/handover`,
                  )
                }
                className="flex-1 min-w-[240px] h-[54px] border-none rounded-[13px] bg-[#0A6DC0] text-white font-bold text-[16px] cursor-pointer inline-flex items-center justify-center gap-2.5 hover:bg-[#4C87EB] active:bg-[#3A6BC4]"
              >
                <span>Hand over product</span>
                <VcIcon name="chevron" size={19} stroke="#fff" strokeWidth={2.4} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
