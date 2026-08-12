"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { VcIcon, TilesIcon, IconName } from "@/components/inventory/VcIcon";

export interface QuickAction {
  id: string;
  label: string;
  sub: string;
  route: string;
  bg: string;
  fg: string;
  icon: IconName;
}

/** INV_CATALOG from the prototype, verbatim (labels, subtitles, tones, icons). */
export const INVENTORY_ACTIONS: QuickAction[] = [
  { id: "sell", label: "Sell", sub: "Start a new sale", bg: "#E1EEFF", fg: "#0A6DC0", icon: "cart", route: "/inventory/sell" },
  { id: "store", label: "My Store", sub: "Products and stock", bg: "#E8EEFF", fg: "#4052A3", icon: "shop", route: "/inventory/my-store" },
  { id: "customers", label: "Customer List", sub: "Everyone you sell to", bg: "#E0F2ED", fg: "#148264", icon: "people", route: "/customer" },
  { id: "report", label: "Business Report", sub: "Sales & profit", bg: "#F3EAFF", fg: "#7B61FF", icon: "chart", route: "/business-report" },
  { id: "saleslog", label: "Sales History", sub: "In-store & online sales", bg: "#E7F4EB", fg: "#0E6E55", icon: "clock", route: "/inventory/sales" },
  { id: "expenses", label: "Expenses", sub: "What the business spends", bg: "#F6E8E7", fg: "#BE4637", icon: "naira", route: "/expenses" },
  { id: "suppliers", label: "Supplier List", sub: "Who you buy from", bg: "#E1EEFF", fg: "#0A6DC0", icon: "building", route: "/suppliers" },
];

/** ACCT_CATALOG from the prototype. */
export const ACCOUNT_ACTIONS: QuickAction[] = [
  { id: "send", label: "Send Money", sub: "To bank or Vendcliq", bg: "#E1EEFF", fg: "#0A6DC0", icon: "send", route: "/account/send-money" },
  { id: "airtime", label: "Airtime & Data", sub: "All networks", bg: "#E8EEFF", fg: "#4052A3", icon: "sim", route: "/account/pay-utility" },
  { id: "history", label: "Transactions History", sub: "Every wallet movement", bg: "#E7F4EB", fg: "#0E6E55", icon: "note", route: "/account/transactionHistory" },
  { id: "subs", label: "Subscription & Payment", sub: "Plan and renewals", bg: "#FFF3DB", fg: "#B47800", icon: "wallet", route: "/payment-subscription" },
  { id: "ledger", label: "Credit Ledger", sub: "What customers owe you", bg: "#E0F2ED", fg: "#148264", icon: "shield", route: "/credit-ledger" },
  { id: "loans", label: "Loans", sub: "Borrow against sales", bg: "#F3EAFF", fg: "#7B61FF", icon: "naira", route: "/loans" },
];

export const DEFAULT_ACCOUNT_PINS = [
  "send",
  "airtime",
  "history",
  "subs",
  "ledger",
];

export const DEFAULT_INVENTORY_PINS = [
  "sell",
  "store",
  "report",
  "customers",
  "suppliers",
  "expenses",
];

interface QuickActionsStripProps {
  actions: QuickAction[];
  pinnedIds?: string[];
  /** Opens the customise drawer (spec §3, not built yet). */
  onEditShortcuts?: () => void;
  "data-tour"?: string;
}

export const QuickActionsStrip = ({
  actions,
  pinnedIds,
  onEditShortcuts,
  ...rest
}: QuickActionsStripProps) => {
  const router = useRouter();
  const [view, setView] = useState<"tile" | "list">("tile");

  const pinned = pinnedIds
    ? (pinnedIds
        .map((id) => actions.find((a) => a.id === id))
        .filter(Boolean) as QuickAction[])
    : actions;

  if (!pinned.length) return null;

  const countLabel = `${pinned.length} of 6 shortcuts pinned · ${
    view === "tile" ? "tile view" : "list view"
  }`;

  const toggleBase =
    "inline-flex items-center gap-[6px] border-none h-[30px] px-3 rounded-full text-[12.5px] cursor-pointer";
  const toggleOn = "bg-white text-[#0A6DC0] font-bold shadow-[0_1px_3px_rgba(0,0,0,.10)]";
  const toggleOff = "bg-transparent text-[#6B6B70] font-semibold hover:text-[#2F2F2F]";

  return (
    <section {...rest}>
      <div className="flex items-end justify-between gap-[14px] mb-3 flex-wrap">
        <div>
          <h2 className="m-0 font-clash font-semibold text-[19px] tracking-[-.3px] text-[#2F2F2F]">
            Quick actions
          </h2>
          <p className="mt-1 text-[13px] text-[#8E8E93]">{countLabel}</p>
        </div>

        <div className="flex items-center gap-[10px]">
          <div className="flex gap-[3px] bg-[#F4F5F7] p-[3px] rounded-full">
            <button
              type="button"
              onClick={() => setView("tile")}
              className={`${toggleBase} ${view === "tile" ? toggleOn : toggleOff}`}
            >
              <TilesIcon />
              <span>Tiles</span>
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`${toggleBase} ${view === "list" ? toggleOn : toggleOff}`}
            >
              <VcIcon name="list" size={14} />
              <span>List</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onEditShortcuts}
            className="inline-flex items-center gap-[7px] h-9 px-[14px] rounded-full border border-[#D8D8D8E6] bg-white cursor-pointer text-[12.5px] font-semibold text-[#6B6B70] hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
          >
            <VcIcon name="pencil" size={14} />
            <span>Edit shortcuts</span>
          </button>
        </div>
      </div>

      {view === "tile" ? (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(178px,1fr))]">
          {pinned.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => router.push(action.route)}
              className="bg-white border border-[#D8D8D88C] rounded-[16px] p-4 cursor-pointer text-left flex flex-col gap-3 relative transition hover:border-[#0A6DC0] hover:-translate-y-[2px]"
            >
              <span
                className="w-11 h-11 rounded-[13px] inline-flex items-center justify-center"
                style={{ background: action.bg }}
              >
                <VcIcon name={action.icon} size={22} stroke={action.fg} />
              </span>
              <span className="block">
                <span className="block font-bold text-[14.5px] text-[#2F2F2F] tracking-[-.2px]">
                  {action.label}
                </span>
                <span className="block text-[12px] text-[#8E8E93] mt-0.5">
                  {action.sub}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pinned.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => router.push(action.route)}
              className="bg-white border border-[#D8D8D88C] rounded-[14px] py-[13px] px-4 cursor-pointer text-left flex items-center gap-[14px] transition hover:border-[#0A6DC0] hover:bg-[#F9FCFF]"
            >
              <span
                className="w-10 h-10 rounded-[12px] inline-flex items-center justify-center shrink-0"
                style={{ background: action.bg }}
              >
                <VcIcon name={action.icon} size={21} stroke={action.fg} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-[14.5px] text-[#2F2F2F] tracking-[-.2px]">
                  {action.label}
                </span>
                <span className="block text-[12px] text-[#8E8E93] mt-0.5">
                  {action.sub}
                </span>
              </span>
              <VcIcon
                name="chevron"
                size={18}
                stroke="#B9BCC2"
                strokeWidth={2.4}
                className="shrink-0"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default QuickActionsStrip;
