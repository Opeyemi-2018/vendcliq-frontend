"use client";

import { useRouter } from "next/navigation";
import { VcIcon } from "./VcIcon";

interface BackButtonProps {
  /** Where to go. Defaults to the previous page. */
  href?: string;
  className?: string;
}

/**
 * The single back control for the refreshed screens. Square, bordered, 42px on
 * desktop and 40px on a phone so it clears the 44px tap guidance with its
 * surrounding space.
 */
export const BackButton = ({ href, className = "" }: BackButtonProps) => {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => (href ? router.push(href) : router.back())}
      className={`w-10 h-10 sm:w-[42px] sm:h-[42px] rounded-[12px] border border-[#D8D8D8E6] bg-white cursor-pointer inline-flex items-center justify-center shrink-0 hover:border-[#0A6DC0] ${className}`}
    >
      <VcIcon
        name="chevron"
        size={19}
        stroke="#2F2F2F"
        strokeWidth={2.2}
        className="rotate-180"
      />
    </button>
  );
};

export default BackButton;
