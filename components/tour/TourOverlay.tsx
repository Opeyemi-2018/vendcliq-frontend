"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { TOUR_STEPS, TOUR_HIGHLIGHTS, TOUR_WELCOME } from "@/lib/tour/steps";
import {
  backStep,
  beginTour,
  endTour,
  hasSeenTour,
  nextSection,
  nextStep,
  openTourWelcome,
  useTour,
} from "@/lib/tour/store";

const RING_PAD = 8;
const CARD_W = 372;
const GAP = 16;

/** First visible element carrying this key — a target can appear more than once. */
const findTarget = (key: string): HTMLElement | null => {
  const all = document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`);
  for (const el of all) if (el.getClientRects().length) return el;
  return all[0] ?? null;
};

/** Bring the target into view inside whatever scroller owns it. */
const scrollIntoView = (el: HTMLElement) => {
  el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
};

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TourOverlay = () => {
  const { phase, index } = useTour();
  const router = useRouter();
  const pathname = usePathname();
  const [rect, setRect] = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const [more, setMore] = useState({ up: false, down: false });
  const routedFor = useRef<number | null>(null);
  const openedPanel = useRef<string | null>(null);

  const step = TOUR_STEPS[index] ?? null;
  const total = TOUR_STEPS.length;
  // "Next feature" only earns its place while stops remain in this one.
  const moreInSection = Boolean(
    step && step.indexInSection < step.sectionSize - 1,
  );

  useEffect(() => setMounted(true), []);

  // Whether the highlight list runs past its box, so the card can say so.
  const measureList = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setMore({
      up: el.scrollTop > 4,
      down: el.scrollTop + el.clientHeight < el.scrollHeight - 4,
    });
  }, []);

  useEffect(() => {
    if (phase !== "welcome") return;
    // The list mounts with the card, so measure once it has laid out.
    const timer = setTimeout(measureList, 60);
    window.addEventListener("resize", measureList);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureList);
    };
  }, [phase, measureList]);

  // First login shows the welcome card once; after that only the sidebar card
  // can bring it back.
  useEffect(() => {
    if (!mounted) return;
    if (!hasSeenTour()) openTourWelcome();
  }, [mounted]);

  // Route to where the stop lives, then ask its host to open any panel it needs.
  useEffect(() => {
    if (phase !== "run" || !step) return;
    if (routedFor.current === index) return;
    routedFor.current = index;

    // A panel opened for an earlier stop would sit over everything that
    // follows, so it is closed the moment the tour leaves it.
    if (openedPanel.current && openedPanel.current !== step.open) {
      window.dispatchEvent(
        new CustomEvent(`vc:tour-close-${openedPanel.current}`),
      );
      openedPanel.current = null;
    }

    if (step.route && pathname !== step.route) router.push(step.route);
    if (step.open) {
      openedPanel.current = step.open;
      // Give the route a beat to mount before the host can act on this.
      const timer = setTimeout(
        () =>
          window.dispatchEvent(new CustomEvent(`vc:tour-open-${step.open}`)),
        step.route && pathname !== step.route ? 700 : 60,
      );
      return () => clearTimeout(timer);
    }
  }, [phase, index, step, pathname, router]);

  useEffect(() => {
    if (phase === "run") return;
    routedFor.current = null;
    if (openedPanel.current) {
      window.dispatchEvent(
        new CustomEvent(`vc:tour-close-${openedPanel.current}`),
      );
      openedPanel.current = null;
    }
  }, [phase]);

  // Poll briefly for the target: a route change or a panel opening means it is
  // not in the DOM the moment the stop starts.
  const measure = useCallback(() => {
    if (!step) return null;
    const el = findTarget(step.target);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return null;
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  }, [step]);

  useEffect(() => {
    if (phase !== "run" || !step) {
      setRect(null);
      return;
    }

    let tries = 0;
    let scrolled = false;
    setRect(null);

    const tick = () => {
      const el = findTarget(step.target);
      if (el && !scrolled) {
        scrolled = true;
        scrollIntoView(el);
      }
      const next = measure();
      if (next) setRect(next);
      tries += 1;
    };

    tick();
    const interval = setInterval(() => {
      tick();
      if (tries > 40) clearInterval(interval); // ~6s, then give up and centre
    }, 150);

    const onMove = () => {
      const next = measure();
      if (next) setRect(next);
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [phase, index, step, measure]);

  // Escape skips, per the spec.
  useEffect(() => {
    if (phase === "idle") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") endTour();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase]);

  // Stops marked `advance` move on when the user really clicks the thing.
  useEffect(() => {
    if (phase !== "run" || !step?.advance) return;
    const onClick = (e: MouseEvent) => {
      const all = document.querySelectorAll<HTMLElement>(
        `[data-tour="${step.target}"]`,
      );
      for (const el of all) {
        if (el.contains(e.target as Node)) {
          setTimeout(nextStep, 320);
          return;
        }
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [phase, step]);

  const scrollList = (direction: 1 | -1) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({
      top: direction * Math.max(120, el.clientHeight * 0.7),
      behavior: "smooth",
    });
  };

  if (!mounted || phase === "idle") return null;

  // ── Welcome ──────────────────────────────────────────────────────────
  if (phase === "welcome") {
    return createPortal(
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-5 sm:p-6 font-dm-sans">
        <div
          onClick={endTour}
          className="absolute inset-0 bg-[rgba(10,37,64,.64)]"
        />
        <div className="relative w-full max-w-[528px] max-h-[70vh] bg-white rounded-[22px] shadow-[0_30px_70px_-22px_rgba(10,37,64,.55)] flex flex-col overflow-hidden">
          <div className="shrink-0 px-7 sm:px-8 pt-[26px]">
            <div className="flex items-center gap-3">
              <Image
                src="/brandmark.png"
                alt="Vendcliq"
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-[11.5px] font-bold tracking-[.8px] uppercase text-[#0A6DC0]">
                What&apos;s new
              </span>
            </div>

            <h2 className="mt-5 font-clash font-semibold text-[24px] sm:text-[29px] leading-[1.14] tracking-[-.8px] text-[#2F2F2F]">
              {TOUR_WELCOME.title}
            </h2>
            <p className="mt-[11px] text-[15px] leading-[1.5] text-[#6B6B70]">
              {TOUR_WELCOME.intro}
            </p>
          </div>

          <div className="relative flex flex-col min-h-0 flex-1 overflow-hidden mt-4 mb-1">
            <ol
              ref={listRef}
              onScroll={measureList}
              className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 px-7 sm:px-8 list-none py-0"
            >
              {TOUR_HIGHLIGHTS.map((label, i) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="w-[22px] h-[22px] rounded-full bg-[#FFF3DB] text-[#85540A] text-[12px] font-bold inline-flex items-center justify-center shrink-0 mt-[1px]">
                    {i + 1}
                  </span>
                  <span className="text-[14px] leading-[1.45] text-[#2F2F2F]">
                    {label}
                  </span>
                </li>
              ))}
            </ol>

            {/* Fades plus a chevron, so it is obvious the list keeps going. */}
            {more.up && (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 inset-x-0 h-7 bg-gradient-to-b from-white to-transparent"
                />
                <button
                  type="button"
                  aria-label="Scroll up"
                  onClick={() => scrollList(-1)}
                  className="absolute top-0 right-3 w-7 h-7 rounded-full bg-white border border-[#E4E4E4] shadow-sm inline-flex items-center justify-center cursor-pointer text-[#0A6DC0] hover:bg-[#F0F7FF]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                </button>
              </>
            )}
            {more.down && (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-white to-transparent"
                />
                <button
                  type="button"
                  aria-label="Scroll down for more"
                  onClick={() => scrollList(1)}
                  className="absolute bottom-1 right-3 h-7 pl-2.5 pr-2 rounded-full bg-[#0A6DC0] text-white text-[11.5px] font-bold shadow-sm inline-flex items-center gap-1 cursor-pointer hover:bg-[#09599A]"
                >
                  <span>More</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Sticky footer: the actions stay reachable however long the list. */}
          <div className="shrink-0 px-7 sm:px-8 pt-3.5 pb-6 border-t border-[#EEF1F4] bg-white">
            <p className="text-[14px] leading-[1.5] font-semibold text-[#2F2F2F]">
              {TOUR_WELCOME.closing}
            </p>
            <div className="flex items-center gap-3 mt-3.5 flex-wrap">
              <button
                type="button"
                onClick={beginTour}
                className="h-[52px] px-6 border-none rounded-[12px] bg-[#0A6DC0] text-white text-[15.5px] font-bold cursor-pointer inline-flex items-center gap-2.5 hover:bg-[#09599A]"
              >
                <span>Take The Tour</span>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={endTour}
                className="h-[52px] px-5 border border-[#D8D8D8E6] rounded-[12px] bg-white text-[#2F2F2F] text-[15px] font-semibold cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              >
                Not Now
              </button>
              <span className="text-[12.5px] text-[#8E8E93] ml-auto">
                {total} stops · about 2 minutes
              </span>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  // ── Finished ─────────────────────────────────────────────────────────
  if (phase === "end") {
    return createPortal(
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-6 font-dm-sans">
        <div
          onClick={endTour}
          className="absolute inset-0 bg-[rgba(10,37,64,.64)]"
        />
        <div className="relative w-full max-w-[460px] bg-white rounded-[22px] px-8 pt-[30px] pb-[26px] shadow-[0_30px_70px_-22px_rgba(10,37,64,.55)]">
          <div className="w-14 h-14 rounded-[16px] bg-[#E7F4EB] inline-flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              width="30"
              height="30"
              fill="none"
              stroke="#00681B"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m4 12.5 5 5L20 6.5" />
            </svg>
          </div>
          <h2 className="mt-5 font-clash font-semibold text-[26px] leading-[1.15] tracking-[-.6px] text-[#2F2F2F]">
            That&apos;s The Tour
          </h2>
          <p className="mt-2.5 text-[14.5px] leading-[1.5] text-[#6B6B70]">
            Your wallet, your sales and your store all take fewer taps now.
            Start a quick tour from the sidebar any time to run it again.
          </p>
          <button
            type="button"
            onClick={endTour}
            className="mt-6 w-full h-[52px] rounded-[12px] border-none bg-[#0A6DC0] text-white text-[15.5px] font-bold cursor-pointer hover:bg-[#09599A]"
          >
            Done
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  // ── Running ──────────────────────────────────────────────────────────
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const hx = rect ? Math.max(4, rect.left - RING_PAD) : 0;
  const hy = rect ? Math.max(4, rect.top - RING_PAD) : 0;
  const hw = rect ? Math.min(vw - hx - 4, rect.width + RING_PAD * 2) : 0;
  const hh = rect ? Math.min(vh - hy - 4, rect.height + RING_PAD * 2) : 0;

  const cw = Math.min(CARD_W, vw - 32);
  const estH = 232 + (step?.prompt ? 58 : 0);
  const clampX = (v: number) => Math.max(16, Math.min(vw - cw - 16, v));

  let cTop: number;
  let cLeft = (vw - cw) / 2;
  let arrow: "up" | "down" | null = null;

  if (!rect) {
    cTop = Math.max(16, (vh - estH) / 2);
  } else {
    const mid = Math.max(16, Math.min(vh - estH - 16, hy + hh / 2 - estH / 2));
    if (hy + hh + GAP + estH < vh - 12) {
      cTop = hy + hh + GAP;
      cLeft = clampX(hx + hw / 2 - cw / 2);
      arrow = "up";
    } else if (hy - GAP - estH > 12) {
      cTop = hy - GAP - estH;
      cLeft = clampX(hx + hw / 2 - cw / 2);
      arrow = "down";
    } else if (vw - (hx + hw) > cw + GAP * 2) {
      cTop = mid;
      cLeft = hx + hw + GAP;
    } else if (hx > cw + GAP * 2) {
      cTop = mid;
      cLeft = hx - cw - GAP;
    } else {
      cTop = Math.max(16, vh - estH - 20);
      cLeft = clampX(hx + hw / 2 - cw / 2);
    }
  }

  const aLeft = rect ? Math.max(26, Math.min(cw - 26, hx + hw / 2 - cLeft)) : 0;

  const veil: React.CSSProperties = {
    position: "fixed",
    background: "rgba(10,37,64,.55)",
    pointerEvents: "auto",
    transition: "all 220ms cubic-bezier(.4,0,.2,1)",
  };

  return createPortal(
    <div className="fixed inset-0 z-[95] pointer-events-none font-dm-sans">
      {/* Four scrims leave the target itself clickable. */}
      {rect ? (
        <>
          <div style={{ ...veil, top: 0, left: 0, width: vw, height: hy }} />
          <div
            style={{
              ...veil,
              top: hy + hh,
              left: 0,
              width: vw,
              height: Math.max(0, vh - hy - hh),
            }}
          />
          <div style={{ ...veil, top: hy, left: 0, width: hx, height: hh }} />
          <div
            style={{
              ...veil,
              top: hy,
              left: hx + hw,
              width: Math.max(0, vw - hx - hw),
              height: hh,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: hy,
              left: hx,
              width: hw,
              height: hh,
              borderRadius: 14,
              border: "2.5px solid #FAC136",
              pointerEvents: "none",
              animation: "vcTourRing 1.9s ease-in-out infinite",
              transition: "all 220ms cubic-bezier(.4,0,.2,1)",
            }}
          />
        </>
      ) : (
        <div style={{ ...veil, inset: 0 }} />
      )}

      <div
        style={{
          position: "fixed",
          top: cTop,
          left: cLeft,
          width: cw,
          pointerEvents: "auto",
          transition:
            "top 220ms cubic-bezier(.4,0,.2,1), left 220ms cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div className="relative bg-white border border-[#D8D8D88C] rounded-[18px] px-5 pt-[17px] pb-4 shadow-[0_24px_54px_-18px_rgba(10,37,64,.5)]">
          {rect && arrow && (
            <div
              style={{
                position: "absolute",
                left: aLeft - 6.5,
                width: 13,
                height: 13,
                background: "#fff",
                transform: "rotate(45deg)",
                borderRadius: 2,
                top: arrow === "up" ? -7 : "auto",
                bottom: arrow === "down" ? -7 : "auto",
                borderLeft:
                  arrow === "up" ? "1px solid rgba(216,216,216,.55)" : "none",
                borderTop:
                  arrow === "up" ? "1px solid rgba(216,216,216,.55)" : "none",
                borderRight:
                  arrow === "down" ? "1px solid rgba(216,216,216,.55)" : "none",
                borderBottom:
                  arrow === "down" ? "1px solid rgba(216,216,216,.55)" : "none",
              }}
            />
          )}

          <div className="relative flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold tracking-[.8px] uppercase text-[#0A6DC0] truncate">
              {step?.sectionLabel} · {(step?.indexInSection ?? 0) + 1} of{" "}
              {step?.sectionSize}
            </span>
            <button
              type="button"
              onClick={endTour}
              className="border-none bg-transparent p-0 cursor-pointer text-[12.5px] font-semibold text-[#8E8E93] hover:text-[#2F2F2F]"
            >
              Skip tour
            </button>
          </div>

          <div className="relative h-[3px] rounded-sm bg-[#EEF1F4] mt-[11px] overflow-hidden">
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${((index + 1) / total) * 100}%`,
                background: "#0A6DC0",
                borderRadius: 2,
                transition: "width 240ms cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>

          <h3 className="relative mt-3.5 font-clash font-semibold text-[19.5px] leading-[1.18] tracking-[-.45px] text-[#2F2F2F]">
            {step?.title}
          </h3>
          <p className="relative mt-2 text-[13.5px] leading-[1.5] text-[#6B6B70]">
            {step?.body}
          </p>

          {step?.prompt && (
            <div className="relative flex items-start gap-[9px] mt-3.5 px-3 py-2.5 rounded-[11px] bg-[#FFF3DB]">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="#85540A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-px"
              >
                <path d="M9 4.5v9.2l2.4-2 1.8 4.6 2.1-.9-1.8-4.5 3-.5z" />
                <path d="M17.5 4.5A6.5 6.5 0 0 1 19 8.6" />
                <path d="M3.5 8.6A6.5 6.5 0 0 1 5 4.5" />
              </svg>
              <span className="text-[12.5px] font-semibold leading-[1.4] text-[#85540A]">
                {step.prompt}
              </span>
            </div>
          )}

          <div className="relative flex items-center gap-2.5 mt-[17px]">
            {index > 0 && (
              <button
                type="button"
                onClick={backStep}
                className="h-[42px] px-4 border border-[#D8D8D8E6] rounded-[11px] bg-white text-[#2F2F2F] text-[14px] font-semibold cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              >
                Back
              </button>
            )}
            <div className="flex-1" />
            {moreInSection && (
              <button
                type="button"
                onClick={nextSection}
                className="h-[42px] px-3.5 border border-[#D8D8D8E6] rounded-[11px] bg-white text-[#2F2F2F] text-[13.5px] font-semibold cursor-pointer whitespace-nowrap hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              >
                Next feature
              </button>
            )}
            <button
              type="button"
              onClick={nextStep}
              className="h-[42px] px-5 border-none rounded-[11px] bg-[#0A6DC0] text-white text-[14.5px] font-bold cursor-pointer inline-flex items-center gap-2 hover:bg-[#09599A]"
            >
              <span>{index === total - 1 ? "Finish" : "Next"}</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TourOverlay;
