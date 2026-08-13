"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePaymentSocket } from "@/hooks/invoiceSocket";
import { useSales } from "@/hooks/useInventoryOverview";
import { usePurchaseRequests } from "@/hooks/usePurchaseRequests";
import { useSalesData } from "@/hooks/useInventoryOverview";
import {
  PERIOD_OPTIONS,
  PeriodId,
  formatNaira,
  isWithinRange,
  periodLabel,
  resolvePeriod,
} from "@/lib/salesFilters";
import {
  SalesRowData,
  purchaseRequestToRow,
  saleInvoiceToRow,
} from "@/lib/salesRows";
import SalesLogRow from "@/components/inventory/SalesLogRow";
import { useSalesFilter } from "@/lib/salesFilterStore";
import FilterDropdown, {
  CustomRangeInputs,
} from "@/components/inventory/FilterDropdown";
import { VcIcon, CalendarIcon } from "@/components/inventory/VcIcon";
import MediumBreakdownModal from "@/components/inventory/MediumBreakdownModal";

type ChannelTab = "all" | "online" | "instore";
type StatusFilter = "all" | "pending" | "awaiting";

const SalesHistoryPage = () => {
  const router = useRouter();

  const [hideAmounts, setHideAmounts] = useState(false);
  // Defaults to the last week here; a choice made on either surface carries
  // across navigation via the shared store.
  const { period, custom, storeId, setPeriod, setCustom, setStoreId } =
    useSalesFilter("week");
  const customStart = custom.start ?? "";
  const customEnd = custom.end ?? "";
  const [openMenu, setOpenMenu] = useState<"period" | "store" | null>(null);
  const [channelTab, setChannelTab] = useState<ChannelTab>("all");
  const [query, setQuery] = useState("");
  const [mediumModalOpen, setMediumModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const range = useMemo(
    () => resolvePeriod(period, { start: customStart, end: customEnd }),
    [period, customStart, customEnd],
  );

  const {
    data: allSales = [],
    isLoading: salesLoading,
    error: salesError,
    refetch,
  } = useSales();
  const {
    data: onlineOrders = [],
    isLoading: onlineLoading,
    error: onlineError,
  } = usePurchaseRequests();
  const { data: salesData } = useSalesData(range.start, range.end);

  useEffect(() => {
    if (salesError) toast.error("Failed to load in-store sales");
    if (onlineError) toast.error("Failed to load online sales");
  }, [salesError, onlineError]);

  // Live payment updates — unchanged behaviour from the previous page.
  const { isConnected } = usePaymentSocket((paymentData) => {
    if (paymentData.type === "invoice") {
      refetch();
      if (paymentData.status === "success") {
        toast.success(
          `Invoice #${paymentData.id.slice(0, 8)} payment successful!`,
        );
      } else if (paymentData.status === "failed") {
        toast.error(`Payment failed for invoice #${paymentData.id.slice(0, 8)}`);
      }
    }
  });

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
      allSales
        .filter((inv: any) => isWithinRange(inv.created_at, range))
        .map(saleInvoiceToRow)
        .filter((row) => matchesStore(row.storeId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSales, range, storeId],
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

  const channelRows = useMemo(() => {
    const source =
      channelTab === "online"
        ? onlineRows
        : channelTab === "instore"
          ? inStoreRows
          : [...inStoreRows, ...onlineRows];
    return [...source].sort(byNewest);
  }, [channelTab, inStoreRows, onlineRows]);

  // Unpaid orders and orders still owing a handover are separate concerns —
  // an order can be paid but not handed over, and vice versa.
  const statusRows = useMemo(() => {
    if (statusFilter === "pending") {
      return channelRows.filter(
        (row) => row.statusLabel.toLowerCase() === "pending",
      );
    }
    if (statusFilter === "awaiting") {
      return channelRows.filter((row) => row.awaitingHandover);
    }
    return channelRows;
  }, [channelRows, statusFilter]);

  // Search matches customer name and invoice code, per §4.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return statusRows;
    return statusRows.filter((row) =>
      `${row.customerName} ${row.code}`.toLowerCase().includes(q),
    );
  }, [statusRows, query]);

  const pendingCount = useMemo(
    () =>
      channelRows.filter((row) => row.statusLabel.toLowerCase() === "pending")
        .length,
    [channelRows],
  );
  const awaitingCount = useMemo(
    () => channelRows.filter((row) => row.awaitingHandover).length,
    [channelRows],
  );

  // Totals follow the current filter, so they are summed from the rows shown.
  const total = useMemo(
    () => rows.reduce((sum, row) => sum + row.amount, 0),
    [rows],
  );

  const tabs: { id: ChannelTab; label: string }[] = [
    { id: "all", label: `All ${[...inStoreRows, ...onlineRows].length}` },
    { id: "online", label: `Online ${onlineRows.length}` },
    { id: "instore", label: `Shop ${inStoreRows.length}` },
  ];

  const periodOptions = PERIOD_OPTIONS.map((p) => ({
    id: p.id,
    label: p.label,
  }));
  const storeOptions = [
    { id: "all", label: "All stores" },
    ...stores.map((s) => ({ id: String(s.store_id), label: s.store_name })),
  ];

  const loading = salesLoading || onlineLoading;

  return (
    <div className="flex flex-col gap-5 max-w-[1360px]">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-[14px] flex-wrap">
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.push("/inventory/overview")}
          className="w-[42px] h-[42px] rounded-[12px] border border-[#D8D8D8E6] bg-white cursor-pointer inline-flex items-center justify-center shrink-0 hover:border-[#0A6DC0]"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#2F2F2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="m-0 font-clash font-semibold text-[28px] tracking-[-.5px] text-[#2F2F2F]">
            Sales History
          </h1>
          <p className="mt-[5px] text-[14px] text-[#8E8E93]">
            {periodLabel(period, range)} · {storeLabel}
          </p>
        </div>
        {isConnected && (
          <span className="inline-flex items-center gap-2 text-[12px] font-bold text-[#0E6E55] bg-[#E7F4EB] px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Live
          </span>
        )}
      </div>

      {/* ── Total card ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[20px] px-6 py-[22px] text-white bg-[linear-gradient(135deg,#0A6DC0_0%,#3A6BC4_100%)] shadow-[0_12px_28px_-10px_rgba(10,109,192,.45)]">
        <div className="absolute -top-[70px] -right-[50px] w-[220px] h-[220px] rounded-full bg-white/[.06] pointer-events-none" />
        <div className="relative flex items-start gap-6 flex-wrap">
          <div className="flex-[1_1_240px] min-w-0">
            <div className="flex items-center gap-[10px]">
              <span className="text-[13px] font-medium text-white/85">
                Total sales
              </span>
              <button
                type="button"
                aria-label="Toggle amounts"
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
            <div className="font-clash font-bold text-[clamp(28px,3vw,40px)] tracking-[-1px] leading-[1.05] mt-1.5 whitespace-nowrap">
              {formatNaira(total, hideAmounts)}
            </div>
            <div className="text-[12.5px] text-white/75 mt-1.5">
              {rows.length.toLocaleString("en-NG")}{" "}
              {rows.length === 1 ? "sale" : "sales"} · {storeLabel}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.push("/inventory/sales-breakdown")}
              className="inline-flex items-center gap-2 h-[38px] px-[14px] rounded-full border border-white/[.32] bg-white/15 text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap hover:bg-white/[.28]"
            >
              <span>Breakdown by Store</span>
              <VcIcon name="chevron" size={14} stroke="#fff" strokeWidth={2.6} />
            </button>
            <button
              type="button"
              onClick={() => setMediumModalOpen(true)}
              className="inline-flex items-center gap-2 h-[38px] px-[14px] rounded-full border border-white/[.32] bg-white/15 text-white text-[12.5px] font-semibold cursor-pointer whitespace-nowrap hover:bg-white/[.28]"
            >
              <span>Breakdown by channel</span>
              <VcIcon name="chevron" size={14} stroke="#fff" strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-[10px] flex-wrap">
        <FilterDropdown
          variant="plain"
          open={openMenu === "period"}
          onToggle={() => setOpenMenu(openMenu === "period" ? null : "period")}
          onClose={() => setOpenMenu(null)}
          buttonLabel={periodLabel(period, range)}
          icon={<CalendarIcon size={17} />}
          options={periodOptions}
          selectedId={period}
          onSelect={(id) => {
            setPeriod(id as PeriodId);
            if (id !== "custom") setOpenMenu(null);
          }}
          width={290}
        >
          {period === "custom" && (
            <CustomRangeInputs
              from={customStart}
              to={customEnd}
              onFrom={(v) => setCustom({ start: v })}
              onTo={(v) => setCustom({ end: v })}
            />
          )}
        </FilterDropdown>

        <FilterDropdown
          variant="plain"
          open={openMenu === "store"}
          onToggle={() => setOpenMenu(openMenu === "store" ? null : "store")}
          onClose={() => setOpenMenu(null)}
          buttonLabel={storeLabel}
          icon={<VcIcon name="storefront" size={17} strokeWidth={1.9} />}
          options={storeOptions}
          selectedId={storeId}
          onSelect={(id) => {
            setStoreId(id);
            setOpenMenu(null);
          }}
        />

        <label
          data-tour="store-search"
          className="flex-[1_1_220px] min-w-0 flex items-center gap-[10px] h-[42px] px-[14px] box-border rounded-[10px] border border-[#D8D8D8E6] bg-white"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice or customer"
            className="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] text-[#2F2F2F]"
          />
        </label>
      </div>

      {/* ── Channel tabs ─────────────────────────────────────────────────── */}
      <div
        data-tour="page-tabs"
        className="flex gap-1 bg-[#F4F5F7] p-1 rounded-full self-start flex-wrap"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setChannelTab(tab.id)}
            className={cn(
              "border-none px-[18px] py-[9px] rounded-full text-[13.5px] cursor-pointer whitespace-nowrap",
              channelTab === tab.id
                ? "bg-white text-[#0A6DC0] font-bold shadow-[0_1px_3px_rgba(0,0,0,.10)]"
                : "bg-transparent text-[#6B6B70] font-semibold hover:text-[#2F2F2F]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Status filters ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap -mt-1">
        {(
          [
            { id: "all", label: "All statuses", count: channelRows.length, tone: "#6B6B70", bg: "#F4F5F7" },
            { id: "pending", label: "Pending payment", count: pendingCount, tone: "#85540A", bg: "#FFF3DB" },
            { id: "awaiting", label: "Awaiting handover", count: awaitingCount, tone: "#0A6DC0", bg: "#E1EEFF" },
          ] as { id: StatusFilter; label: string; count: number; tone: string; bg: string }[]
        ).map((chip) => {
          const active = statusFilter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatusFilter(chip.id)}
              className={cn(
                "inline-flex items-center gap-2 h-9 px-[14px] rounded-full text-[13px] font-semibold cursor-pointer border transition",
                active
                  ? "border-transparent"
                  : "bg-white border-[#D8D8D8E6] text-[#6B6B70] hover:border-[#0A6DC0] hover:text-[#0A6DC0]",
              )}
              style={active ? { background: chip.bg, color: chip.tone } : undefined}
            >
              <span>{chip.label}</span>
              <span
                className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11.5px] font-bold"
                style={{
                  background: active ? "rgba(255,255,255,.65)" : "#F4F5F7",
                  color: active ? chip.tone : "#6B6B70",
                }}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Rows ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-[10px]">
        {loading ? (
          <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[16px] py-10 px-5 text-center">
            <div className="font-bold text-[15px] text-[#2F2F2F]">
              Loading sales…
            </div>
          </div>
        ) : rows.length > 0 ? (
          rows.map((row) => (
            <SalesLogRow
              key={`${row.channel}-${row.id}`}
              row={row}
              hideAmounts={hideAmounts}
            />
          ))
        ) : (
          <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[16px] py-10 px-5 text-center">
            <div className="font-bold text-[15px] text-[#2F2F2F]">
              No sales match this view
            </div>
            <div className="text-[13px] text-[#8E8E93] mt-1">
              Try another channel, status, range or search term.
            </div>
          </div>
        )}
      </div>

      <MediumBreakdownModal
        open={mediumModalOpen}
        onOpenChange={setMediumModalOpen}
        breakdown={salesData?.mediumBreakdown}
        rangeLabel={`${periodLabel(period, range)} · ${storeLabel}`}
        hideAmounts={hideAmounts}
      />
    </div>
  );
};

export default SalesHistoryPage;
