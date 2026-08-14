"use client";

import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VcIcon } from "@/components/inventory/VcIcon";
import {
  buildStatement,
  fetchStatementTail,
  type StatementAccount,
} from "@/lib/statement";
import { generateStatementPdf } from "@/lib/statementPdf";
import { generateStatementXlsx } from "@/lib/statementXlsx";
import { periodLabel, type StatementPeriod } from "@/lib/statementPeriod";
import type { Transaction } from "@/types/transactions";

type Format = "pdf" | "xlsx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: StatementPeriod;
  transactions: Transaction[];
  account: StatementAccount | null;
}

const OPTIONS: {
  id: Format;
  title: string;
  detail: string;
  icon: "note" | "chart";
  tone: string;
  background: string;
}[] = [
  {
    id: "pdf",
    title: "PDF statement",
    detail: "Printed layout, ready to send to a bank or auditor.",
    icon: "note",
    tone: "#B02A20",
    background: "#FCEAE7",
  },
  {
    id: "xlsx",
    title: "Excel workbook",
    detail: "The same postings as figures you can sort and total.",
    icon: "chart",
    tone: "#00681B",
    background: "#E7F4EB",
  },
];

/**
 * Asks which format the statement should come out in, then builds it from the
 * postings already on screen. The balance column needs one extra call — see
 * `fetchStatementTail` — so a historical period closes on its own balance
 * rather than on the wallet's balance today.
 */
const StatementDownloadDialog = ({
  open,
  onOpenChange,
  period,
  transactions,
  account,
}: Props) => {
  const [busy, setBusy] = useState<Format | null>(null);

  const download = async (format: Format) => {
    if (!account) {
      toast.error("Account details are still loading. Try again in a moment.");
      return;
    }
    if (!transactions.length) {
      toast.error("There are no transactions in this period to download.");
      return;
    }

    setBusy(format);
    try {
      const after = await fetchStatementTail(period);
      const statement = buildStatement({
        account,
        period,
        inPeriod: transactions,
        after,
      });

      if (format === "pdf") await generateStatementPdf(statement);
      else generateStatementXlsx(statement);

      toast.success(`Statement for ${periodLabel(period)} downloaded`);
      onOpenChange(false);
    } catch (error) {
      console.error("Statement download failed:", error);
      toast.error("Could not build the statement. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-clash text-[20px] tracking-[-.4px]">
            Download statement
          </DialogTitle>
          <DialogDescription className="text-[13.5px] text-[#8E8E93]">
            {periodLabel(period)} · {transactions.length}{" "}
            {transactions.length === 1 ? "transaction" : "transactions"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-1">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => download(option.id)}
              className="w-full text-left flex items-center gap-[14px] px-4 py-[14px] rounded-[14px] border border-[#D8D8D8E6] bg-white cursor-pointer transition hover:border-[#0A6DC0] hover:bg-[#F9FCFF] disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:border-[#D8D8D8E6] disabled:hover:bg-white"
            >
              <span
                className="w-11 h-11 rounded-[13px] inline-flex items-center justify-center shrink-0"
                style={{ background: option.background }}
              >
                {busy === option.id ? (
                  <ClipLoader size={19} color={option.tone} />
                ) : (
                  <VcIcon
                    name={option.icon}
                    size={21}
                    stroke={option.tone}
                    strokeWidth={2}
                  />
                )}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-[14.5px] text-[#2F2F2F]">
                  {option.title}
                </span>
                <span className="block text-[12.5px] text-[#8E8E93] mt-[3px]">
                  {busy === option.id ? "Building your statement…" : option.detail}
                </span>
              </span>
              <VcIcon
                name="chevron"
                size={17}
                stroke="#B9BCC2"
                strokeWidth={2.4}
                className="shrink-0"
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatementDownloadDialog;
