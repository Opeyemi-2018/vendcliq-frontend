"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRecentSales, useSalesData } from "@/hooks/useInventoryOverview";
import { useRecentPurchaseRequests } from "@/hooks/usePurchaseRequests";
import {
  PERIOD_OPTIONS,
  PeriodId,
  comparisonLabel,
  formatNaira,
  isWithinRange,
  percentChange,
  periodLabel,
  previousRange,
  resolvePeriod,
} from "@/lib/salesFilters";
import { useSalesFilter } from "@/lib/salesFilterStore";
import {
  SalesRowData,
  isAwaitingHandover,
  purchaseRequestToRow,
  saleInvoiceToRow,
} from "@/lib/salesRows";
import SalesRow from "@/components/inventory/SalesRow";
import QuickHandoverDrawer from "@/components/inventory/QuickHandoverDrawer";
import MediumBreakdownModal from "@/components/inventory/MediumBreakdownModal";
import ShortcutPickerModal from "@/components/inventory/ShortcutPickerModal";
import { useShortcutPins } from "@/lib/shortcutStore";
import { VcIcon, CalendarIcon } from "@/components/inventory/VcIcon";
import QuickActionsStrip, {
  DEFAULT_INVENTORY_PINS,
  INVENTORY_ACTIONS,
} from "@/components/QuickActionsStrip";

const MAX_ROWS = 6;
type ChannelTab = "all" | "online" | "instore";

const pillClass =
  "inline-flex items-center gap-[9px] h-[38px] px-[15px] rounded-full border border-white/30 bg-white/15 text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap hover:bg-white/[.26]";

const Home = () => {
  const router = useRouter();

  const [hideAmounts, setHideAmounts] = useState(false);
  // Shared with Sales History so a chosen range survives navigation.
  const {
    period,
    custom,
    storeId,
    setPeriod,
    setCustom,
    setStoreId,
  } = useSalesFilter("today");
  const customStart = custom.start ?? "";
  const customEnd = custom.end ?? "";
  const [openMenu, setOpenMenu] = useState<"period" | "store" | null>(null);
  const [channelTab, setChannelTab] = useState<ChannelTab>("all");
  const [mediumModalOpen, setMediumModalOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // The guided tour opens these panels for their stops and closes them again
  // on the way out, so nothing is left covering the screen.
  useEffect(() => {
    const openPicker = () => setPickerOpen(true);
    const closePicker = () => setPickerOpen(false);
    const openHandover = () => setHandoverOpen(true);
    const closeHandover = () => setHandoverOpen(false);
    window.addEventListener("vc:tour-open-shortcuts", openPicker);
    window.addEventListener("vc:tour-close-shortcuts", closePicker);
    window.addEventListener("vc:tour-open-handover", openHandover);
    window.addEventListener("vc:tour-close-handover", closeHandover);
    return () => {
      window.removeEventListener("vc:tour-open-shortcuts", openPicker);
      window.removeEventListener("vc:tour-close-shortcuts", closePicker);
      window.removeEventListener("vc:tour-open-handover", openHandover);
      window.removeEventListener("vc:tour-close-handover", closeHandover);
    };
  }, []);
  const { pins, setPins, reset: resetPins } = useShortcutPins(
    "inventory",
    DEFAULT_INVENTORY_PINS,
  );

  const range = useMemo(
    () => resolvePeriod(period, { start: customStart, end: customEnd }),
    [period, customStart, customEnd],
  );
  const prevRange = useMemo(() => previousRange(range), [range]);

  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
  } = useSalesData(range.start, range.end);
  const { data: prevSalesData } = useSalesData(prevRange.start, prevRange.end);

  const {
    data: recentSales = [],
    isLoading: recentSalesLoading,
    error: recentSalesError,
  } = useRecentSales();

  const {
    data: onlineOrders = [],
    isLoading: onlineLoading,
    error: onlineError,
  } = useRecentPurchaseRequests(50);

  useEffect(() => {
    if (salesError) toast.error("Could not load sales data");
    if (recentSalesError) toast.error("Could not load in-store sales");
    if (onlineError) toast.error("Could not load online sales");
  }, [salesError, recentSalesError, onlineError]);

  const stores = salesData?.stores ?? [];
  const storeLabel =
    storeId === "all"
      ? "All stores"
      : (stores.find((s) => String(s.store_id) === storeId)?.store_name ??
        "All stores");

  const matchesStore = (rowStoreId?: string | null) =>
    storeId === "all" || String(rowStoreId ?? "") === storeId;

  const inStoreRows = useMemo(
    () =>
      recentSales
        .filter((inv: any) => isWithinRange(inv.created_at, range))
        .map(saleInvoiceToRow)
        .filter((row) => matchesStore(row.storeId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recentSales, range, storeId],
  );

  const onlineRows = useMemo(
    () =>
      onlineOrders
        .filter((req: any) => isWithinRange(req.created_at, range))
        .map(purchaseRequestToRow)
        .filter((row) => matchesStore(row.storeId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onlineOrders, range, storeId],
  );

  const byNewest = (a: SalesRowData, b: SalesRowData) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  const allRows = useMemo(
    () => [...inStoreRows, ...onlineRows].sort(byNewest),
    [inStoreRows, onlineRows],
  );

  // Every sale on record, ignoring the period — the fallback that keeps the
  // list from ever rendering empty.
  const everyRow = useMemo(
    () =>
      [
        ...recentSales.map(saleInvoiceToRow),
        ...onlineOrders.map(purchaseRequestToRow),
      ].sort(byNewest),
    [recentSales, onlineOrders],
  );

  const pickChannel = (rows: SalesRowData[]) =>
    channelTab === "all"
      ? rows
      : rows.filter((row) =>
          channelTab === "online"
            ? row.channel === "online"
            : row.channel === "instore",
        );

  const inPeriodRows = useMemo(
    () => pickChannel(allRows).sort(byNewest).slice(0, MAX_ROWS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channelTab, allRows],
  );

  const fallbackRows = useMemo(
    () => pickChannel(everyRow).slice(0, MAX_ROWS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channelTab, everyRow],
  );

  // A quiet period should still show recent activity rather than a blank card.
  const showingFallback = inPeriodRows.length === 0 && fallbackRows.length > 0;
  const visibleRows = showingFallback ? fallbackRows : inPeriodRows;

  // `total_sales` already covers both channels, so it is the headline figure.
  const totalSales = useMemo(() => {
    if (storeId === "all") return salesData?.totalSales ?? 0;
    return stores.find((s) => String(s.store_id) === storeId)?.total_sales ?? 0;
  }, [salesData, stores, storeId]);

  const previousTotal = useMemo(() => {
    if (storeId === "all") return prevSalesData?.totalSales ?? 0;
    return (
      (prevSalesData?.stores ?? []).find((s) => String(s.store_id) === storeId)
        ?.total_sales ?? 0
    );
  }, [prevSalesData, storeId]);

  const change = percentChange(totalSales, previousTotal);

  // Operational queue, deliberately not limited to the selected period.
  const pendingHandovers = useMemo(
    () =>
      onlineOrders
        .filter((req: any) => isAwaitingHandover(req))
        .map(purchaseRequestToRow)
        .sort(byNewest),
    [onlineOrders],
  );

  const menuItem = (active: boolean) =>
    cn(
      "w-full box-border flex items-center gap-[10px] border-none cursor-pointer text-[14px] text-left px-3 py-[11px] rounded-[10px]",
      active
        ? "bg-[#F1F7FF] text-[#0A6DC0] font-bold"
        : "bg-transparent text-[#2F2F2F] font-medium hover:bg-[#F4F5F7]",
    );

  const tabs: { id: ChannelTab; label: string }[] = [
    { id: "all", label: `All ${allRows.length}` },
    { id: "online", label: `Online ${onlineRows.length}` },
    { id: "instore", label: `In-store ${inStoreRows.length}` },
  ];

  return (
    <div className="flex flex-col gap-[22px] max-w-[1360px]">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-5 flex-wrap">
        <div>
          <h1 className="m-0 font-clash font-semibold text-[28px] tracking-[-.5px] text-[#2F2F2F]">
            Inventory
          </h1>
          <p className="mt-[5px] text-[14px] text-[#8E8E93]">
            Everything you sold today, in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/inventory/my-store")}
          className="inline-flex items-center gap-2 h-[42px] px-4 rounded-[10px] border border-[#D8D8D8E6] bg-white cursor-pointer text-[14px] font-medium text-[#2F2F2F] whitespace-nowrap hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
        >
          <VcIcon name="box" size={17} strokeWidth={1.9} />
          <span>My Store</span>
        </button>
      </div>

      {/* ── Hero + action cards ──────────────────────────────────────────── */}
      <div className="grid gap-5 items-stretch [grid-template-columns:minmax(0,1fr)] lg:[grid-template-columns:minmax(0,1.6fr)_minmax(300px,1fr)]">
        <section
          data-tour="inv-hero"
          className="relative rounded-[20px] px-6 py-[22px] text-white bg-[linear-gradient(135deg,#0A6DC0_0%,#3A6BC4_100%)] shadow-[0_12px_28px_-10px_rgba(10,109,192,.45)]"
        >
          <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
            <div className="absolute -top-[70px] -right-[50px] w-[220px] h-[220px] rounded-full bg-white/[.06]" />
            <div className="absolute top-5 right-10 w-[110px] h-[110px] rounded-full bg-white/[.045]" />
          </div>

          {/* Filters */}
          <div className="relative flex items-center gap-[10px] flex-wrap">
            <div className="relative">
              <button
                type="button"
                data-tour="inv-filters"
                onClick={() =>
                  setOpenMenu(openMenu === "period" ? null : "period")
                }
                className={pillClass}
              >
                <CalendarIcon />
                <span>{periodLabel(period, range)}</span>
                <VcIcon
                  name="chevronDown"
                  size={15}
                  stroke="#fff"
                  strokeWidth={2.4}
                />
              </button>

              {openMenu === "period" && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setOpenMenu(null)}
                  />
                  <div className="absolute top-[46px] left-0 z-40 w-[290px] bg-white rounded-[16px] shadow-[0_20px_44px_-16px_rgba(10,37,64,.45)] p-2 text-[#2F2F2F]">
                    {PERIOD_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setPeriod(option.id);
                          if (option.id !== "custom") setOpenMenu(null);
                        }}
                        className={menuItem(period === option.id)}
                      >
                        <span className="flex-1">{option.label}</span>
                        {period === option.id && (
                          <VcIcon
                            name="check"
                            size={16}
                            stroke="#0A6DC0"
                            strokeWidth={2.6}
                          />
                        )}
                      </button>
                    ))}

                    {period === "custom" && (
                      <div className="mt-1.5 pt-[13px] px-3 pb-1 border-t border-[#D8D8D899] flex gap-[10px]">
                        <label className="flex flex-col gap-[5px] flex-1 min-w-0">
                          <span className="text-[10.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93]">
                            From
                          </span>
                          <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustom({ start: e.target.value })}
                            className="box-border w-full border border-[#D8D8D8E6] bg-white text-[#2F2F2F] rounded-[10px] px-[10px] py-[9px] text-[13px] outline-none"
                          />
                        </label>
                        <label className="flex flex-col gap-[5px] flex-1 min-w-0">
                          <span className="text-[10.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93]">
                            To
                          </span>
                          <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustom({ end: e.target.value })}
                            className="box-border w-full border border-[#D8D8D8E6] bg-white text-[#2F2F2F] rounded-[10px] px-[10px] py-[9px] text-[13px] outline-none"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex-1" />

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenMenu(openMenu === "store" ? null : "store")
                }
                className={pillClass}
              >
                <VcIcon
                  name="storefront"
                  size={16}
                  stroke="#fff"
                  strokeWidth={1.9}
                />
                <span>{storeLabel}</span>
                <VcIcon
                  name="chevronDown"
                  size={15}
                  stroke="#fff"
                  strokeWidth={2.4}
                />
              </button>

              {openMenu === "store" && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setOpenMenu(null)}
                  />
                  <div className="absolute top-[46px] right-0 z-40 w-[250px] max-h-[280px] overflow-y-auto bg-white rounded-[16px] shadow-[0_20px_44px_-16px_rgba(10,37,64,.45)] p-2 text-[#2F2F2F]">
                    <button
                      type="button"
                      onClick={() => {
                        setStoreId("all");
                        setOpenMenu(null);
                      }}
                      className={menuItem(storeId === "all")}
                    >
                      <span className="flex-1">All stores</span>
                      {storeId === "all" && (
                        <VcIcon
                          name="check"
                          size={16}
                          stroke="#0A6DC0"
                          strokeWidth={2.6}
                        />
                      )}
                    </button>
                    {stores.map((store) => (
                      <button
                        key={store.store_id}
                        type="button"
                        onClick={() => {
                          setStoreId(String(store.store_id));
                          setOpenMenu(null);
                        }}
                        className={menuItem(storeId === String(store.store_id))}
                      >
                        <span className="flex-1">{store.store_name}</span>
                        {storeId === String(store.store_id) && (
                          <VcIcon
                            name="check"
                            size={16}
                            stroke="#0A6DC0"
                            strokeWidth={2.6}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Total + delta */}
          <div className="relative mt-[18px] flex items-start justify-between gap-x-5 gap-y-3 flex-wrap">
            <div className="min-w-0 flex-[1_1_200px]">
              <div className="flex items-center gap-[10px]">
                <span className="text-[13px] font-medium text-white/85">
                  Total sales · {periodLabel(period, range)}
                </span>
                <button
                  type="button"
                  aria-label="Toggle amount"
                  onClick={() => setHideAmounts((v) => !v)}
                  className="w-[26px] h-[26px] rounded-full border-none bg-white/15 cursor-pointer inline-flex items-center justify-center"
                >
                  {hideAmounts ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 3 18 18" />
                      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
                      <path d="M6.8 6.9C4 8.6 2 12 2 12s4 7 10 7c1.6 0 3-.3 4.3-.9" />
                      <path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6 0 10 7 10 7a19.6 19.6 0 0 1-3.2 4" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="font-clash font-bold text-[clamp(30px,3.3vw,46px)] tracking-[-1.2px] leading-[1.05] mt-1.5 whitespace-nowrap">
                {salesLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  formatNaira(totalSales, hideAmounts)
                )}
              </div>

              <div className="text-[12.5px] text-white/75 mt-[7px]">
                {allRows.length.toLocaleString("en-NG")} sales · {storeLabel}
              </div>
            </div>

            <div className="text-right shrink-0 ml-auto">
              {change !== null && (
                <span className="inline-flex items-center gap-[5px] bg-white/[.16] rounded-full px-[11px] py-1.5 text-[12.5px] font-bold">
                  <VcIcon
                    name={change >= 0 ? "arrowUp" : "arrowDown"}
                    size={13}
                    stroke={change >= 0 ? "#fff" : "#FFD37A"}
                    strokeWidth={2.6}
                  />
                  <span>
                    {change >= 0 ? "+" : "−"}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                </span>
              )}
              <div className="text-[11.5px] text-white/[.72] mt-[7px]">
                {change !== null
                  ? comparisonLabel(period)
                  : "No baseline to compare"}
              </div>
            </div>
          </div>

          {/* Breakdown pills */}
          <div className="relative mt-[22px] flex flex-wrap gap-[10px]">
            <button
              type="button"
              onClick={() => router.push("/inventory/sales-breakdown")}
              className={pillClass.replace("h-[38px]", "h-10")}
            >
              <VcIcon name="storefront" size={16} stroke="#fff" strokeWidth={1.9} />
              <span>Breakdown by Store</span>
              <VcIcon name="chevron" size={14} stroke="#fff" strokeWidth={2.6} />
            </button>
            <button
              type="button"
              onClick={() => setMediumModalOpen(true)}
              className={pillClass.replace("h-[38px]", "h-10")}
            >
              <VcIcon name="card" size={16} stroke="#fff" strokeWidth={1.9} />
              <span>Breakdown by collection medium</span>
              <VcIcon name="chevron" size={14} stroke="#fff" strokeWidth={2.6} />
            </button>
          </div>
        </section>

        {/* Action cards */}
        <div className="flex flex-col gap-[14px]">
          <button
            type="button"
            onClick={() => router.push("/inventory/sell")}
            className="flex-1 min-h-[132px] border-none rounded-[20px] cursor-pointer bg-[linear-gradient(135deg,#0A6DC0_0%,#328CDC_100%)] text-white flex items-center gap-4 px-[22px] py-5 text-left shadow-[0_10px_24px_-8px_rgba(10,109,192,.5)] transition-transform hover:-translate-y-[2px]"
          >
            <span className="w-14 h-14 rounded-[16px] bg-white/[.18] inline-flex items-center justify-center shrink-0">
              <VcIcon name="bag" size={28} stroke="#fff" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-clash font-bold text-[24px] tracking-[-.5px]">
                Start Selling
              </span>
              <span className="block text-[13px] text-white/85 mt-[3px]">
                Add items to a new order
              </span>
            </span>
            <VcIcon name="chevron" size={24} stroke="#fff" strokeWidth={2.6} className="shrink-0" />
          </button>

          {pendingHandovers.length > 0 ? (
            <button
              type="button"
              data-tour="handover-card"
              onClick={() => setHandoverOpen(true)}
              className="flex-1 min-h-[132px] border-none rounded-[20px] cursor-pointer bg-[linear-gradient(135deg,#FAC136_0%,#FFB800_100%)] text-[#1A1400] flex items-center gap-4 px-[22px] py-5 text-left shadow-[0_10px_24px_-8px_rgba(220,160,20,.5)] transition-transform hover:-translate-y-[2px]"
            >
              <span className="relative w-14 h-14 rounded-[16px] bg-black/10 inline-flex items-center justify-center shrink-0">
                <VcIcon name="truck" size={28} stroke="#1A1400" />
                <span className="absolute -top-1.5 -right-1.5 min-w-6 h-6 px-1.5 box-border rounded-full bg-[#1A1400] text-[#FAC136] inline-flex items-center justify-center font-clash font-bold text-[13px]">
                  {pendingHandovers.length}
                </span>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-clash font-bold text-[22px] tracking-[-.4px]">
                  Quick Handover
                </span>
                <span className="block text-[13px] text-[#1A1400]/[.78] mt-[3px]">
                  {pendingHandovers.length === 1
                    ? "1 paid order awaiting pickup"
                    : `${pendingHandovers.length} paid orders awaiting pickup`}
                </span>
              </span>
              <VcIcon name="chevron" size={24} stroke="#1A1400" strokeWidth={2.6} className="shrink-0" />
            </button>
          ) : (
            <div className="flex-1 min-h-[132px] rounded-[20px] border border-[#D8D8D8B3] bg-white flex items-center gap-4 px-[22px] py-5">
              <span className="w-14 h-14 rounded-[16px] bg-[#E7F4EB] inline-flex items-center justify-center shrink-0">
                <VcIcon name="check" size={27} stroke="#00681B" strokeWidth={2.2} />
              </span>
              <span>
                <span className="block font-clash font-bold text-[20px] tracking-[-.3px] text-[#2F2F2F]">
                  All handed over
                </span>
                <span className="block text-[13px] text-[#8E8E93] mt-[3px]">
                  No orders waiting for pickup.
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <QuickActionsStrip
        data-tour="shortcut-picker"
        actions={INVENTORY_ACTIONS}
        pinnedIds={pins}
        onEditShortcuts={() => setPickerOpen(true)}
      />

      <ShortcutPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        actions={INVENTORY_ACTIONS}
        pinnedIds={pins}
        onChange={setPins}
        onReset={resetPins}
      />

      {/* ── Recent sales ─────────────────────────────────────────────────── */}
      <section className="bg-white border border-[#E4E4E4] rounded-[20px] px-[22px] pt-5 pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="m-0 font-clash font-semibold text-[19px] tracking-[-.3px] text-[#2F2F2F]">
              Recent sales
            </h2>
            <p className="mt-1 text-[13px] text-[#8E8E93]">
              {showingFallback
                ? `No sales in ${periodLabel(period, range).toLowerCase()} — showing your most recent.`
                : "Online orders and in-store sales in one list."}
            </p>
          </div>

          <div className="flex items-center gap-[14px]">
            <div
              data-tour="sales-tabs"
              className="flex gap-1 bg-[#F4F5F7] p-1 rounded-full"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setChannelTab(tab.id)}
                  className={cn(
                    "border-none px-4 py-2 rounded-full text-[13px] cursor-pointer whitespace-nowrap",
                    channelTab === tab.id
                      ? "bg-white text-[#0A6DC0] font-bold shadow-[0_1px_3px_rgba(0,0,0,.10)]"
                      : "bg-transparent text-[#6B6B70] font-semibold hover:text-[#2F2F2F]",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => router.push("/inventory/sales")}
              className="text-[13px] font-bold text-[#0A6DC0] hover:underline"
            >
              See all
            </button>
          </div>
        </div>

        <div>
          {recentSalesLoading || onlineLoading ? (
            <p className="text-center text-[#8E8E93] py-6 text-[13px]">
              Loading sales...
            </p>
          ) : visibleRows.length > 0 ? (
            visibleRows.map((row, index) => (
              <SalesRow
                key={`${row.channel}-${row.id}`}
                row={row}
                hideAmounts={hideAmounts}
                first={index === 0}
                data-tour="sale-row"
              />
            ))
          ) : (
            <p className="text-center text-[#8E8E93] py-6 text-[13px]">
              No sales match this filter
            </p>
          )}
        </div>
      </section>

      {/* ── Quick Handover drawer ────────────────────────────────────────── */}
      <QuickHandoverDrawer
        open={handoverOpen}
        onClose={() => setHandoverOpen(false)}
        orders={pendingHandovers}
      />

      {/* ── Medium breakdown modal ───────────────────────────────────────── */}
      <MediumBreakdownModal
        open={mediumModalOpen}
        onOpenChange={setMediumModalOpen}
        breakdown={salesData?.mediumBreakdown}
        rangeLabel={`${periodLabel(period, range)} · ${storeLabel}`}
        loading={salesLoading}
        hideAmounts={hideAmounts}
      />
    </div>
  );
};

export default Home;
