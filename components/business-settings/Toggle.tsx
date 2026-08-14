"use client";

import React from "react";

interface ToggleProps {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
  /** Larger track, used by the store preference rows. */
  size?: "sm" | "md";
  disabled?: boolean;
}

/** The prototype's pill switch — a plain button, no Radix. */
export const Toggle = ({
  on,
  onChange,
  label,
  size = "sm",
  disabled = false,
}: ToggleProps) => {
  const track = size === "md" ? "w-[52px] h-[30px]" : "w-[50px] h-[28px]";
  const knob = size === "md" ? "w-6 h-6" : "w-[22px] h-[22px]";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`${track} rounded-full border-none p-[3px] inline-flex items-center shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        on ? "bg-[#0A6DC0] justify-end" : "bg-[#C7CBD1] justify-start"
      } ${disabled ? "" : "cursor-pointer"}`}
    >
      <span className={`${knob} rounded-full bg-white block`} />
    </button>
  );
};

export default Toggle;
