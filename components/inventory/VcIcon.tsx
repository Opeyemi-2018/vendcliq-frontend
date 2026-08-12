import React from "react";

/**
 * Stroke-path icon set lifted verbatim from the Overview Refresh prototype
 * (`IC` map). Keeping the exact path data means the app renders the same
 * glyphs the design was drawn with.
 */
export const IC = {
  box: ["M21 8 12 3 3 8v8l9 5 9-5V8Z", "m3 8 9 5 9-5", "M12 13v8"],
  shop: ["M4 9h16v11H4z", "m3 9 1.6-5h14.8L21 9", "M9 20v-6h6v6"],
  note: ["M5 3h14v18l-3-1.6L13 21l-3-1.6L7 21l-2-1.6V3Z", "M9 8h6", "M9 12h6"],
  people: [
    "M15 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20",
    "M12 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0",
    "M22 20v-1.5a4 4 0 0 0-3-3.87",
  ],
  chart: ["M4 20V11", "M10 20V4", "M16 20v-6", "M22 20H2"],
  naira: [
    "M12 3v18",
    "M16.5 7.5A3.5 3.5 0 0 0 13 5h-2a3 3 0 0 0 0 6h2.5a3 3 0 0 1 0 6H11a3.5 3.5 0 0 1-3.5-2.5",
  ],
  truck: [
    "M3 6h11v10H3z",
    "M14 9h3.6l3.4 3.4V16h-7z",
    "M7 16.7a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6",
    "M17.5 16.7a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6",
  ],
  building: [
    "M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16",
    "M15 9h3a2 2 0 0 1 2 2v10",
    "M2 21h20",
  ],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 8v4.5l3 2"],
  cart: [
    "M3 5h2.3l2.2 10.6h9.7L20 8H6.2",
    "M9.6 20.3a1.35 1.35 0 1 0 0-2.7 1.35 1.35 0 0 0 0 2.7",
    "M17.2 20.3a1.35 1.35 0 1 0 0-2.7 1.35 1.35 0 0 0 0 2.7",
  ],
  calendar: ["M4 10h16", "M8 3v4", "M16 3v4"],
  chevron: ["m9 6 6 6-6 6"],
  chevronDown: ["m6 9 6 6 6-6"],
  check: ["m4 12.5 5 5L20 6.5"],
  pencil: ["M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z"],
  bag: [
    "M4 7h16l-1.4 12.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 7Z",
    "M8.5 7V5.5a3.5 3.5 0 0 1 7 0V7",
  ],
  globe: ["M3 12h18", "M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"],
  card: [
    "M3 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z",
    "M16 12h5v4h-5a2 2 0 0 1 0-4Z",
  ],
  storefront: ["M4 9h16v11H4z", "m3 9 1.6-5h14.8L21 9", "M9.5 20v-5.5h5V20"],
  tiles: [],
  list: ["M4 6h16", "M4 12h16", "M4 18h16"],
  arrowUp: ["M12 19V5", "m5 12 7-7 7 7"],
  arrowDown: ["M12 5v14", "m5 12 7 7 7-7"],
  bottle: [
    "M10 2h4v3.2l1.4 2.6V20a2 2 0 0 1-2 2h-2.8a2 2 0 0 1-2-2V7.8L10 5.2V2Z",
    "M8.6 12h6.8",
  ],
  person: [
    "M19 20v-1.5a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4V20",
    "M15.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0",
  ],
  copy: ["M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"],
  warning: ["M12 4 2.5 20h19L12 4Z", "M12 10v4", "M12 17h.01"],
  send: ["M7 17 17 7", "M8 7h9v9"],
  sim: ["M4 5h16v14H4z", "M4 10h16", "M9 5v14"],
  wallet: ["M4 6h16v13H4z", "M4 10h16", "M8 15h4"],
  shield: ["M5 3h14v18l-3-1.6L13 21l-3-1.6L7 21l-2-1.6V3Z", "M9.5 11.5 11 13l4-4"],
  plus: ["M12 5v14", "M5 12h14"],
  bolt: ["M13 2 4 14h7l-1 8 9-12h-7l1-8Z"],
  arrowIn: ["M17 7 7 17", "M16 17H7V8"],
  arrowOut: ["M7 17 17 7", "M8 7h9v9"],
} as const;

export type IconName = keyof typeof IC;

interface VcIconProps {
  name: IconName;
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  className?: string;
}

export const VcIcon = ({
  name,
  size = 22,
  stroke = "currentColor",
  strokeWidth = 2,
  className,
}: VcIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {name === "globe" && <circle cx="12" cy="12" r="9" />}
    {name === "copy" && <rect x="9" y="9" width="11" height="11" rx="2" />}
    {IC[name].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);

/** The four-square "Tiles" glyph, which needs rects rather than paths. */
export const TilesIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);

/** Calendar glyph (rect + paths). */
export const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="#fff"
    strokeWidth={1.9}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M4 10h16" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </svg>
);

export default VcIcon;
