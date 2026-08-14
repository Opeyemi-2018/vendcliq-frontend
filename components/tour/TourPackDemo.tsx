"use client";

import { useActiveTourTarget } from "@/lib/tour/store";
import { formatPacks, formatPieces } from "@/lib/priceInput";

/** 1.1667 packs of 12 = 14 bottles = one full pack and two loose. */
const DEMO_PACKS = 14 / 12;
const DEMO_ITEMS_PER_PACK = 12;

/**
 * A read-only sample row shown on the Sell screen only while the tour is on the
 * pack-format stop. Not every seller has a part-used pack in stock, so the tour
 * brings its own example rather than hoping one exists. It cannot be sold —
 * there is nothing to click.
 */
export const TourPackDemo = () => {
  const target = useActiveTourTarget();
  if (target !== "pack-qty") return null;

  return (
    <div
      data-tour="pack-qty"
      className="mb-3 bg-white rounded-2xl border-[1.5px] border-dashed border-[#FAC136] overflow-hidden select-none"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#FFF3DB]">
        <span className="text-[11px] font-bold tracking-[.6px] uppercase text-[#85540A]">
          Sample product
        </span>
        <span className="text-[11.5px] text-[#85540A]">
          Shown for the tour only
        </span>
      </div>

      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-lg border border-[#E4E4E4] bg-[#F4F6F8] shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#6E7480" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 2h4v3.2l1.4 2.6V20a2 2 0 0 1-2 2h-2.8a2 2 0 0 1-2-2V7.8L10 5.2V2Z" />
              <path d="M8.6 12h6.8" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[13px] md:text-[16px] text-[#2F2F2F] truncate">
              Sample Drink 33cl
            </p>
            <p className="text-[12px] text-[#9E9A9A]">
              SKU: SAMPLE-33CL
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 pl-3">
          <p className="text-[12px] text-[#9E9A9A] font-medium">In Stock</p>
          <p className="font-bold text-[13px] md:text-[16px] text-[#2F2F2F]">
            {formatPacks(DEMO_PACKS, DEMO_ITEMS_PER_PACK)}
          </p>
          <p className="text-[10px] text-[#2F2F2F] mt-0.5">
            1 pack = {DEMO_ITEMS_PER_PACK} pieces
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 -mt-1">
        <div className="rounded-[10px] bg-[#F5F7FA] px-3 py-2.5 text-[12.5px] leading-[1.5] text-[#565656]">
          Counted in packs it reads{" "}
          <strong className="text-[#0A6DC0]">
            {formatPacks(DEMO_PACKS, DEMO_ITEMS_PER_PACK)}
          </strong>
          . Switch the same product to pieces and it reads{" "}
          <strong className="text-[#0A6DC0]">
            {formatPieces(DEMO_PACKS, DEMO_ITEMS_PER_PACK)} pieces
          </strong>
          .
        </div>
      </div>
    </div>
  );
};

export default TourPackDemo;
