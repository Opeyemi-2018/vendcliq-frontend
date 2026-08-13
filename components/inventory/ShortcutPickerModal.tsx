"use client";

import React from "react";
import { toast } from "sonner";
import { VcIcon } from "./VcIcon";
import type { QuickAction } from "@/components/QuickActionsStrip";

export const MAX_PINS = 6;

interface ShortcutPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Full catalogue for this surface. */
  actions: QuickAction[];
  pinnedIds: string[];
  onChange: (next: string[]) => void;
  onReset: () => void;
}

/**
 * Pin/unpin drawer for the Quick actions strip — max 6, min 1, per surface.
 */
export const ShortcutPickerModal = ({
  open,
  onClose,
  actions,
  pinnedIds,
  onChange,
  onReset,
}: ShortcutPickerModalProps) => {
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

  const toggle = (id: string) => {
    if (pinnedIds.includes(id)) {
      if (pinnedIds.length === 1) {
        toast("Keep at least one shortcut");
        return;
      }
      onChange(pinnedIds.filter((x) => x !== id));
      return;
    }
    if (pinnedIds.length >= MAX_PINS) {
      toast(`You can pin ${MAX_PINS} shortcuts — remove one first`);
      return;
    }
    onChange([...pinnedIds, id]);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 font-dm-sans">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(10,37,64,.42)]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit shortcuts"
        className="relative w-[560px] max-w-full max-h-[86vh] bg-white rounded-[22px] shadow-[0_26px_60px_-18px_rgba(10,37,64,.5)] flex flex-col overflow-hidden"
      >
        <header className="px-6 pt-[22px] pb-[18px] flex items-start gap-[14px] border-b border-[#D8D8D880]">
          <span className="w-[46px] h-[46px] rounded-[14px] bg-[#E1EEFF] inline-flex items-center justify-center shrink-0">
            <VcIcon name="pencil" size={24} stroke="#0A6DC0" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-clash font-bold text-[22px] tracking-[-.4px] text-[#2F2F2F]">
              Edit shortcuts
            </div>
            <div className="text-[13px] text-[#8E8E93] mt-[3px]">
              Pin the {MAX_PINS} actions you use most. Tap to add or remove.
            </div>
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

        <div className="px-6 pt-[14px] pb-1.5 flex items-center gap-2.5">
          <span className="text-[12.5px] font-bold text-[#0A6DC0]">
            {pinnedIds.length} of {MAX_PINS} pinned
          </span>
          <div className="flex-1 flex gap-1">
            {Array.from({ length: MAX_PINS }).map((_, i) => (
              <span
                key={i}
                className="flex-1 h-[5px] rounded-[3px]"
                style={{
                  background: i < pinnedIds.length ? "#0A6DC0" : "#E7E9ED",
                }}
              />
            ))}
          </div>
        </div>

        <div
          data-tour="shortcut-picker"
          className="px-6 pt-2 pb-[18px] overflow-auto flex flex-col gap-2"
        >
          {actions.map((action) => {
            const picked = pinnedIds.includes(action.id);
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => toggle(action.id)}
                className="flex items-center gap-[14px] w-full box-border text-left cursor-pointer px-[14px] py-3 rounded-[14px] border hover:border-[#0A6DC0]"
                style={{
                  borderColor: picked ? "#0A6DC0" : "rgba(216,216,216,.8)",
                  background: picked ? "#F0F7FF" : "#fff",
                }}
              >
                <span
                  className="w-10 h-10 rounded-[12px] inline-flex items-center justify-center shrink-0"
                  style={{ background: action.bg }}
                >
                  <VcIcon name={action.icon} size={21} stroke={action.fg} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[14.5px] text-[#2F2F2F] tracking-[-.2px]">
                    {action.label}
                  </span>
                  <span className="block text-[12px] text-[#8E8E93] mt-0.5">
                    {action.sub}
                  </span>
                </span>
                {picked ? (
                  <span className="w-[26px] h-[26px] rounded-full bg-[#0A6DC0] inline-flex items-center justify-center shrink-0">
                    <VcIcon name="check" size={15} stroke="#fff" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="w-[26px] h-[26px] rounded-full border-[1.5px] border-[#D8D8D8F2] inline-flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#8E8E93" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <footer className="px-6 pt-[14px] pb-5 border-t border-[#D8D8D880] flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onReset();
              toast("Shortcuts reset to default");
            }}
            className="border-none bg-transparent cursor-pointer text-[13px] font-semibold text-[#6B6B70] py-2 hover:text-[#0A6DC0]"
          >
            Reset to default
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="h-[46px] px-7 border-none rounded-[12px] bg-[#0A6DC0] text-white font-bold text-[15px] cursor-pointer hover:bg-[#09599A]"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ShortcutPickerModal;
