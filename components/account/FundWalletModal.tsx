"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VcIcon } from "@/components/inventory/VcIcon";

interface FundWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountNumber: string;
  accountName?: string;
  bankName?: string;
}

/**
 * Funding is a bank transfer to the user's own account, so the modal is simply
 * the details they need to give their bank, each individually copyable.
 */
export const FundWalletModal = ({
  open,
  onOpenChange,
  accountNumber,
  accountName = "Vendcliq Wallet",
  bankName = "WEMA Bank",
}: FundWalletModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      toast.error(`Could not copy the ${label.toLowerCase()}`);
    }
  };

  const rows = [
    { label: "Bank", value: bankName, copyable: false },
    { label: "Account number", value: accountNumber, copyable: true },
    { label: "Account name", value: accountName, copyable: true },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[440px] font-dm-sans text-[#2F2F2F] rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="font-clash font-bold text-[22px] tracking-[-.4px]">
            Fund your wallet
          </DialogTitle>
          <p className="text-[13.5px] text-[#8E8E93]">
            Transfer to this account from any bank. Money lands in your Vendcliq
            wallet, usually within a minute.
          </p>
        </DialogHeader>

        <div className="mt-1 border border-[#D8D8D8B3] rounded-[15px] px-4 py-1">
          {rows.map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between gap-4 py-[14px] ${
                index < rows.length - 1 ? "border-b border-[#D8D8D880]" : ""
              }`}
            >
              <span className="text-[13px] text-[#8E8E93]">{row.label}</span>
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="text-[15px] font-bold text-[#2F2F2F] truncate">
                  {row.value || "—"}
                </span>
                {row.copyable && row.value && (
                  <button
                    type="button"
                    onClick={() => copy(row.label, row.value)}
                    aria-label={`Copy ${row.label}`}
                    className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0A6DC0] border-none bg-transparent cursor-pointer hover:text-[#09599A]"
                  >
                    <VcIcon name="copy" size={15} strokeWidth={1.9} />
                    <span>{copiedField === row.label ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2.5 px-[14px] py-3 rounded-[12px] bg-[#F9FCFF] border border-[#0A6DC029]">
          <VcIcon name="check" size={17} stroke="#0A6DC0" strokeWidth={2.2} className="shrink-0 mt-px" />
          <span className="text-[12.5px] text-[#4B5563] leading-[1.45]">
            Transfers are free. Use your own bank app — there is nothing to
            confirm here once the money is sent.
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mt-4 w-full h-12 rounded-[12px] border-none bg-[#0A6DC0] text-white font-bold text-[15px] cursor-pointer hover:bg-[#09599A]"
        >
          Done
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default FundWalletModal;
