"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction } from "@/types/transactions";
import { shortRef } from "@/lib/transactionRows";

interface TransactionReceiptModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const naira = (amount: number) =>
  `₦${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;

const when = (iso: string) => {
  try {
    return format(new Date(iso), "MMMM d, yyyy 'at' h:mm a");
  } catch {
    return "—";
  }
};

/**
 * The wallet receipt, shared by the account overview and Transactions History
 * so a row opens the same thing wherever it is tapped.
 */
export const TransactionReceiptModal = ({
  transaction,
  open,
  onOpenChange,
}: TransactionReceiptModalProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    if (!receiptRef.current) return null;
    return html2canvas(receiptRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
  };

  const download = async () => {
    try {
      setBusy(true);
      const canvas = await capture();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `receipt-${transaction?.transactionReference ?? "vendcliq"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      toast.error("Could not download the receipt");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    try {
      setBusy(true);
      const canvas = await capture();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) return;
      const file = new File([blob], "receipt.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Transaction receipt" });
      } else {
        await download();
      }
    } catch {
      /* a cancelled share is not an error worth shouting about */
    } finally {
      setBusy(false);
    }
  };

  if (!transaction) return null;

  const credit = transaction.direction === "CREDIT";

  const fields: { label: string; value: string }[] = [
    { label: "Narration", value: transaction.narration || "—" },
    { label: "Sender", value: transaction.sender?.name || "—" },
    { label: "Sender Account", value: transaction.sender?.accountNumber || "—" },
    { label: "Sender Bank", value: transaction.sender?.bankName || "—" },
    { label: "Receiver", value: transaction.receiver?.name || "—" },
    {
      label: "Receiver Account",
      value: transaction.receiver?.accountNumber || "—",
    },
    { label: "Receiver Bank", value: transaction.receiver?.bankName || "—" },
    { label: "Category", value: transaction.category || "—" },
    { label: "Direction", value: transaction.direction },
    { label: "Session ID", value: transaction.sessionId || "—" },
    {
      label: "Transaction Reference",
      value: shortRef(transaction.transactionReference || "—"),
    },
    { label: "Date", value: when(transaction.createdAt) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[460px] max-h-[88vh] overflow-y-auto font-dm-sans text-[#2F2F2F] rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="sr-only">Transaction receipt</DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="bg-white p-1">
          <div className="flex flex-col items-center text-center gap-2">
            <Image
              src="/invoice-logo.png"
              width={40}
              height={40}
              alt="Vendcliq"
              className="w-8 md:w-10"
              unoptimized
            />
            <h2 className="text-[16px] font-bold text-[#2F2F2F]">
              Payment Success!
            </h2>
            <p className="text-[13px] text-[#8E8E93]">
              Your payment was successful
            </p>
            <div
              className="font-clash font-bold text-[26px] mt-1"
              style={{ color: credit ? "#31A078" : "#EA4334" }}
            >
              {credit ? "+" : "−"}
              {naira(transaction.amount)}
            </div>
          </div>

          <div className="bg-[#F7F9FA] rounded-lg p-4 mt-4">
            <div className="space-y-2.5">
              {fields.map((field) => (
                <div
                  key={field.label}
                  className="flex justify-between items-start gap-4"
                >
                  <span className="text-[#4B4E52] text-[12.5px] shrink-0">
                    {field.label}
                  </span>
                  <span className="text-[12.5px] font-medium text-right break-words min-w-0">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={share}
            disabled={busy}
            className="flex-1 h-12 rounded-[12px] border border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-bold text-[14px] cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0] disabled:opacity-60"
          >
            Share
          </button>
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="flex-1 h-12 rounded-[12px] border-none bg-[#0A6DC0] text-white font-bold text-[14px] cursor-pointer hover:bg-[#09599A] disabled:opacity-60"
          >
            {busy ? "Working…" : "Download Receipt"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionReceiptModal;
