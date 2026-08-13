import React from "react";

/**
 * Sidebar glyphs taken from the Overview Refresh prototype's nav. They mirror
 * the lucide call signature (style / className / strokeWidth) so they drop into
 * the existing `<item.icon />` render sites unchanged.
 */
export interface NavIconProps {
  style?: React.CSSProperties;
  className?: string;
  strokeWidth?: number;
}

const base = (
  paths: React.ReactNode,
  { style, className, strokeWidth = 2 }: NavIconProps,
) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    className={className}
    aria-hidden="true"
  >
    {paths}
  </svg>
);

/** Account — house. */
export const NavAccount = (props: NavIconProps) =>
  base(<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z" />, props);

/** Inventory — open ledger. */
export const NavInventory = (props: NavIconProps) =>
  base(
    <>
      <path d="M4 4h13a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z" />
      <path d="M4 17a3 3 0 0 1 3-3h13" />
    </>,
    props,
  );

/** Market Place — shopfront awning. */
export const NavMarket = (props: NavIconProps) =>
  base(
    <>
      <path d="M4 9h16v11H4z" />
      <path d="m3 9 1.6-5h14.8L21 9" />
    </>,
    props,
  );

/** Enterprise — building. */
export const NavEnterprise = (props: NavIconProps) =>
  base(
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" />
      <path d="M15 9h3a2 2 0 0 1 2 2v10" />
      <path d="M2 21h20" />
    </>,
    props,
  );

/** More — two rules. */
export const NavMore = (props: NavIconProps) =>
  base(
    <>
      <path d="M4 8h16" />
      <path d="M4 16h16" />
    </>,
    props,
  );
