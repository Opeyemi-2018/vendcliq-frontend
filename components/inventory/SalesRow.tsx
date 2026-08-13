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

interface SalesRowProps {
  row: SalesRowData;
  hideAmounts?: boolean;
  /** Rows are separated by a top rule; the first row in a list omits it. */
  first?: boolean;
  "data-tour"?: string;
}

export const SalesRow = ({
  row,
  hideAmounts = false,
  first = false,
  ...rest
}: SalesRowProps) => {
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
      className={`flex items-center gap-[14px] py-[13px] px-1 cursor-pointer hover:bg-[#F9FCFF] ${
        first ? "" : "border-t border-[#D8D8D873]"
      }`}
      {...rest}
    >
      <div
        className="w-[42px] h-[42px] rounded-[13px] inline-flex items-center justify-center shrink-0"
        style={{ background: online ? "#E1EEFF" : "#E0F2ED" }}
      >
        <VcIcon
          name={online ? "globe" : "storefront"}
          size={21}
          stroke={online ? "#0A6DC0" : "#148264"}
          strokeWidth={1.9}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[14.5px] text-[#2F2F2F] tracking-[-.2px]">
            {row.code}
          </span>
          <span
            className="text-[10.5px] font-bold tracking-[.4px] uppercase px-2 py-[3px] rounded-full"
            style={{
              background: online ? "#E1EEFF" : "#E0F2ED",
              color: online ? "#0A6DC0" : "#0E6E55",
            }}
          >
            {online ? "Online" : "In-store"}
          </span>
        </div>
        <div className="text-[12.5px] text-[#8E8E93] mt-[3px] truncate">
          {row.customerName} · {time(row.createdAt)}
        </div>
      </div>

      {row.awaitingHandover && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(row.href);
          }}
          className="inline-flex items-center gap-[7px] h-[38px] px-[15px] rounded-[10px] border-none cursor-pointer text-[13px] font-bold bg-[#FAC136] text-[#1A1400] hover:bg-[#FFB800] shrink-0"
        >
          <VcIcon name="truck" size={16} stroke="#1A1400" strokeWidth={2.2} />
          <span>Hand over</span>
        </button>
      )}

      <div className="text-right shrink-0 min-w-[116px]">
        <div className="font-bold text-[15px] text-[#2F2F2F] tracking-[-.2px]">
          {formatNaira(row.amount, hideAmounts)}
        </div>
        <span
          className="inline-block mt-1 text-[11.5px] font-bold px-[10px] py-[3px] rounded-full"
          style={{ background: row.statusBg, color: row.statusFg }}
        >
          {row.statusLabel}
        </span>
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

export default SalesRow;
