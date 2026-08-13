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

interface QuickHandoverDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Paid online orders still awaiting handover, newest first. */
  orders: SalesRowData[];
}

export const QuickHandoverDrawer = ({
  open,
  onClose,
  orders,
}: QuickHandoverDrawerProps) => {
  const router = useRouter();

  // Escape closes the drawer, and the body must not scroll behind it.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const count = orders.length;
  const subtitle =
    count === 1
      ? "1 paid order awaiting pickup"
      : `${count} paid orders awaiting pickup`;

  // "Start with the oldest order" — the longest-waiting order, not the newest.
  const oldest = orders.length
    ? [...orders].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )[0]
    : null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(10,37,64,.42)] animate-in fade-in duration-200"
      />

      <aside
        data-tour="handover-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Quick Handover"
        className="relative w-[440px] max-w-[92vw] h-full bg-white shadow-[-18px_0_46px_-18px_rgba(10,37,64,.35)] flex flex-col font-dm-sans"
      >
        <header className="px-6 pt-[22px] pb-4 border-b border-[#D8D8D880] flex items-start gap-[14px]">
          <span className="w-[46px] h-[46px] rounded-[14px] bg-[#FFF3DB] inline-flex items-center justify-center shrink-0">
            <VcIcon name="truck" size={24} stroke="#B47800" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-clash font-bold text-[22px] tracking-[-.4px] text-[#2F2F2F]">
              Quick Handover
            </div>
            <div className="text-[13px] text-[#8E8E93] mt-[3px]">{subtitle}</div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-[38px] h-[38px] rounded-[11px] border-none bg-[#F4F5F7] cursor-pointer inline-flex items-center justify-center shrink-0 hover:bg-[#E7E9ED]"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2F2F2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6 18 18" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-auto px-6 pt-[18px] pb-6 flex flex-col gap-3">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="border border-[#D8D8D8B3] rounded-[16px] p-4 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-[15px] text-[#2F2F2F] tracking-[-.2px]">
                      {order.code}
                    </div>
                    <div className="text-[12.5px] text-[#8E8E93] mt-[3px]">
                      {order.customerName} · {time(order.createdAt)}
                    </div>
                  </div>
                  <span className="text-[10.5px] font-bold tracking-[.4px] uppercase px-[9px] py-1 rounded-full bg-[#FFF3DB] text-[#85540A] shrink-0">
                    Awaiting
                  </span>
                </div>

                <div className="mt-3 bg-[#F9FAFB] rounded-[12px] px-[14px] py-3 flex items-center justify-between gap-3">
                  <span className="text-[13px] text-[#4B5563] min-w-0 truncate">
                    {order.itemSummary ?? order.handoverLabel ?? "Items ready"}
                  </span>
                  <span className="font-clash font-bold text-[17px] text-[#2F2F2F] tracking-[-.3px] shrink-0">
                    {formatNaira(order.amount)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(order.href);
                  }}
                  className="mt-3 w-full h-[46px] border-none rounded-[12px] bg-[#0A6DC0] text-white font-bold text-[15px] cursor-pointer inline-flex items-center justify-center gap-2 hover:bg-[#09599A]"
                >
                  <VcIcon name="check" size={18} stroke="#fff" strokeWidth={2.4} />
                  <span>Hand over items</span>
                </button>
              </div>
            ))
          ) : (
            <div className="text-center px-5 py-14">
              <span className="w-[62px] h-[62px] rounded-full bg-[#E7F4EB] inline-flex items-center justify-center">
                <VcIcon name="check" size={30} stroke="#00681B" strokeWidth={2.4} />
              </span>
              <div className="font-clash font-bold text-[19px] text-[#2F2F2F] mt-[14px] tracking-[-.3px]">
                Nothing left to hand over
              </div>
              <div className="text-[13.5px] text-[#8E8E93] mt-1.5">
                Every paid online order has been picked up.
              </div>
            </div>
          )}
        </div>

        {oldest && (
          <footer className="px-6 pt-4 pb-[22px] border-t border-[#D8D8D880]">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(oldest.href);
              }}
              className="w-full h-[52px] border-none rounded-[13px] bg-[#FAC136] text-[#1A1400] font-bold text-[16px] cursor-pointer hover:bg-[#FFB800]"
            >
              Start with the oldest order
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
};

export default QuickHandoverDrawer;
