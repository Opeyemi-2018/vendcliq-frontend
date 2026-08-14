/**
 * The guided tour, grouped into features. Next walks the stops inside a
 * feature; Next feature skips the rest and jumps to the following one.
 *
 * Copy follows the vendor voice pack: short sentences, words traders use,
 * second person, no em-dashes. Titles stay under 32 characters, bodies under
 * 140, hints under 60 and start with a verb.
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
        title: "Your Money Is Right Here",
        body: "Your balance, your account number and the four things you do most are on one card now. Nothing to scroll for.",
        prompt: "Tap Fund Wallet to add money, or the eye to hide your balance.",
      },
      {
        target: "money-flow",
        route: "/account/overview",
        title: "What Came In, What Went Out",
        body: "Money that entered and money that left your wallet in the last 7 days, side by side. No report to open.",
        prompt: "Green is money in. Red is money out.",
      },
      {
        target: "tx-list",
        route: "/account/overview",
        title: "Every Payment Has A Receipt",
        body: "Your transactions are grouped by day. Tap any one to open its receipt, then send it to your customer or save it.",
        prompt: "Tap any transaction to open its receipt.",
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
        title: "See What You Sold",
        body: "Total sales for the day, week or month, for one shop or all of them, with how it compares to the last period.",
        prompt: "Tap This week to change period, or All stores to pick one shop.",
      },
      {
        target: "sales-tabs",
        route: "/inventory/overview",
        title: "Shop Sales And Online Orders",
        body: "Both are in one list now. The number on each button tells you how many you have.",
        prompt: "Tap Shop to see counter sales only.",
      },
      {
        target: "shortcut-picker",
        route: "/inventory/overview",
        open: "shortcuts",
        title: "Keep What You Use On Top",
        body: "Pin the six things you do every day and they stay at the top of your overview, as boxes or as a list.",
        prompt: "Tap any action to pin or remove it.",
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
        title: "Orders Waiting To Be Collected",
        body: "Customers who paid online and are coming to pick up show here with a live count, so nothing is forgotten at the counter.",
        prompt: "Tap Quick Handover to open the list.",
      },
      {
        target: "handover-drawer",
        route: "/inventory/overview",
        open: "handover",
        title: "Who Has Waited The Longest",
        body: "Every paid order still to collect, oldest first, so no customer waits longer than they should.",
        prompt: "Start with the order at the top.",
      },
      {
        target: "handover-demo",
        route: "/inventory/overview",
        title: "Three Steps To Hand Over",
        body: "Pick the item being collected, choose who is collecting, then enter the code they read out. You can give one item now and the rest later.",
        prompt: "This example shows the three steps.",
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
        title: "Find Any Sale Fast",
        body: "Search a customer name or invoice number, or switch between All, Online and Shop. The total follows whatever you pick.",
        prompt: "Tap Online to see marketplace orders only.",
      },
      {
        target: "pack-qty",
        route: "/inventory/sell",
        title: "Packs And Pieces, As You Count",
        body: "Break a pack and you no longer see 1.17. You see 1pck.2pcs, one full pack and two bottles.",
        prompt: "Switch a product to Pieces to count bottles only.",
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
        title: "All Your Products In One List",
        body: "Every product from every shop is here now, with its shop, stock, price and quantity on the same line. No opening a shop first.",
        prompt: "Swipe the shop buttons to see one shop only.",
      },
      {
        target: "store-search",
        route: "/inventory/my-store",
        title: "Find A Product In One Tap",
        body: "Search, Low Stock, Expiring Soon and sorting all sit on top of the list, so finding a product takes one tap instead of four.",
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
        title: "Add Stock Without Leaving",
        body: "Add New puts in a new product, tops up what you already have and sets your selling rules, all in the same place.",
        prompt: "Tap Add New, then New Product.",
      },
      {
        target: "np-cond-tab",
        route: "/inventory/my-store",
        open: "add-stock",
        advance: true,
        title: "Set Rules For Online Buyers",
        body: "Every product you add can carry its own selling rules for buyers on the marketplace. They sit on the second tab of the same form.",
        prompt: "Tap Marketplace Rules.",
      },
      {
        target: "np-conditions",
        route: "/inventory/my-store",
        open: "conditions",
        title: "Sell The Way You Want",
        body: "Ask for a minimum quantity, give free delivery on big orders, sell two products together, or drop the price on bigger packs.",
        prompt: "Tap Add rule to create one.",
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
        title: "Your Settings Have Moved",
        body: "Attendant and shop settings have left the profile page. You will find them under More, beside Profile Settings and Referral.",
        prompt: "Tap More in the menu.",
      },
      {
        target: "page-tabs",
        route: "/business-settings",
        title: "Run Your Shop From Here",
        body: "Attendant Setting controls what your staff can see and do. Store Setting covers your default shop, marketplace visibility and credit.",
        prompt: "Tap Attendant Setting to set what your staff can do.",
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
  "New Accounts screen. Your balance, money moves and activity in one place.",
  "Inventory overview shows shop sales and online orders together.",
  "Shortcuts. Pin the things you use most to the top of your screen.",
  "Handover for online orders is faster, with its own button.",
  "Sales History refreshed. Switch between shop and online in one tap.",
  "Item quantity reads better. No more 1.33 packs, now 1pck.2pcs.",
  "Marketplace Rules for online sales. Minimum quantity, free delivery, bundles, free gifts.",
  "Attendant and shop settings moved somewhere easier to find.",
];

export const TOUR_WELCOME = {
  title: "Some Things Have Changed For The Better!",
  intro:
    "We rebuilt the screens you use every day so your business runs faster and smarter.",
  closing: "We are confident you will love these new updates!",
};

/** The completion card. */
export const TOUR_FINISH = {
  title: "That Is The Tour",
  body: "Your money, your sales and your shop now take fewer taps. You can run this tour again any time from the menu.",
  button: "Done",
};

/** The sidebar entry point. */
export const TOUR_ENTRY = {
  title: "Quick tour",
  line: `${TOUR_STEPS.length} stops, about 2 minutes`,
  button: "Show me around",
};
