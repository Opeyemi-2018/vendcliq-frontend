# Vendcliq UI Refresh

What changed on the `Main-refresh` branch, why, and what is still open.

Built against `Vendcliq Overview Refresh.dc.html` as the source of truth for
layout and styling, `CHANGES.md` for scope, and `vendcliq-tour-prompts.md` for
the guided tour's copy and mobile rules.

**37 commits · 90 files · 51 new, 39 changed.**

---

## Contents

1. [Design system](#1-design-system)
2. [Screens](#2-screens)
3. [The guided tour](#3-the-guided-tour)
4. [Naming changes](#4-naming-changes)
5. [Bugs found and fixed](#5-bugs-found-and-fixed)
6. [New shared code](#6-new-shared-code)
7. [Mobile](#7-mobile)
8. [Still open](#8-still-open)
9. [For the backend team](#9-for-the-backend-team)

---

## 1. Design system

| Token | Value |
|---|---|
| Primary | `#0A6DC0`, hover `#09599A` |
| Navy | `#0A2540` |
| Amber | `#FAC136`, panel `#FFF3DB` on `#85540A` |
| Green | `#E7F4EB` on `#003909` |
| Money in / out | `#31A078` / `#EA4334` |
| Fonts | Clash Display (headings), DM Sans (UI) |

**Clash Display is now self-hosted.** It was loaded from Fontshare via an
`@import` that the CSS build stripped, leaving only the local Medium face. Bold
headings silently rendered at weight 500 — and `document.fonts.check()` returned
`true` for every weight, so nothing surfaced it. All four weights ship as woff2.

**Money** renders through `formatNaira` — `₦` plus `toLocaleString("en-NG")`,
no decimals, `₦ ****` when hidden. Quantities keep their decimals.

---

## 2. Screens

### Account
- **Overview** rebuilt: wallet hero with four actions, money in vs out, Quick
  Actions drawer, transactions grouped by day, each opening a receipt.
- **Transactions History** rebuilt: filter chips, per-filter totals, day groups,
  shared receipt modal.
- **Fund wallet** modal with copyable account details.

### Inventory
- **Overview** rebuilt: sales hero with period and store filters inside the
  card, cross-channel Recent Sales, Quick Handover card, pinnable shortcuts.
- **Sales History** rebuilt as one list across both channels, with search,
  channel toggles, status chips and totals that follow the filter.
- **Sales Breakdown by Store** rebuilt: inherits the hero's period, includes
  zero-sales stores, one fetch pass feeds both panes.
- **My Store** rebuilt product-first: every product across every store in one
  list, with search, filters, circular multi-select, bulk delete and move.
- **Add Stock** sheet with Marketplace Rules on a second tab.
- **Online-sale handover** rebuilt item by item.
- **My Purchases** rebuilt as card rows with server-side pagination, a delivery
  badge, a scrollable item table and a restyled tracking timeline.

### Settings
- **Business Settings** is a new page: attendant permissions (ten real flags)
  and per-store settings, moved out of Profile Settings.

### Chrome
- **Sidebar** matched to the prototype: Enterprise removed, prototype logos,
  tour and AI cards replacing the subscription banner, chevrons as their own
  control so a section expands without navigating.

---

## 3. The guided tour

18 stops in 7 features. Spotlight ring with four scrims, a callout that places
itself around the target, per-feature progress, `Next` within a feature and
`Next feature` to skip ahead. Escape ends it.

The welcome card opens once on first login; afterwards only the sidebar card
brings it back.

**Two stops carry their own sample data**, because the real thing may not exist
on a given account:

- **Packs and pieces** puts a sample product on the Sell screen showing
  `1pck.2pcs` — not every vendor has a part-used pack in stock.
- **Handover** shows a sample order walking the three steps — an account may
  have nothing pending, and nothing in a tour should be able to mark real stock
  as collected.

Both are clearly labelled, non-interactive, and removed the moment the tour
moves on.

---

## 4. Naming changes

Applied in the tour **and** in the screens, so both use the same words. Labels
only — filter ids, routes and API values are untouched.

| Was | Now |
|---|---|
| In-store | Shop |
| Marketplace Conditions | Marketplace Rules |
| Add condition | Add rule |
| Exp. soon | Expiring soon |
| Breakdown by medium | Breakdown by channel |

---

## 5. Bugs found and fixed

Several were found while building rather than reported.

**The wallet was never fetched.** `useWallet` only seeds from `localStorage`
and nothing called `fetchWallet`. On a fresh login no request went out: the
balance read zero, the account number was blank, and because `hasWallet` was
derived from that number, **the Create A Business Account prompt showed to
vendors who already had an account.**

**The virtual account was never created.** `handleCreateWallet` existed and the
endpoint was allowlisted, but nothing called it. Business verification finished
and left the vendor with no wallet. It is called now, and the cached user is
updated alongside a wallet fetch — previously only a fresh login would notice.

**Store preference flags always read false.** The API nests them under
`settings` on the store *detail* response; the code read them off the store
*list*, which carries none of them. Toggles saved correctly and read back as
off. Both stores had `show_on_marketplace: true` showing as off. The same defect
existed on the store detail page's own modal.

**Signup was a one-way door.** Picking WhatsApp or SMS took you to the code
screen with no way back. The wizard already had a `prev` handler that step 2
used; step 5 was never given it.

**Purchase item counts read 0 everywhere.** The list endpoint sends an empty
`items` array alongside a populated `items_count`. The rows read the array.

**335 purchases were unreachable.** The list paginated 10 rows client-side while
the endpoint holds 345 across 35 pages, and only ever fetched page 1.

**Fund wallet claimed transfers were free.** A deposit fee of ₦50–₦150 applies.

**The fund modal showed a placeholder account name** — the literal string
"Vendcliq Wallet" for every user.

**A list overflowed its own box.** The welcome card's feature list was sized
with `h-full`; a percentage height against an auto-height flex parent resolves
to `auto`, so it grew to its content and painted over the footer.

**`FilterDropdown` spread unknown props onto its wrapper**, so passing a
`className` would silently replace `relative` and break menu positioning
everywhere it is used.

**Bulk stock delete — fixed on the backend.** For a long stretch the endpoint
never received the DELETE body: a valid UUID, an empty array and no body at all
returned an identical 400 "ids must be an array", while a bogus endpoint
returned 403, which proved the body was parsed but the ids never read. The
frontend request shape was correct throughout and needed no change. It now
answers distinctly — 404 "No stocks found for the provided ids" for an unknown
id, 400 "ids should not be empty" for an empty array.

**Smaller ones:** `total_sales` double-counting, a green chip on a pending
status, `−₦-1,133,953` from a missing `Math.abs`, an infinite render loop from
a fresh array in a dependency list, a selection bar that shifted rows under the
cursor, Radix popovers behind modals, Escape closing a whole sheet instead of
its popover, and Transactions History taking ~11s to load (297 rows over 6
sequential pages, now page 1 then the rest in parallel).

---

## 6. New shared code

**Formatting** — `lib/priceInput.ts`
- `formatPacks(qty, itemsPerPack)` — `1.33` becomes `1pck.4pcs`, the way a
  vendor counts. Zero reads `0pcks`, never `0pcs`.
- `formatPieces` — pieces are whole. `1.3333` packs of 12 is **16** bottles,
  not 15.96, so it rounds rather than truncates. Availability checks round with
  the labels, or the app would block a sale it says is in stock.
- `formatPriceInput` / `parsePriceInput` — thousands separators while typing,
  stripped before submission.

**Sales** — `lib/salesFilters.ts`, `lib/salesRows.ts`, `lib/salesFilterStore.ts`.
The filter store is module-level so a period survives navigation but resets on
refresh; deliberately not `localStorage`.

**Tour** — `lib/tour/steps.ts`, `lib/tour/store.ts`, three components.

**Components** — `BackButton`, `FilterDropdown`, `SalesRow`, `SalesLogRow`,
`QuickActionsStrip`, `ShortcutPickerModal`, `QuickHandoverDrawer`,
`AddStockSheet`, `MarketplaceConditions`, `StockConditionsPanel`, `VcIcon`
and others.

**Cross-component communication** uses window events rather than lifting state
into shared parents: `vc:open-chat`, `vc:tour-open-*`, `vc:tour-close-*`.

---

## 7. Mobile

Verified by measuring at 375–412px, not by eyeballing screenshots.

- Panels become **full-screen sheets** below 768px with fixed headers and
  actions that stay reachable: Quick Handover, Add Stock, Edit shortcuts. All
  respect `env(safe-area-inset-bottom)`.
- The **tour card becomes a bottom sheet**, anchored rather than measured, with
  a collapse control so it can be folded to just Back and Next when it covers
  what it points at.
- **Horizontal scroll** replaces wrapping for quick action tiles, store chips
  and status chips.
- **Rows stop wrapping.** Recent sales 68px, My Store products 94px → 75px,
  transactions 65px. Amounts never wrap, long names truncate, reference codes
  hide below 768px.
- **Floating Add New** on My Store sits 35px clear of the chat bubble and steps
  aside during a selection.

---

## 8. Still open

**`PUT inventory/stock-conditions/:id` is undocumented.** Used for pause/resume
and edits. It fails loudly rather than silently if unsupported.

**Two signup fixes are untested at runtime.** The back button and the
create-wallet call both need a fresh account and a real BVN/ID submission. They
typecheck, lint and build, but the runtime path has not been exercised —
particularly the create-wallet response shape.

**React #418 hydration mismatch** app-wide, from Radix ids. Pre-existing,
recoverable, not introduced here.

**Two tour stops from the spec are absent** — the ones that open an invoice and
its handover method picker. Both need a live pending order to point at, which
not every account has.

---

## 9. For the backend team

Three gaps on `inventory/invoices/purchases`, all the same shape:

1. **`items` comes back empty while `items_count` is populated.** This caused
   the "0 items" bug.
2. **No delivery flag on the list response.** The badge showing which purchases
   have a delivery costs 10 detail fetches per page because the flag only
   exists on each invoice's detail. A `has_delivery` boolean would remove the
   fan-out.
3. **No search parameter.** Search filters the page in hand only, which the
   screen now states outright.

Plus:

4. **`PUT inventory/stock-conditions/:id`** — confirm it exists.
5. **`name` on the update-store payload** is sent and appears to work, but was
   never in the declared type.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # run before committing; tsc alone has missed real failures
```

`npm run build` overwrites `.next` while the dev server is running and leaves it
serving a production build. Restart dev after building.
