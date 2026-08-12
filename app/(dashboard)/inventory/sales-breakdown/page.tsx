/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { useStores } from "@/hooks/useStores";
import { getStoreStockSales } from "@/lib/utils/api/apiHelper";
import {
  FilterDropdown,
  CustomRangeInputs,
} from "@/components/inventory/FilterDropdown";
import { VcIcon } from "@/components/inventory/VcIcon";
import { useSalesFilter } from "@/lib/salesFilterStore";
import {
  PERIOD_OPTIONS,
  PeriodId,
  formatNaira,
  periodLabel,
  resolvePeriod,
} from "@/lib/salesFilters";
import { formatQty } from "@/lib/priceInput";

interface ProductSale {
  product_name: string;
  product_image?: string;
  quantity: number;
  sub_total: number;
  mode: string;
}

interface StoreSales {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  products: ProductSale[];
}

/** Card shell shared by both panes. */
const PANEL =
  "bg-white border border-[#E4E4E4] rounded-[20px] p-[22px] min-w-0";

/** "1 pack", "6.5 packs", "12 pieces" — the endpoint has no pack size to split on. */
const unitLabel = (product: ProductSale): string => {
  const unit = (product.mode || "PACKS").toLowerCase() === "pieces"
    ? "piece"
    : "pack";
  return Number(product.quantity) === 1 ? unit : `${unit}s`;
};

const Divider = () => (
  <div className="h-px bg-[#D8D8D899] my-[18px]" aria-hidden="true" />
);

const SalesBreakdown = () => {
  const router = useRouter();
  const { data: stores = [] } = useStores();

  // The period is the one already chosen on the overview hero, not a 30-day
  // default — this page is reached straight from that hero.
  const { period, custom, setPeriod, setCustom } = useSalesFilter("today");
  const range = useMemo(() => resolvePeriod(period, custom), [period, custom]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [rows, setRows] = useState<StoreSales[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Mobile shows one pane at a time.
  const [showProducts, setShowProducts] = useState(false);

  useEffect(() => {
    if (stores.length === 0) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          stores.map(async (store) => {
            let products: ProductSale[] = [];
            try {
              const res = await getStoreStockSales(
                store.id,
                range.start,
                range.end,
              );
              if (res?.statusCode === 200 && Array.isArray(res.data)) {
                products = res.data;
              }
            } catch {
              // A store that fails still belongs in the list, at zero.
            }
            return {
              id: String(store.id),
              name: store.name,
              amount: products.reduce(
                (sum, item) => sum + (Number(item.sub_total) || 0),
                0,
              ),
              percentage: 0,
              products,
            };
          }),
        );

        if (cancelled) return;

        const grandTotal = results.reduce((sum, s) => sum + s.amount, 0);
        setRows(
          results
            .map((s) => ({
              ...s,
              percentage:
                grandTotal > 0
                  ? Math.round((s.amount / grandTotal) * 1000) / 10
                  : 0,
            }))
            .sort((a, b) => b.amount - a.amount),
        );
      } catch {
        if (!cancelled) toast.error("Failed to load store sales");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [stores, range.start, range.end]);

  // Keep a selection that still exists; otherwise fall to the top seller.
  useEffect(() => {
    if (rows.length === 0) return;
    if (selectedStoreId && rows.some((r) => r.id === selectedStoreId)) return;
    setSelectedStoreId(rows[0].id);
  }, [rows, selectedStoreId]);

  const total = rows.reduce((sum, s) => sum + s.amount, 0);
  const selected = rows.find((s) => s.id === selectedStoreId) ?? null;
  const label = periodLabel(period, range);

  return (
    <div className="font-dm-sans text-[#2F2F2F] flex flex-col gap-[22px]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="w-[42px] h-[42px] rounded-[12px] border border-[#D8D8D8E6] bg-white cursor-pointer inline-flex items-center justify-center shrink-0 mt-1 hover:border-[#0A6DC0]"
        >
          <VcIcon name="chevron" size={19} stroke="#2F2F2F" strokeWidth={2.2} className="rotate-180" />
        </button>

        <div className="flex-1 min-w-[260px]">
          <h1 className="font-clash font-semibold text-[24px] md:text-[30px] tracking-[-.6px] m-0">
            Sales Breakdown by Store
          </h1>
          <p className="text-[14.5px] text-[#8E8E93] mt-[5px] m-0">
            See how your stores made the total sales
          </p>
        </div>

        <div className="shrink-0 mt-1">
          <FilterDropdown
            variant="plain"
            open={menuOpen}
            onToggle={() => setMenuOpen(!menuOpen)}
            onClose={() => setMenuOpen(false)}
            buttonLabel={label}
            icon={<CalendarIcon size={17} />}
            options={PERIOD_OPTIONS}
            selectedId={period}
            onSelect={(id) => {
              setPeriod(id as PeriodId);
              if (id !== "custom") setMenuOpen(false);
            }}
            align="right"
            width={290}
          >
            {period === "custom" && (
              <CustomRangeInputs
                from={custom.start ?? range.start}
                to={custom.end ?? range.end}
                onFrom={(v) => setCustom({ start: v })}
                onTo={(v) => setCustom({ end: v })}
              />
            )}
          </FilterDropdown>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 items-start">
        {/* ── Stores ───────────────────────────────────────────────────── */}
        <div
          className={`${PANEL} flex-[1_1_360px] ${
            showProducts ? "hidden lg:block" : "block"
          }`}
        >
          <div className="font-clash font-semibold text-[18px] tracking-[-.3px]">
            Total sales: {formatNaira(total)} · {label}
          </div>
          <Divider />

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A6DC0]" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center text-[#8E8E93] py-10 text-[13.5px]">
              No stores to break down yet
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {rows.map((store) => {
                const active = store.id === selectedStoreId;
                return (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      setSelectedStoreId(store.id);
                      setShowProducts(true);
                    }}
                    className={`w-full box-border text-left cursor-pointer rounded-[14px] px-[18px] py-4 flex flex-col gap-3 ${
                      active
                        ? "border-[1.6px] border-[#0A6DC0] bg-[#F0F7FF]"
                        : "border border-[#D8D8D8CC] bg-white hover:border-[#4C87EB]"
                    }`}
                  >
                    <span className="flex items-start gap-[14px] w-full">
                      <VcIcon
                        name="storefront"
                        size={24}
                        stroke={active ? "#0A6DC0" : "#6E7480"}
                        strokeWidth={1.8}
                        className="shrink-0 mt-0.5"
                      />
                      <span className="flex-1 min-w-0">
                        <span className="flex items-baseline justify-between gap-3">
                          <span
                            className={`text-[16.5px] font-bold tracking-[-.2px] ${
                              active ? "text-[#0A6DC0]" : "text-[#2F2F2F]"
                            }`}
                          >
                            {store.name}
                          </span>
                          <span
                            className={`font-clash font-bold text-[16.5px] tracking-[-.3px] whitespace-nowrap ${
                              active ? "text-[#0A6DC0]" : "text-[#2F2F2F]"
                            }`}
                          >
                            {formatNaira(store.amount)}
                          </span>
                        </span>
                        <span
                          className={`block text-[13px] mt-1 ${
                            active ? "text-[#4C87EB]" : "text-[#8E8E93]"
                          }`}
                        >
                          {store.percentage}% of total sales
                        </span>
                      </span>
                    </span>

                    <span
                      className={`block w-full h-2 rounded-[4px] overflow-hidden ${
                        active ? "bg-[#0A6DC029]" : "bg-[#F1F2F4]"
                      }`}
                    >
                      <span
                        className={`block h-full rounded-[4px] ${
                          active ? "bg-[#0A6DC0]" : "bg-[#C3C8D0]"
                        }`}
                        style={{ width: `${store.percentage}%` }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Products in the selected store ───────────────────────────── */}
        <div
          className={`${PANEL} flex-[1_1_460px] ${
            showProducts ? "block" : "hidden lg:block"
          }`}
        >
          <button
            type="button"
            onClick={() => setShowProducts(false)}
            className="lg:hidden mb-3 inline-flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer text-[#0A6DC0] text-[13.5px] font-semibold"
          >
            <VcIcon name="chevron" size={16} stroke="#0A6DC0" strokeWidth={2.4} className="rotate-180" />
            Back to stores
          </button>

          <div className="font-clash font-semibold text-[18px] tracking-[-.3px]">
            Products Sold In Store
          </div>
          <Divider />

          <div className="font-clash font-bold text-[22px] md:text-[25px] tracking-[-.6px]">
            {selected ? `${selected.name} — ${formatNaira(selected.amount)}` : "—"}
          </div>
          <p className="text-[14px] text-[#8E8E93] mt-1.5 m-0">
            See what you sold to make profit in this store
          </p>

          <div className="mt-[18px] flex flex-col gap-2.5">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A6DC0]" />
              </div>
            ) : !selected || selected.products.length === 0 ? (
              <div className="border border-dashed border-[#D8D8D8E6] rounded-[14px] px-5 py-10 text-center">
                <div className="font-bold text-[15px] text-[#2F2F2F]">
                  Nothing sold here yet
                </div>
                <div className="text-[13px] text-[#8E8E93] mt-1">
                  This store made no sales in this range.
                </div>
              </div>
            ) : (
              selected.products.map((product, index) => {
                const image = product.product_image?.startsWith("//")
                  ? `https:${product.product_image}`
                  : product.product_image;

                return (
                  <div
                    key={`${product.product_name}-${index}`}
                    className="border border-[#D8D8D899] rounded-[14px] px-4 py-3 flex items-center gap-[14px]"
                  >
                    <span className="w-12 h-12 rounded-[11px] bg-[#F4F6F8] border border-[#D8D8D899] inline-flex items-center justify-center shrink-0 overflow-hidden">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.product_name}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <VcIcon name="bottle" size={22} stroke="#6E7480" strokeWidth={1.7} />
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold tracking-[-.2px] truncate">
                        {product.product_name}
                      </div>
                      <div className="text-[13px] text-[#8E8E93] mt-[3px]">
                        {formatQty(product.quantity)} {unitLabel(product)}
                      </div>
                    </div>

                    <span className="font-clash font-bold text-[16px] tracking-[-.3px] whitespace-nowrap">
                      {formatNaira(product.sub_total)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesBreakdown;
