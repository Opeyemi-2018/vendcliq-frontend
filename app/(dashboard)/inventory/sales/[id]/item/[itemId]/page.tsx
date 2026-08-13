"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { useSoldItem } from "@/hooks/useInventoryOverview";
import { formatNaira, formatQuantity } from "@/lib/salesFilters";
import ProductThumb from "@/components/inventory/ProductThumb";

export default function SoldItemDetailPage() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const router = useRouter();

  const { data: item, invoice, isLoading, error } = useSoldItem(id, itemId);

  React.useEffect(() => {
    if (error) toast.error("Could not load this sold item");
  }, [error]);

  const backToInvoice = () => router.push(`/inventory/sales/${id}`);

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
          Item not found on this invoice
        </div>
        <button
          type="button"
          onClick={backToInvoice}
          className="mt-3 text-[13px] font-bold text-[#0A6DC0] hover:underline"
        >
          Back to invoice
        </button>
      </div>
    );
  }

  const profit = Number(item.profit ?? 0);

  const fields: { label: string; value: string; tone?: "bold" | "profit" }[] = [
    { label: "Product name", value: item.product?.name ?? "—" },
    { label: "Quantity sold", value: formatQuantity(item.quantity) },
    { label: "Unit cost", value: formatNaira(item.cost) },
    { label: "Subtotal", value: formatNaira(item.sub_total), tone: "bold" },
    { label: "Profit", value: formatNaira(profit), tone: "profit" },
    { label: "Delivery required", value: item.delivery ? "Yes" : "No" },
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
            In-store Sales · {invoice?.code ?? ""}
          </span>
          <h1 className="mt-1.5 font-clash font-semibold text-[30px] tracking-[-.6px] text-[#2F2F2F]">
            {item.product?.name ?? "Item"}
          </h1>
          <p className="mt-[5px] text-[14px] text-[#8E8E93]">
            Full details of this sold item
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#E4E4E4] rounded-[20px] p-[22px] flex flex-col gap-6">
        <div className="border border-[#D8D8D8B3] rounded-[15px] bg-[#FBFCFD] p-7 flex flex-col items-center gap-3">
          <ProductThumb
            src={item.product?.image}
            alt={item.product?.name ?? "Product"}
            size={180}
            className="!bg-transparent !border-0"
          />
          <span className="text-[12.5px] text-[#8E8E93]">Product photo</span>
        </div>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] gap-x-5 gap-y-6">
          {fields.map((field) => (
            <div key={field.label}>
              <div className="text-[13px] font-bold text-[#6E7480]">
                {field.label}
              </div>
              <div
                className={`text-[15.5px] mt-1.5 ${
                  field.tone === "profit"
                    ? "font-semibold text-[#0E6E55]"
                    : field.tone === "bold"
                      ? "font-bold text-[#2F2F2F]"
                      : "text-[#2F2F2F]"
                }`}
              >
                {field.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={backToInvoice}
            className="flex-1 min-w-[240px] h-[54px] rounded-[13px] border border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-bold text-[15px] cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
          >
            Back to invoice
          </button>
          <button
            type="button"
            onClick={() =>
              toast("Open the invoice and use Return Items to return this one")
            }
            className="h-[54px] px-[22px] rounded-[13px] border border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-bold text-[15px] cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
          >
            Return this item
          </button>
        </div>
      </div>
    </div>
  );
}
