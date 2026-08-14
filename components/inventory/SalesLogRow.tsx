"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { formatNaira } from "@/lib/salesFilters";
import { SalesRowData } from "@/lib/salesRows";
import { VcIcon } from "./VcIcon";

const time = (isoDate: string) => {
  try {
    return format(new Date(isoDate), "h:mm a");
  } catch {
    return "—";
  }
};

interface SalesLogRowProps {
  row: SalesRowData;
  hideAmounts?: boolean;
}

/**
 * The roomier card row used on Sales History — customer-led, with the item
 * summary and handover chip the compact overview row leaves out.
 */
export const SalesLogRow = ({ row, hideAmounts = false }: SalesLogRowProps) => {
  const router = useRouter();
  const online = row.channel === "online";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(row.href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(row.href);
      }}
      className="bg-white border border-[#D8D8D88C] rounded-[16px] py-[14px] px-[18px] flex items-center gap-[14px] flex-wrap cursor-pointer hover:border-[#0A6DC0] hover:bg-[#F9FCFF] transition"
    >
      <div
        className="w-10 h-10 sm:w-[46px] sm:h-[46px] rounded-[12px] sm:rounded-[14px] inline-flex items-center justify-center shrink-0"
        style={{ background: online ? "#E1EEFF" : "#E0F2ED" }}
      >
        <VcIcon
          name={online ? "globe" : "storefront"}
          size={22}
          stroke={online ? "#0A6DC0" : "#148264"}
          strokeWidth={1.9}
        />
      </div>

      <div className="flex-1 sm:flex-[1_1_220px] min-w-0">
        <div className="flex items-center gap-2 flex-nowrap min-w-0">
          <span className="font-bold text-[14px] sm:text-[15px] text-[#2F2F2F] tracking-[-.2px] truncate">
            {row.customerName}
          </span>
          <span
            className="text-[10.5px] font-bold tracking-[.4px] uppercase px-2 py-[3px] rounded-full shrink-0"
            style={{
              background: online ? "#E1EEFF" : "#E0F2ED",
              color: online ? "#0A6DC0" : "#0E6E55",
            }}
          >
            {online ? "Online" : "Shop"}
          </span>
        </div>
        <div className="text-[12px] sm:text-[12.5px] text-[#8E8E93] mt-[3px] truncate">
          {row.code} · {time(row.createdAt)}
        </div>
        {row.itemSummary && (
          <div className="hidden sm:block text-[12.5px] text-[#6B6B70] mt-1">
            {row.itemSummary}
          </div>
        )}
      </div>

      {row.awaitingHandover && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(row.href);
          }}
          className="inline-flex items-center justify-center gap-[7px] w-9 h-9 sm:w-auto sm:h-10 sm:px-4 rounded-[10px] border-none cursor-pointer text-[13px] font-bold bg-[#FAC136] text-[#1A1400] hover:bg-[#FFB800] shrink-0"
        >
          <VcIcon name="truck" size={16} stroke="#1A1400" strokeWidth={2.2} />
          <span className="hidden sm:inline">Hand over</span>
        </button>
      )}

      <div className="text-right shrink-0 sm:min-w-[130px]">
        <div className="font-clash font-bold text-[15px] sm:text-[17px] text-[#2F2F2F] tracking-[-.3px] whitespace-nowrap">
          {formatNaira(row.amount, hideAmounts)}
        </div>
        <span
          className="inline-block mt-0.5 sm:mt-1 text-[11px] sm:text-[11.5px] font-bold px-2 sm:px-[10px] py-[2px] sm:py-[3px] rounded-full whitespace-nowrap"
          style={{ background: row.statusBg, color: row.statusFg }}
        >
          {row.statusLabel}
        </span>

        {online && row.handoverLabel && (
          <div className="mt-1.5">
            {row.handoverComplete ? (
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-[10px] py-[3px] rounded-full bg-[#E7F4EB] text-[#003909]">
                <VcIcon
                  name="check"
                  size={12}
                  stroke="#00681B"
                  strokeWidth={3}
                />
                <span>{row.handoverLabel}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold px-[10px] py-[3px] rounded-full bg-[#F4F5F7] text-[#6B6B70]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9AA0A8]" />
                <span>{row.handoverLabel}</span>
              </span>
            )}
          </div>
        )}
      </div>

      <VcIcon
        name="chevron"
        size={18}
        stroke="#B9BCC2"
        strokeWidth={2.4}
        className="shrink-0"
      />
    </div>
  );
};

export default SalesLogRow;
