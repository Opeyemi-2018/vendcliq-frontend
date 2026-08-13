/**
 * The guided tour's stops. Each targets an element by `data-tour`, optionally
 * routing there first and asking a host page to open a panel.
 */

export interface TourStep {
  /** Matches a `data-tour="…"` attribute somewhere in the app. */
  target: string;
  /** Route to be on before the target is looked for. */
  route?: string;
  /** Event a host page listens for to open the panel this stop needs. */
  open?: "shortcuts" | "add-stock" | "conditions";
  /** Clicking the highlighted element moves the tour on. */
  advance?: boolean;
  title: string;
  body: string;
  /** The amber "do this" line under the body. */
  prompt?: string;
}

export const TOUR_STEPS: TourStep[] = [
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
  {
    target: "inv-hero",
    route: "/inventory/overview",
    title: "Refreshed Inventory Overview",
    body: "Total sales for the period and the store you pick, with the change against the last period. Period and store filters live inside the card now.",
    prompt: "Tap Today to switch period, or All stores to pick one shop.",
  },
  {
    target: "shortcut-picker",
    route: "/inventory/overview",
    open: "shortcuts",
    title: "The Quick Actions Drawer",
    body: "The shortcut strip on your overview is yours to set. Pin the six actions you use most and they stay on top, as tiles or as a list.",
    prompt: "Tap any action to pin or unpin it.",
  },
  {
    target: "sales-tabs",
    route: "/inventory/overview",
    title: "Online And In-Store At A Glance",
    body: "One Recent Sales list for both channels, with the count on each toggle. Online orders and counter sales no longer live on separate pages.",
    prompt: "Tap In-store to see counter sales only.",
  },
  {
    target: "handover-card",
    route: "/inventory/overview",
    title: "Handover Has Its Own Shortcut",
    body: "Paid online orders waiting to be collected show a live count here, so nothing is forgotten at the counter.",
  },
  {
    target: "sale-row",
    route: "/inventory/overview",
    advance: true,
    title: "Open Any Sale From The List",
    body: "Every row opens its invoice now — online orders and in-store sales alike.",
    prompt: "Click a sale to open its invoice.",
  },
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
  {
    target: "store-search",
    route: "/inventory/my-store",
    title: "My Store, Fewer Taps",
    body: "Search, Low Stock and Exp. Soon filters and sorting all sit above the list. The answer is one tap away instead of four.",
    prompt: "Type a product name to filter the list.",
  },
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
];

export const TOUR_HIGHLIGHTS = [
  "Refreshed wallet overview — balance and money actions in one card",
  "Inventory overview shows online and in-store sales at a glance",
  "Quick Actions drawer — pin the six shortcuts you use most",
  "Handover is easier: item by item, customer OTP or driver code",
  "Sales History with easy toggles and search",
  "Packs and pieces read as 1pck.2pcs instead of a decimal",
  "Marketplace Conditions: minimum quantity, free delivery, bundles",
  "Attendant and store settings moved somewhere more convenient",
];
