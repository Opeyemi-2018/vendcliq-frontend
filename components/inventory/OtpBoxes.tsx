"use client";

import React, { useRef } from "react";

interface OtpBoxesProps {
  value: string[];
  onChange: (next: string[]) => void;
  /** 4–6, driven by the code the API issues. */
  length?: number;
  error?: boolean;
  disabled?: boolean;
  onComplete?: (code: string) => void;
}

/**
 * Digit boxes for the hand-over code. Supports paste across boxes, Backspace
 * stepping back, and arrow-key movement — the previous implementation handled
 * only single-digit typing.
 */
export const OtpBoxes = ({
  value,
  onChange,
  length = 4,
  error = false,
  disabled = false,
  onComplete,
}: OtpBoxesProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => {
    onChange(next);
    const code = next.join("");
    if (code.length === length && !next.includes("")) onComplete?.(code);
  };

  const setDigit = (index: number, digit: string) => {
    const next = [...value];
    next[index] = digit;
    commit(next);
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setDigit(index, "");
      return;
    }
    // Typing over a filled box, or a mobile keyboard delivering several
    // characters at once, spills into the following boxes.
    if (digits.length > 1) {
      const next = [...value];
      for (let i = 0; i < digits.length && index + i < length; i++) {
        next[index + i] = digits[i];
      }
      commit(next);
      refs.current[Math.min(index + digits.length, length - 1)]?.focus();
      return;
    }
    setDigit(index, digits);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        setDigit(index, "");
        return;
      }
      if (index > 0) {
        const next = [...value];
        next[index - 1] = "";
        commit(next);
        refs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1)
      refs.current[index + 1]?.focus();
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    const next = [...value];
    for (let i = 0; i < digits.length && index + i < length; i++) {
      next[index + i] = digits[i];
    }
    commit(next);
    refs.current[Math.min(index + digits.length, length - 1)]?.focus();
  };

  return (
    <div
      className={`flex gap-3 flex-wrap ${error ? "animate-[vcShake_.45s_cubic-bezier(.4,0,.2,1)]" : ""}`}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={value[index] ?? ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={2}
          disabled={disabled}
          aria-label={`Code digit ${index + 1}`}
          aria-invalid={error}
          className="w-16 h-16 box-border text-center font-clash font-semibold text-[26px] text-[#2F2F2F] bg-[#F4F5F7] rounded-[12px] outline-none caret-[#0A6DC0] border-[1.6px] focus:bg-white focus:border-[#0A6DC0] focus:shadow-[0_0_0_4px_rgba(10,109,192,.12)] disabled:opacity-60"
          style={{
            borderColor: error
              ? "#E5A3A0"
              : value[index]
                ? "#0A6DC0"
                : "rgba(216,216,216,.9)",
          }}
        />
      ))}
    </div>
  );
};

export default OtpBoxes;
