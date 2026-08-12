"use client";

import React from "react";
import { VcIcon } from "./VcIcon";

export interface HandoverReceipt {
  itemName: string;
  quantity: string;
  amount: string;
  handedTo: string;
  code: string;
  at: string;
  /** Items handed over / total, after this hand-over. */
  done: number;
  total: number;
  nextItemName?: string;
  nextItemQty?: string;
  saleCode: string;
}

interface HandoverSuccessModalProps {
  open: boolean;
  receipt: HandoverReceipt | null;
  onClose: () => void;
  onNext: () => void;
  onBackHome: () => void;
}

/**
 * Shown after a verified hand-over instead of routing straight back, so the
 * operator can confirm what happened and move to the next item in one tap.
 */
export const HandoverSuccessModal = ({
  open,
  receipt,
  onClose,
  onNext,
  onBackHome,
}: HandoverSuccessModalProps) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || !receipt) return null;

  const hasNext = Boolean(receipt.nextItemName);
  const pct = receipt.total
    ? Math.round((receipt.done / receipt.total) * 100)
    : 0;

  const rows = [
    { label: "Item", value: receipt.itemName },
    { label: "Quantity", value: `${receipt.quantity} · ${receipt.amount}` },
    { label: "Handed to", value: receipt.handedTo },
    ...(receipt.code ? [{ label: "Code used", value: receipt.code }] : []),
    { label: "Time", value: receipt.at },
  ];

  return (
    <div className="fixed inset-0 z-[76] flex items-center justify-center p-6 overflow-y-auto">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(10,37,64,.46)]"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[470px] m-auto shrink-0 bg-white rounded-[20px] px-7 pt-[30px] pb-[26px] shadow-[0_28px_60px_-20px_rgba(10,37,64,.5)] font-dm-sans"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <span className="w-[68px] h-[68px] rounded-full bg-[#E7F4EB] inline-flex items-center justify-center">
            <VcIcon name="check" size={32} stroke="#00681B" strokeWidth={2.8} />
          </span>
          <div className="font-clash font-bold text-[24px] tracking-[-.5px] text-[#2F2F2F]">
            Hand-over complete
          </div>
          <div className="text-[14.5px] text-[#6E7480] leading-[1.5]">
            {receipt.itemName} was handed to the{" "}
            {receipt.handedTo.toLowerCase()} at {receipt.at}. Stock is cleared
            from this order.
          </div>
        </div>

        <div className="mt-[22px] border border-[#D8D8D8B3] rounded-[15px] px-4 py-1">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-[14px] py-[13px] border-b border-[#D8D8D880]"
            >
              <span className="text-[13.5px] text-[#8E8E93]">{row.label}</span>
              <span className="text-[13.5px] font-bold text-[#2F2F2F] text-right">
                {row.value}
              </span>
            </div>
          ))}

          <div className="pt-[14px] pb-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13.5px] text-[#8E8E93]">
                Order progress
              </span>
              <span className="text-[13.5px] font-bold text-[#2F2F2F]">
                {receipt.done} of {receipt.total} items handed over
              </span>
            </div>
            <div className="mt-[9px] h-2 rounded-full bg-[#F1F2F4] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00681B]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-[22px] flex flex-col gap-2.5">
          {hasNext ? (
            <>
              <button
                type="button"
                onClick={onNext}
                className="w-full h-[54px] border-none rounded-[13px] bg-[#0A6DC0] text-white font-bold text-[16px] cursor-pointer inline-flex items-center justify-center gap-2.5 hover:bg-[#4C87EB] active:bg-[#3A6BC4]"
              >
                <span>Hand over next item</span>
                <VcIcon name="chevron" size={19} stroke="#fff" strokeWidth={2.4} />
              </button>
              <div className="text-[12.5px] text-[#8E8E93] text-center">
                Next up: {receipt.nextItemName}
                {receipt.nextItemQty ? ` · ${receipt.nextItemQty}` : ""}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 border border-[#D8D8D8E6] rounded-[13px] bg-white text-[#2F2F2F] font-bold text-[15px] cursor-pointer mt-1 hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              >
                Back to order
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onBackHome}
                className="w-full h-[54px] border-none rounded-[13px] bg-[#0A6DC0] text-white font-bold text-[16px] cursor-pointer inline-flex items-center justify-center gap-2.5 hover:bg-[#4C87EB] active:bg-[#3A6BC4]"
              >
                <VcIcon name="box" size={19} stroke="#fff" strokeWidth={2.1} />
                <span>Back to Inventory home</span>
              </button>
              <div className="text-[12.5px] text-[#8E8E93] text-center">
                All items on {receipt.saleCode} are handed over.
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 border border-[#D8D8D8E6] rounded-[13px] bg-white text-[#2F2F2F] font-bold text-[15px] cursor-pointer mt-1 hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              >
                View order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandoverSuccessModal;
