/**
 * The guided tour, grouped into features. Next walks the stops inside a
 * feature; Next feature skips the rest and jumps to the following one.
 */

export interface TourStep {
  /** Matches a `data-tour="…"` attribute somewhere in the app. */
  target: string;
  /** Route to be on before the target is looked for. */
  route?: string;
  /** Panel a host page opens for this stop, and closes when the stop is left. */
  open?: "shortcuts" | "add-stock" | "conditions" | "handover";
  /** Clicking the highlighted element moves the tour on. */
  advance?: boolean;
  title: string;
  body: string;
  /** The amber "do this" line under the body. */
  prompt?: string;
}

export interface TourSection {
  id: string;
  /** Shown above the title, so people know where they are. */
  label: string;
  steps: TourStep[];
}

export const TOUR_SECTIONS: TourSection[] = [
  {
    id: "wallet",
    label: "Your wallet",
    steps: [
      {
        target: "wallet-hero",
        route: "/account/overview",
        title: "Refreshed Wallet Overview",
        body: "Balance, account number and the four things you do most now sit in one card. Nothing to scroll for.",
        prompt: "Tap Fund Wallet to top up, or the eye to hide your balance.",
      },
      {
        target: "money-flow",
        route: "/account/overview",
        title: "Money In vs Money Out",
        body: "What came in and what went out over the last 7 days, side by side. No report to open.",
      },
      {
        target: "tx-list",
        route: "/account/overview",
        title: "Every Transaction Has A Receipt",
        body: "Transactions are grouped by day, money in green and money out in red. Each one opens a receipt you can share or download.",
        prompt: "Click any transaction to open its receipt.",
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory overview",
    steps: [
      {
        target: "inv-hero",
        route: "/inventory/overview",
        title: "Refreshed Inventory Overview",
        body: "Total sales for the period and the store you pick, with the change against the last period. Period and store filters live inside the card now.",
        prompt: "Tap Today to switch period, or All stores to pick one shop.",
      },
      {
        target: "sales-tabs",
        route: "/inventory/overview",
        title: "Online And In-Store At A Glance",
        body: "One Recent Sales list for both channels, with the count on each toggle. Online orders and counter sales no longer live on separate pages.",
        prompt: "Tap In-store to see counter sales only.",
      },
      {
        target: "shortcut-picker",
        route: "/inventory/overview",
        open: "shortcuts",
        title: "The Quick Actions Drawer",
        body: "The shortcut strip on your overview is yours to set. Pin the six actions you use most and they stay on top, as tiles or as a list.",
        prompt: "Tap any action to pin or unpin it.",
      },
    ],
  },
  {
    id: "handover",
    label: "Handover",
    steps: [
      {
        target: "handover-card",
        route: "/inventory/overview",
        advance: true,
        title: "Handover Has Its Own Shortcut",
        body: "Paid online orders waiting to be collected show a live count here, so nothing is forgotten at the counter.",
        prompt: "Tap Quick Handover to open the list.",
      },
      {
        target: "handover-drawer",
        route: "/inventory/overview",
        open: "handover",
        title: "Every Order Waiting To Be Collected",
        body: "The drawer lists each paid order with items still to hand over, oldest first so nobody waits longer than they should.",
        prompt: "Start with the oldest order at the top.",
      },
      {
        target: "handover-demo",
        route: "/inventory/overview",
        title: "How A Handover Goes",
        body: "Pick the item being collected, choose who is collecting, then confirm with the code. Items are handed over one at a time, so a part collection is normal.",
        prompt: "This sample shows the three steps.",
      },
    ],
  },
  {
    id: "sales",
    label: "Sales history",
    steps: [
      {
        target: "page-tabs",
        route: "/inventory/sales",
        title: "Improved Sales History",
        body: "All, Online and In-store toggles at the top, search for a customer or invoice code, and totals that follow whatever you filter.",
        prompt: "Tap Online to see marketplace orders only.",
      },
      {
        target: "pack-qty",
        route: "/inventory/sell",
        title: "Packs And Pieces, The Way You Count",
        body: "When a pack is split into pieces the leftover no longer shows as a decimal. 1.17 packs of 12 reads as 1pck.2pcs — one full pack and two loose bottles. Switch a product to Pieces and it counts whole bottles instead.",
        prompt: "This sample shows the format. Your own products use it too.",
      },
    ],
  },
  {
    id: "store",
    label: "My Store",
    steps: [
      {
        target: "store-page",
        route: "/inventory/my-store",
        title: "My Store, Rebuilt Around The Product",
        body: "The whole screen changed. Every product across every store is in one list now, with its store, stock status, price and quantity on the same row — no opening a store first.",
      },
      {
        target: "store-search",
        route: "/inventory/my-store",
        title: "The Answer Is One Tap Away",
        body: "Search, Low Stock and Exp. Soon filters and sorting all sit above the list, so finding a product takes one tap instead of four.",
        prompt: "Type a product name to filter the list.",
      },
    ],
  },
  {
    id: "conditions",
    label: "Adding stock",
    steps: [
      {
        target: "store-add",
        route: "/inventory/my-store",
        advance: true,
        title: "Add Stock In The Same Sheet",
        body: "Add New adds a product, tops up stock and sets your selling rules without leaving My Store.",
        prompt: "Tap Add New, then New Product.",
      },
      {
        target: "np-cond-tab",
        route: "/inventory/my-store",
        open: "add-stock",
        advance: true,
        title: "Marketplace Conditions Are New",
        body: "Every product you add can carry its own selling rules for marketplace buyers. They sit on the second tab of the same sheet.",
        prompt: "Tap Marketplace Conditions.",
      },
      {
        target: "np-conditions",
        route: "/inventory/my-store",
        open: "conditions",
        title: "Sell On Your Own Terms",
        body: "Set a minimum quantity, give free delivery above a quantity, bundle one product with another, or drop the price on bigger packs. Pause or edit any rule later.",
        prompt: "Tap Add condition to build one.",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    steps: [
      {
        target: "nav-more",
        advance: true,
        title: "Attendant And Store Settings Moved",
        body: "They are out of the old profile page and into More, next to Profile Settings and Referral.",
        prompt: "Click More in the sidebar.",
      },
      {
        target: "page-tabs",
        route: "/business-settings",
        title: "One Place To Run Your Shop",
        body: "Attendant Setting controls what your staff can see and do. Store Setting handles the default store, marketplace visibility and credit.",
      },
    ],
  },
];

/** Flat list, plus where each stop sits, so the overlay can index simply. */
export interface FlatStep extends TourStep {
  sectionId: string;
  sectionLabel: string;
  /** 0-based position within its own section. */
  indexInSection: number;
  sectionSize: number;
  /** Index of the first step of the next section, or null at the end. */
  nextSectionStart: number | null;
}

export const TOUR_STEPS: FlatStep[] = (() => {
  const flat: FlatStep[] = [];
  const starts: number[] = [];

  TOUR_SECTIONS.forEach((section) => {
    starts.push(flat.length);
    section.steps.forEach((step, i) => {
      flat.push({
        ...step,
        sectionId: section.id,
        sectionLabel: section.label,
        indexInSection: i,
        sectionSize: section.steps.length,
        nextSectionStart: null,
      });
    });
  });

  // Fill in each step's pointer to the section after its own.
  let s = 0;
  flat.forEach((step, i) => {
    if (s + 1 < starts.length && i >= starts[s + 1]) s += 1;
    step.nextSectionStart = s + 1 < starts.length ? starts[s + 1] : null;
  });

  return flat;
})();

export const TOUR_HIGHLIGHTS = [
  "New Accounts screen — your balance, money moves and activity in one place.",
  "Inventory dashboard shows online and in-store sales at a glance.",
  "Quick Actions — pin the features you use most to your screen.",
  "Handover for online sales is faster, with its own button on the dashboard.",
  "Sales History refreshed — switch between in-store and online in one tap.",
  "Item quantity reads better: no more 1.33 packs, now 1pck.2pcs.",
  "Marketplace Conditions for online sales — minimum quantity, free delivery, bundles, free gifts.",
  "Attendant and store settings moved somewhere easier to find.",
];

export const TOUR_WELCOME = {
  title: "Some Things Have Changed For The Better!",
  intro:
    "We rebuilt the screens you use every day so your business runs faster and smarter.",
  closing: "We are confident you will love these new updates!",
};
