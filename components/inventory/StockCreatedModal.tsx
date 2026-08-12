"use client";

import React from "react";

interface StockCreatedModalProps {
  open: boolean;
  productName?: string;
  storeName?: string;
  onAddConditions: () => void;
  onGoBack: () => void;
}

/**
 * Shown over the Add Stock sheet once a stock is created — the sheet stays put
 * so "Add marketplace conditions" can drop straight into its conditions tab.
 */
export const StockCreatedModal = ({
  open,
  productName,
  storeName,
  onAddConditions,
  onGoBack,
}: StockCreatedModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-6 font-dm-sans">
      <div className="absolute inset-0 bg-[rgba(10,37,64,.46)]" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[440px] bg-white rounded-[18px] shadow-[0_24px_70px_rgba(10,37,64,.24)] px-7 py-8 text-center"
      >
        <div className="w-[62px] h-[62px] rounded-full bg-[#E7F4EB] text-[#003909] mx-auto flex items-center justify-center">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>

        <h3 className="mt-[18px] font-clash font-bold text-[22px] leading-[1.2] text-[#1F2328]">
          Stock added
        </h3>
        <p className="mt-2 text-[13.5px] leading-[1.55] text-[#565656]">
          {productName ? <strong>{productName}</strong> : "Your product"} is now
          {storeName ? ` in ${storeName}` : " in your store"}. Add marketplace
          conditions to set bundles, discounts or minimum orders for it.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onAddConditions}
            className="w-full h-[50px] rounded-[12px] border-none bg-[#0A6DC0] text-white font-bold text-[15px] cursor-pointer hover:bg-[#09599A]"
          >
            Add marketplace conditions
          </button>
          <button
            type="button"
            onClick={onGoBack}
            className="w-full h-[50px] rounded-[12px] bg-white border border-[#D8D8D8CC] text-[#2F2F2F] font-bold text-[15px] cursor-pointer hover:bg-[#F8FBFF] hover:border-[#0A6DC0]"
          >
            Go back to store
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockCreatedModal;
