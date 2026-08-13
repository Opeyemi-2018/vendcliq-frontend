"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNaira } from "@/lib/salesFilters";

interface MediumBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Payment medium → amount, e.g. { CASH: 1200, TRANSFER: 800 }. */
  breakdown?: Record<string, number | undefined>;
  rangeLabel: string;
  loading?: boolean;
  hideAmounts?: boolean;
}

/**
 * Shared by the inventory overview and Sales History — both surface the same
 * "how were these sales collected" split.
 */
export const MediumBreakdownModal = ({
  open,
  onOpenChange,
  breakdown,
  rangeLabel,
  loading = false,
  hideAmounts = false,
}: MediumBreakdownModalProps) => {
  const entries = Object.entries(breakdown ?? {}).filter(
    ([, amount]) => amount !== undefined,
  );
  const total = entries.reduce((sum, [, amount]) => sum + (amount ?? 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] font-dm-sans text-[#2F2F2F] rounded-xl bg-white">
        <DialogHeader>
          <DialogTitle className="md:text-[21px] font-bold">
            Breakdown by collection medium
          </DialogTitle>
          <p className="text-sm text-[#8E8E93]">{rangeLabel}</p>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#0A6DC0]" />
            </div>
          ) : entries.length > 0 ? (
            <div className="grid gap-3">
              {entries.map(([medium, amount]) => {
                const share = total ? ((amount ?? 0) / total) * 100 : 0;
                return (
                  <div
                    key={medium}
                    className="p-4 rounded-[12px] border border-[#D8D8D866]"
                  >
                    <div className="flex justify-between items-center gap-3">
                      <span className="text-[15px] font-medium capitalize">
                        {medium.toLowerCase()}
                      </span>
                      <span className="text-[15px] font-bold">
                        {formatNaira(amount ?? 0, hideAmounts)}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 rounded-full bg-[#F1F2F4] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0A6DC0]"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <div className="text-[12px] text-[#8E8E93] mt-1.5">
                      {share.toFixed(1)}% of collected sales
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-[#8E8E93] py-10">
              No sales data available for this period
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediumBreakdownModal;
