"use client";

import { usePathname } from "next/navigation";
import { openTourWelcome } from "@/lib/tour/store";
import { TOUR_STEPS } from "@/lib/tour/steps";

/** Opens the floating chat widget, which owns its own state. */
const openChat = () => window.dispatchEvent(new CustomEvent("vc:open-chat"));

/** The tour card and the AI card that sit above Logout in the prototype. */
export const SidebarPromos = ({
  tourStops = TOUR_STEPS.length,
}: {
  tourStops?: number;
}) => {
  const pathname = usePathname();
  const onAccount = pathname?.startsWith("/account");

  return (
    <div className="flex flex-col gap-2.5 pt-3.5">
      {/* ── Quick tour ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[12px] p-3.5 flex flex-col gap-2.5"
        style={{ background: "linear-gradient(135deg, #10365C 0%, #0A6DC0 130%)" }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-0 w-[42px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.20) 50%, rgba(255,255,255,0) 100%)",
            animation: "vcSheen 4.2s cubic-bezier(.4,0,.2,1) infinite",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <span className="relative w-[30px] h-[30px] rounded-full bg-white/[.16] inline-flex items-center justify-center shrink-0">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-[1.5px] border-white/[.55]"
              style={{ animation: "vcRing 2.4s cubic-bezier(.4,0,.2,1) infinite" }}
            />
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" />
            </svg>
          </span>
          <span className="font-clash font-semibold text-[14px] text-white tracking-[-.2px]">
            Start a quick tour
          </span>
        </div>

        <span className="relative text-[12.5px] text-white/[.78] leading-[1.4]">
          {tourStops} stops · about 2 minutes
        </span>

        <div className="relative flex gap-1" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="flex-1 h-1 rounded-sm bg-white"
              style={{ animation: `vcStep 3s ease-in-out ${i * 0.3}s infinite` }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={openTourWelcome}
          className="relative bg-white text-[#0A2540] border-none rounded-lg px-3.5 py-[9px] font-semibold text-[13px] cursor-pointer self-start hover:bg-[#EAF2FB]"
        >
          Take The Tour
        </button>
      </div>

      {/* ── Vendcliq AI ────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[12px] p-3.5 flex flex-col gap-2.5 border border-white/[.12]"
        style={{
          background:
            "linear-gradient(135deg, #0A2540 0%, #123F6B 60%, #0A6DC0 150%)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -top-10 -right-[30px] w-[130px] h-[130px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(76,135,235,.6) 0%, rgba(76,135,235,0) 70%)",
            animation: "vcGlow 5s ease-in-out infinite",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <span className="relative w-[30px] h-[30px] rounded-full bg-white/[.14] inline-flex items-center justify-center shrink-0">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-[1.5px] border-[#FAC136]/50"
              style={{ animation: "vcRing 3s cubic-bezier(.4,0,.2,1) infinite" }}
            />
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="#FAC136"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "vcFloat 4.5s ease-in-out infinite" }}
              aria-hidden="true"
            >
              <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
            </svg>
          </span>
          <span className="font-clash font-semibold text-[14px] text-white tracking-[-.2px]">
            Chat with Vendcliq AI
          </span>
          <span className="inline-flex gap-[3px] items-end" aria-hidden="true">
            {[0, 0.18, 0.36].map((delay) => (
              <span
                key={delay}
                className="w-1 h-1 rounded-sm bg-[#FAC136]"
                style={{ animation: `vcDot 1.4s ease-in-out ${delay}s infinite` }}
              />
            ))}
          </span>
        </div>

        <span className="relative text-[12.5px] text-white/[.78] leading-[1.4]">
          {onAccount
            ? "Ask about your wallet, spending or credit — answers in plain words, any time."
            : "Ask about your stock, sales or suppliers — answers in plain words, any time."}
        </span>

        <button
          type="button"
          onClick={openChat}
          className="relative bg-white/[.14] text-white border border-white/[.24] rounded-lg px-3.5 py-[9px] font-semibold text-[13px] cursor-pointer self-start inline-flex items-center gap-2 hover:bg-white/[.24]"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5.2A8 8 0 1 1 21 12Z" />
          </svg>
          <span>Start Chat</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarPromos;
