"use client";

import { useActiveTourTarget } from "@/lib/tour/store";

const STEPS = [
  {
    n: 1,
    title: "Pick the item being collected",
    body: "Hand over one item now and the rest later.",
    chip: "Pending",
    chipBg: "#FFF3DB",
    chipFg: "#85540A",
  },
  {
    n: 2,
    title: "Choose who is collecting",
    body: "Customer types the OTP sent to their phone. A driver completes it on their own app.",
    chip: "Customer or driver",
    chipBg: "#E1EEFF",
    chipFg: "#0A6DC0",
  },
  {
    n: 3,
    title: "Confirm with the code",
    body: "Type the code they read out and the item flips to Completed.",
    chip: "Completed",
    chipBg: "#E7F4EB",
    chipFg: "#003909",
  },
];

/**
 * A read-only walk-through of a handover, shown only on that tour stop. It is a
 * sample rather than a real order because an account may have nothing pending,
 * and because nothing here should be able to mark real stock as handed over.
 */
export const TourHandoverDemo = () => {
  const target = useActiveTourTarget();
  if (target !== "handover-demo") return null;

  return (
    <div
      data-tour="handover-demo"
      className="fixed z-[70] left-1/2 -translate-x-1/2 top-[80px] w-[min(400px,90vw)] max-h-[calc(100vh-200px)] overflow-y-auto bg-white rounded-[18px] border-[1.5px] border-dashed border-[#FAC136] shadow-[0_24px_54px_-18px_rgba(10,37,64,.5)] font-dm-sans select-none"
    >
      <div className="flex items-center justify-between px-5 py-3 bg-[#FFF3DB] rounded-t-[16px]">
        <span className="text-[11px] font-bold tracking-[.6px] uppercase text-[#85540A]">
          Sample handover
        </span>
        <span className="text-[11.5px] text-[#85540A]">
          Shown for the tour only
        </span>
      </div>

      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#D8D8D873]">
          <span className="w-11 h-11 rounded-[12px] bg-[#E1EEFF] inline-flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0A6DC0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h11v9H3z" />
              <path d="M14 9h4l3 3v3h-7z" />
              <circle cx="7" cy="18" r="1.8" />
              <circle cx="17" cy="18" r="1.8" />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="font-bold text-[15px] text-[#1F2328]">
              INV-20260813-00042
            </div>
            <div className="text-[12.5px] text-[#8E8E93] mt-0.5">
              2 items · 1 still to hand over
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <span className="w-[26px] h-[26px] rounded-full bg-[#0A6DC0] text-white text-[12.5px] font-bold inline-flex items-center justify-center shrink-0 mt-0.5">
                {s.n}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[14px] text-[#1F2328]">
                    {s.title}
                  </span>
                  <span
                    className="text-[11px] font-bold px-2 py-[3px] rounded-full"
                    style={{ background: s.chipBg, color: s.chipFg }}
                  >
                    {s.chip}
                  </span>
                </div>
                <p className="text-[12px] leading-[1.45] text-[#6B6B70] mt-0.5 m-0">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TourHandoverDemo;
