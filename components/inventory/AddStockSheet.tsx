"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StockForm from "@/app/(dashboard)/inventory/my-store/chunks/StockForm";
import type { Store } from "@/types/store";

interface AddStockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: Store[];
  /** Empty string means "not chosen yet" — the sheet asks first. */
  storeId: string;
  onStoreChange: (storeId: string) => void;
  onSuccess: () => void;
}

/**
 * Add Stock, openable from My Store. Stock always belongs to a specific store,
 * so when the list is showing all stores the sheet asks which one first rather
 * than guessing.
 */
export const AddStockSheet = ({
  open,
  onOpenChange,
  stores,
  storeId,
  onStoreChange,
  onSuccess,
}: AddStockSheetProps) => {
  const store = stores.find((s) => String(s.id) === storeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-clash font-semibold text-[#2F2F2F]">
            {store ? `Add Stock to ${store.name}` : "Add Stock"}
          </DialogTitle>
        </DialogHeader>

        {store ? (
          <StockForm storeId={String(store.id)} onSuccess={onSuccess} />
        ) : (
          <div className="flex flex-col gap-2.5 pt-1">
            <p className="text-[13.5px] text-[#8E8E93]">
              Which store is this stock going into?
            </p>
            {stores.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onStoreChange(String(option.id))}
                className="flex items-center justify-between gap-3 w-full text-left cursor-pointer px-4 py-[14px] rounded-[14px] border border-[#D8D8D8CC] bg-white hover:border-[#0A6DC0] hover:bg-[#F9FCFF] transition"
              >
                <span className="font-bold text-[15px] text-[#2F2F2F]">
                  {option.name}
                </span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#B9BCC2" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddStockSheet;
