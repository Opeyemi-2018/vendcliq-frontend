"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VcIcon } from "./VcIcon";

interface ConfirmDeleteStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Product names being removed, for an explicit list. */
  names: string[];
  onConfirm: () => Promise<void> | void;
}

/**
 * Deleting stock is irreversible, so the modal names what will go and asks for
 * a deliberate confirmation rather than a reflexive one.
 */
export const ConfirmDeleteStockModal = ({
  open,
  onOpenChange,
  names,
  onConfirm,
}: ConfirmDeleteStockModalProps) => {
  const [busy, setBusy] = useState(false);
  const count = names.length;

  const run = async () => {
    try {
      setBusy(true);
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[440px] font-dm-sans text-[#2F2F2F] rounded-xl bg-white">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-[13px] bg-[#FBE9E7] inline-flex items-center justify-center shrink-0">
              <VcIcon name="warning" size={22} stroke="#C0392B" strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="font-clash font-bold text-[20px] tracking-[-.4px]">
                Delete {count} {count === 1 ? "product" : "products"}?
              </DialogTitle>
              <p className="text-[13.5px] text-[#8E8E93] mt-1">
                This removes the stock from your store. It cannot be undone.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-1 max-h-[180px] overflow-y-auto border border-[#D8D8D8B3] rounded-[12px] px-4 py-1">
          {names.map((name, index) => (
            <div
              key={`${name}-${index}`}
              className={`py-2.5 text-[13.5px] text-[#2F2F2F] ${
                index < names.length - 1 ? "border-b border-[#D8D8D866]" : ""
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="flex-1 h-12 rounded-[12px] border border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-bold text-[14px] cursor-pointer hover:border-[#0A6DC0] disabled:opacity-60"
          >
            Keep them
          </button>
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="flex-1 h-12 rounded-[12px] border-none bg-[#C0392B] text-white font-bold text-[14px] cursor-pointer hover:bg-[#A53226] disabled:opacity-60"
          >
            {busy ? "Deleting…" : `Delete ${count === 1 ? "product" : "all"}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteStockModal;
