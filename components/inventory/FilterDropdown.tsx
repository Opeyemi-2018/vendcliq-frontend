"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { VcIcon } from "./VcIcon";

export interface FilterOption {
  id: string;
  label: string;
}

interface FilterDropdownProps {
  /** "hero" sits on the blue gradient; "plain" sits on the page background. */
  variant: "hero" | "plain";
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  buttonLabel: string;
  icon: React.ReactNode;
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Menu alignment relative to the trigger. */
  align?: "left" | "right";
  width?: number;
  children?: React.ReactNode;
  "data-tour"?: string;
}

export const FilterDropdown = ({
  variant,
  open,
  onToggle,
  onClose,
  buttonLabel,
  icon,
  options,
  selectedId,
  onSelect,
  align = "left",
  width = 250,
  children,
  ...rest
}: FilterDropdownProps) => {
  const trigger =
    variant === "hero"
      ? "inline-flex items-center gap-[9px] h-[38px] px-[15px] rounded-full border border-white/30 bg-white/15 text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-white/[.26]"
      : "inline-flex items-center gap-[9px] h-[42px] px-4 rounded-[10px] border border-[#D8D8D8E6] bg-white text-[#2F2F2F] text-[14px] font-semibold cursor-pointer whitespace-nowrap hover:border-[#0A6DC0] hover:text-[#0A6DC0]";

  return (
    <div className="relative" {...rest}>
      <button type="button" onClick={onToggle} className={trigger}>
        {icon}
        <span>{buttonLabel}</span>
        <VcIcon
          name="chevronDown"
          size={15}
          stroke={variant === "hero" ? "#fff" : "currentColor"}
          strokeWidth={2.4}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <div
            className={cn(
              "absolute z-40 bg-white rounded-[16px] shadow-[0_20px_44px_-16px_rgba(10,37,64,.45)] p-2 text-[#2F2F2F] max-h-[300px] overflow-y-auto",
              variant === "hero" ? "top-[46px]" : "top-[48px]",
              align === "right" ? "right-0" : "left-0",
            )}
            style={{ width }}
          >
            {options.map((option) => {
              const active = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    "w-full box-border flex items-center gap-[10px] border-none cursor-pointer text-[14px] text-left px-3 py-[11px] rounded-[10px]",
                    active
                      ? "bg-[#F1F7FF] text-[#0A6DC0] font-bold"
                      : "bg-transparent text-[#2F2F2F] font-medium hover:bg-[#F4F5F7]",
                  )}
                >
                  <span className="flex-1">{option.label}</span>
                  {active && (
                    <VcIcon
                      name="check"
                      size={16}
                      stroke="#0A6DC0"
                      strokeWidth={2.6}
                    />
                  )}
                </button>
              );
            })}
            {children}
          </div>
        </>
      )}
    </div>
  );
};

/** The From/To pair revealed when "Custom date range" is picked. */
export const CustomRangeInputs = ({
  from,
  to,
  onFrom,
  onTo,
}: {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) => (
  <div className="mt-1.5 pt-[13px] px-3 pb-1 border-t border-[#D8D8D899] flex gap-[10px]">
    {[
      { label: "From", value: from, set: onFrom },
      { label: "To", value: to, set: onTo },
    ].map((field) => (
      <label
        key={field.label}
        className="flex flex-col gap-[5px] flex-1 min-w-0"
      >
        <span className="text-[10.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93]">
          {field.label}
        </span>
        <input
          type="date"
          value={field.value}
          onChange={(e) => field.set(e.target.value)}
          className="box-border w-full border border-[#D8D8D8E6] bg-white text-[#2F2F2F] rounded-[10px] px-[10px] py-[9px] text-[13px] outline-none"
        />
      </label>
    ))}
  </div>
);

export default FilterDropdown;
