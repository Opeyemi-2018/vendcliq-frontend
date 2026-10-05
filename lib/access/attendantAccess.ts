/**
 * Attendant access rules — the single source for what an attendant may open
 * or do on the web. Mirrors the Flutter app (app-vendcliq:
 * lib/features/auth/bloc/auth_permissions.dart + core/router/app_router.dart):
 *
 *  - an owner (any non-attendant account) passes every check;
 *  - an attendant passes only when the permission flag is true — permissions
 *    not loaded yet, or a missing flag, means DENIED;
 *  - Wallet / Account / business settings are owner-only whatever the flags.
 *
 * Pure TS (no React) so middleware.ts can share it with the client guard.
 */

export const PERMISSION_KEYS = [
  "can_sell",
  "can_buy",
  "can_update_stock",
  "can_add_stock",
  "can_move_stock",
  "can_market_place",
  "can_push_to_market",
  "can_view_store_info",
  "can_reporting",
  "can_expenses",
  "can_sell_on_credit",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];
export type PermissionMap = Partial<Record<PermissionKey, boolean>>;

export interface AccessSubject {
  isAttendant: boolean;
  permissions: PermissionMap | null | undefined;
}

/** Owner: always. Attendant: only with the flag (unknown ⇒ denied). */
export const hasPermission = (s: AccessSubject, key: PermissionKey) =>
  !s.isAttendant || (s.permissions?.[key] ?? false);

/** Wallet, Account section, business/store settings, attendants. */
export const isOwnerOnly = (s: AccessSubject) => !s.isAttendant;

/** Marketplace browsing and My Purchases: Buy OR Market Place. */
export const canUseMarket = (s: AccessSubject) =>
  hasPermission(s, "can_buy") || hasPermission(s, "can_market_place");

/** Normalises any permissions payload to the eleven booleans. */
export const toPermissionMap = (
  data: unknown,
): Record<PermissionKey, boolean> => {
  const source = (data ?? {}) as Record<string, unknown>;
  return Object.fromEntries(
    PERMISSION_KEYS.map((key) => [key, Boolean(source[key])]),
  ) as Record<PermissionKey, boolean>;
};

// ── Routes ──────────────────────────────────────────────────────────────────

export interface RouteRule {
  /** Shown in the "no access" toast. */
  feature: string;
  match: (pathname: string) => boolean;
  allow: (s: AccessSubject) => boolean;
}

const prefix = (p: string) => (pathname: string) =>
  pathname === p || pathname.startsWith(`${p}/`);
const pattern = (re: RegExp) => (pathname: string) => re.test(pathname);

const viewStore = (s: AccessSubject) => hasPermission(s, "can_view_store_info");

/** Ordered: the first matching rule decides, so specific paths come first. */
export const ROUTE_RULES: RouteRule[] = [
  // My Store and what hangs off it
  {
    feature: "Move Stock",
    match: pattern(/^\/inventory\/my-store\/[^/]+\/moveStock(\/|$)/),
    allow: (s) => viewStore(s) && hasPermission(s, "can_move_stock"),
  },
  {
    feature: "Stock Details",
    match: pattern(/^\/inventory\/my-store\/[^/]+\/stock(\/|$)/),
    allow: (s) => viewStore(s) && hasPermission(s, "can_update_stock"),
  },
  { feature: "My Store", match: prefix("/inventory/my-store"), allow: viewStore },
  {
    feature: "Add Store",
    match: prefix("/inventory/create-store"),
    allow: (s) => viewStore(s) && hasPermission(s, "can_add_stock"),
  },
  {
    feature: "Attendants",
    match: prefix("/inventory/add-attendant"),
    allow: isOwnerOnly,
  },

  // Selling
  {
    feature: "Sell",
    match: prefix("/inventory/sell"),
    allow: (s) => hasPermission(s, "can_sell"),
  },
  {
    feature: "Edit Sale",
    match: prefix("/inventory/sales/edit"),
    allow: (s) => hasPermission(s, "can_sell"),
  },
  {
    feature: "Sales Breakdown",
    match: prefix("/inventory/sales-breakdown"),
    allow: (s) => hasPermission(s, "can_reporting"),
  },

  // Buying and the marketplace
  {
    feature: "Buy",
    match: prefix("/inventory/buy"),
    allow: (s) => hasPermission(s, "can_buy"),
  },
  {
    feature: "Record Purchase",
    match: prefix("/add-purchase"),
    allow: (s) => hasPermission(s, "can_buy"),
  },
  { feature: "My Purchases", match: prefix("/my-purchase"), allow: canUseMarket },
  { feature: "Market Place", match: prefix("/market-place"), allow: canUseMarket },
  { feature: "Cart", match: prefix("/cart"), allow: canUseMarket },

  // Reporting and expenses
  {
    feature: "Business Report",
    match: prefix("/business-report"),
    allow: (s) => hasPermission(s, "can_reporting"),
  },
  {
    feature: "Expenses",
    match: prefix("/expenses"),
    allow: (s) => hasPermission(s, "can_expenses"),
  },

  // Owner only: wallet / Account section / business settings
  ...[
    ["/account", "Account"],
    ["/credit-ledger", "Credit Ledger"],
    ["/payment-subscription", "Subscription & Payment"],
    ["/plans", "Plans"],
    ["/loan", "Loans"],
    ["/loans", "Loans"],
    ["/business-account", "Business Account"],
    ["/business-settings", "Business Settings"],
    ["/delivery", "Delivery"],
    ["/request-account-deletion", "Account Deletion"],
  ].map(
    ([p, feature]): RouteRule => ({
      feature,
      match: prefix(p),
      allow: isOwnerOnly,
    }),
  ),
];

export const ruleForPath = (pathname: string) =>
  ROUTE_RULES.find((rule) => rule.match(pathname));

/** Paths with no rule (home, sales history, customers, …) are open to all. */
export const canOpenPath = (pathname: string, s: AccessSubject) => {
  const rule = ruleForPath(pathname);
  return !rule || rule.allow(s);
};

/** Where a denied attendant lands (their dashboard). */
export const ATTENDANT_HOME = "/inventory/overview";
/** Query param middleware adds so the dashboard can explain the redirect. */
export const DENIED_PARAM = "denied";

export const deniedMessage = (feature?: string | null) =>
  feature
    ? `You don't have access to ${feature}. Ask the store owner to turn it on.`
    : "You don't have access to that page. Ask the store owner to turn it on.";

// ── Cookie (read by middleware) ─────────────────────────────────────────────

export const PERMISSIONS_COOKIE = "userPermissions";

/** Older sign-ins wrote these names; read them so a live session keeps working. */
const LEGACY_COOKIE_NAMES: Record<string, PermissionKey> = {
  canSell: "can_sell",
  canBuy: "can_buy",
  canReporting: "can_reporting",
  canExpenses: "can_expenses",
  canAccessMarketplace: "can_market_place",
};

/** Comma list of the granted flags, e.g. "can_sell,can_reporting". */
export const serializePermissions = (p: PermissionMap | null | undefined) =>
  PERMISSION_KEYS.filter((key) => p?.[key]).join(",");

export const parsePermissionsCookie = (value?: string | null): PermissionMap => {
  const granted: PermissionMap = {};
  for (const token of (value ?? "").split(",")) {
    const name = token.trim();
    const key =
      (PERMISSION_KEYS as readonly string[]).includes(name)
        ? (name as PermissionKey)
        : LEGACY_COOKIE_NAMES[name];
    if (key) granted[key] = true;
  }
  return granted;
};

/** Client-side: keep the middleware cookie in step with the live flags. */
export const writePermissionsCookie = (p: PermissionMap | null | undefined) => {
  if (typeof document === "undefined") return;
  document.cookie = `${PERMISSIONS_COOKIE}=${serializePermissions(p)}; path=/; max-age=${
    60 * 60 * 24 * 7
  }; SameSite=Strict`;
};
