/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { useStores } from "@/hooks/useStores";
import { useAllStoreStock, stockFlagOf } from "@/hooks/useAllStoreStock";
import { formatNaira } from "@/lib/salesFilters";
import { VcIcon } from "@/components/inventory/VcIcon";
import ProductThumb from "@/components/inventory/ProductThumb";
import AddNewSheet from "@/components/inventory/AddNewSheet";
import AddStockSheet from "@/components/inventory/AddStockSheet";
import ConfirmDeleteStockModal from "@/components/inventory/ConfirmDeleteStockModal";
import { bulkDeleteStocks } from "@/lib/utils/api/apiHelper";
import { useQueryClient } from "@tanstack/react-query";
import type { StoreStockItem } from "@/types/store";

type StockTab = "all" | "low" | "expiring";
type SortMode = "name" | "stock" | "value";

const SORT_LABEL: Record<SortMode, string> = {
  name: "A – Z",
  stock: "Stock low → high",
  value: "Highest value",
};

const FLAG_CHIP = {
  out: { label: "Out of stock", bg: "#FBE9E7", fg: "#C0392B" },
  low: { label: "Low stock", bg: "#FBE9E7", fg: "#C0392B" },
  expiring: { label: "Exp. soon", bg: "#FDEDE4", fg: "#C4531B" },
  ok: null,
} as const;

const MyStorePage = () => {
  const router = useRouter();

  const { data: stores = [], isLoading: storesLoading } = useStores();
  const { data: stock = [], isLoading: stockLoading } = useAllStoreStock(stores);

  const [storeId, setStoreId] = useState("all");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StockTab>("all");
  const [sort, setSort] = useState<SortMode>("name");
  const [hideAmounts, setHideAmounts] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addStockStore, setAddStockStore] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const loading = storesLoading || stockLoading;

  const scoped = useMemo(
    () =>
      storeId === "all"
        ? stock
        : stock.filter((item) => String(item.store?.id) === storeId),
    [stock, storeId],
  );

  const rows = useMemo(() => {
    let list = scoped;

    if (tab === "low") {
      list = list.filter((item) => ["low", "out"].includes(stockFlagOf(item)));
    } else if (tab === "expiring") {
      list = list.filter((item) => stockFlagOf(item) === "expiring");
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((item) =>
        `${item.product?.name ?? ""} ${item.sku ?? ""} ${item.store?.name ?? ""}`
          .toLowerCase()
          .includes(q),
      );
    }

    const sorted = [...list];
    if (sort === "name") {
      sorted.sort((a, b) =>
        (a.product?.name ?? "").localeCompare(b.product?.name ?? ""),
      );
    } else if (sort === "stock") {
      sorted.sort(
        (a, b) =>
          (parseFloat(a.quantity ?? "0") || 0) -
          (parseFloat(b.quantity ?? "0") || 0),
      );
    } else {
      sorted.sort(
        (a, b) =>
          (parseFloat(b.stock_value ?? "0") || 0) -
          (parseFloat(a.stock_value ?? "0") || 0),
      );
    }
    return sorted;
  }, [scoped, tab, query, sort]);

  const stats = useMemo(() => {
    let low = 0;
    let expiring = 0;
    let value = 0;
    for (const item of scoped) {
      const flag = stockFlagOf(item);
      if (flag === "low" || flag === "out") low += 1;
      if (flag === "expiring") expiring += 1;
      value += parseFloat(item.stock_value ?? "0") || 0;
    }
    return { products: scoped.length, low, expiring, value };
  }, [scoped]);

  const storeLabel =
    storeId === "all"
      ? "All stores"
      : (stores.find((s) => String(s.id) === storeId)?.name ?? "All stores");

  const allSelected = rows.length > 0 && selected.length === rows.length;

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const openStock = (item: StoreStockItem) =>
    router.push(`/inventory/my-store/${item.store?.id}/stock/${item.id}`);

  return (
    <div className="flex flex-col gap-[18px] max-w-[1360px]">
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
            My Store
          </h1>
          <p className="mt-[5px] text-[14px] text-[#8E8E93]">
            {stats.products} {stats.products === 1 ? "product" : "products"} ·{" "}
            {storeLabel}
          </p>
        </div>
        <button
          type="button"
          data-tour="store-add"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 h-11 px-[18px] rounded-[12px] border-none bg-[#0A6DC0] cursor-pointer text-[14px] font-bold text-white whitespace-nowrap hover:bg-[#09599A]"
        >
          <VcIcon name="plus" size={18} stroke="#fff" strokeWidth={2.4} />
          <span>Add New</span>
        </button>
      </div>

      {/* ── Store chips ──────────────────────────────────────────────────── */}
      <div className="flex gap-[9px] flex-wrap">
        {[{ id: "all", name: "All stores" }, ...stores].map((store) => {
          const active = storeId === String(store.id);
          return (
            <button
              key={store.id}
              type="button"
              onClick={() => {
                setStoreId(String(store.id));
                setSelected([]);
              }}
              className={`h-10 px-5 rounded-full text-[13.5px] cursor-pointer whitespace-nowrap border ${
                active
                  ? "border-[#0A6DC0] bg-[#0A6DC0] text-white font-bold"
                  : "border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-medium hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              }`}
            >
              {store.name}
            </button>
          );
        })}
      </div>

      {/* ── Stock value + stats ──────────────────────────────────────────── */}
      <div className="rounded-[18px] overflow-hidden bg-[linear-gradient(120deg,#0A2540_0%,#123F6B_60%,#2B5EA8_140%)] shadow-[0_12px_28px_-12px_rgba(10,37,64,.45)]">
        <div className="px-6 pt-5 pb-[18px]">
          <div className="flex items-center gap-2.5">
            <span className="text-[11.5px] font-bold tracking-[1.1px] uppercase text-white/[.66]">
              Total stock value
            </span>
            <button
              type="button"
              aria-label="Toggle amounts"
              onClick={() => setHideAmounts((v) => !v)}
              className="w-6 h-6 rounded-full border-none bg-white/15 cursor-pointer inline-flex items-center justify-center"
            >
              {hideAmounts ? (
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 3 18 18" />
                  <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
                  <path d="M6.8 6.9C4 8.6 2 12 2 12s4 7 10 7c1.6 0 3-.3 4.3-.9" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <div className="font-clash font-bold text-[clamp(32px,3.4vw,46px)] tracking-[-1.4px] leading-[1.05] text-white mt-1">
            {formatNaira(stats.value, hideAmounts)}
          </div>
        </div>
        <div className="flex border-t border-white/[.12] flex-wrap">
          {[
            { label: "Products", value: stats.products, color: "#fff" },
            { label: "Low stock", value: stats.low, color: "#FFB4A8" },
            { label: "Exp. soon", value: stats.expiring, color: "#FFD37A" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[120px] px-6 py-4 border-l border-white/[.12]"
            >
              <div className="text-[12.5px] text-white/[.68] font-medium">
                {stat.label}
              </div>
              <div
                className="font-clash font-bold text-[24px] tracking-[-.5px] mt-[3px]"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <label className="flex items-center gap-[11px] h-12 px-4 box-border rounded-[12px] border border-[#D8D8D8E6] bg-white">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
        <input
          data-tour="store-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, SKU or store"
          className="flex-1 min-w-0 border-none outline-none bg-transparent text-[14.5px] text-[#2F2F2F]"
        />
      </label>

      {/* ── Tabs + selection controls ────────────────────────────────────── */}
      <div className="flex items-center gap-[9px] flex-wrap">
        {(
          [
            { id: "all", label: `All ${scoped.length}` },
            { id: "low", label: `Low stock ${stats.low}` },
            { id: "expiring", label: `Exp. soon ${stats.expiring}` },
          ] as { id: StockTab; label: string }[]
        ).map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`h-[38px] px-[18px] rounded-full text-[13px] cursor-pointer whitespace-nowrap border ${
                active
                  ? "border-[#0A2540] bg-[#0A2540] text-white font-bold"
                  : "border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-medium hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              }`}
            >
              {t.label}
            </button>
          );
        })}

        <div className="flex-1" />

        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="h-[38px] px-4 rounded-full border border-[#D8D8D8E6] bg-white text-[#6B6B70] text-[13px] font-semibold cursor-pointer hover:text-[#2F2F2F]"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            setSelected(allSelected ? [] : rows.map((item) => item.id))
          }
          className="h-[38px] px-4 rounded-full border border-[#D8D8D8E6] bg-white text-[#2F2F2F] text-[13px] font-semibold cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
        <button
          type="button"
          onClick={() =>
            setSort((prev) =>
              prev === "name" ? "stock" : prev === "stock" ? "value" : "name",
            )
          }
          className="inline-flex items-center gap-2 h-[38px] px-4 rounded-full border border-[#D8D8D8E6] bg-white text-[#2F2F2F] text-[13px] font-semibold cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
        >
          <VcIcon name="list" size={15} />
          <span>{SORT_LABEL[sort]}</span>
        </button>
      </div>

      {/* ── Selection bar ────────────────────────────────────────────────── */}
      {/* ── Product rows ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <ClipLoader color="#0A6DC0" size={32} />
        </div>
      ) : rows.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {rows.map((item) => {
            const flag = stockFlagOf(item);
            const chip = FLAG_CHIP[flag];
            const qty = parseFloat(item.quantity ?? "0") || 0;
            const isSelected = selected.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-[16px] py-[14px] px-[18px] flex items-center gap-[14px] flex-wrap transition ${
                  isSelected
                    ? "border-[#0A6DC0] bg-[#F9FCFF]"
                    : "border-[#D8D8D88C] hover:border-[#0A6DC0]"
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`Select ${item.product?.name ?? "product"}`}
                  onClick={() => toggleSelect(item.id)}
                  className={`w-[22px] h-[22px] rounded-full inline-flex items-center justify-center shrink-0 cursor-pointer transition ${
                    isSelected
                      ? "bg-[#0A6DC0] border-none"
                      : "bg-white border-[1.6px] border-[#D2D6DC] hover:border-[#0A6DC0]"
                  }`}
                >
                  {isSelected && (
                    <VcIcon name="check" size={13} stroke="#fff" strokeWidth={3} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => openStock(item)}
                  className="flex items-center gap-[13px] flex-[1_1_240px] min-w-0 text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <ProductThumb
                    src={item.product?.image}
                    alt={item.product?.name ?? "Product"}
                    size={46}
                  />
                  <span className="min-w-0">
                    <span className="block font-bold text-[14.5px] text-[#2F2F2F] tracking-[-.2px] truncate">
                      {item.product?.name ?? "Product"}
                    </span>
                    {chip && (
                      <span
                        className="inline-block text-[11px] font-bold px-[9px] py-[2px] rounded-full mt-1"
                        style={{ background: chip.bg, color: chip.fg }}
                      >
                        {chip.label}
                      </span>
                    )}
                    <span className="block text-[12.5px] text-[#8E8E93] mt-[3px] truncate">
                      {item.store?.name ?? "—"} · SKU {item.sku || "—"}
                    </span>
                  </span>
                </button>

                <span className="text-right shrink-0 min-w-[110px]">
                  <span className="block text-[13px] text-[#6E7480]">
                    {formatNaira(
                      parseFloat(item.selling_price ?? "0") || 0,
                      hideAmounts,
                    )}
                  </span>
                  <span
                    className="block font-clash font-bold text-[22px] tracking-[-.4px] leading-tight mt-0.5"
                    style={{
                      color:
                        flag === "out" || flag === "low" ? "#C0392B" : "#2F2F2F",
                    }}
                  >
                    {qty}
                  </span>
                </span>

                <VcIcon
                  name="chevron"
                  size={18}
                  stroke="#B9BCC2"
                  strokeWidth={2.4}
                  className="shrink-0"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[16px] py-10 px-5 text-center">
          <div className="font-bold text-[15px] text-[#2F2F2F]">
            No products match this view
          </div>
          <div className="text-[13px] text-[#8E8E93] mt-1">
            Try another store, tab or search term.
          </div>
        </div>
      )}

      {/* Floating rather than inserted: pushing the list down mid-selection
          moves the next row out from under the cursor. Fixed rather than
          sticky because an ancestor's overflow breaks sticky here. */}
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(680px,92vw)] flex items-center gap-3 flex-wrap bg-[#0A2540] rounded-[16px] px-4 py-3 shadow-[0_16px_40px_-12px_rgba(10,37,64,.55)]">
          <span className="inline-flex items-center gap-2.5 text-[13.5px] font-bold text-white">
            <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 rounded-full bg-white/[.16] text-white text-[13px]">
              {selected.length}
            </span>
            <span>
              {selected.length === 1 ? "product" : "products"} selected
            </span>
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => {
              const picked = rows.filter((item) => selected.includes(item.id));
              const storeIds = new Set(picked.map((item) => item.store?.id));
              if (storeIds.size > 1) {
                toast.error("Pick products from one store to move them");
                return;
              }
              const targetStore = picked[0]?.store?.id;
              if (!targetStore) return;
              // The move screen reads its payload from sessionStorage — this is
              // the same handoff the store detail page uses, left untouched.
              sessionStorage.setItem(
                "selectedStocksToMove",
                JSON.stringify(picked),
              );
              router.push(`/inventory/my-store/${targetStore}/moveStock`);
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] border-none bg-white/[.14] text-white text-[13.5px] font-bold cursor-pointer hover:bg-white/[.24]"
          >
            <VcIcon name="list" size={16} stroke="#fff" strokeWidth={2.2} />
            Move stock
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] border-none bg-[#E4694F] text-white text-[13.5px] font-bold cursor-pointer hover:bg-[#C0392B]"
          >
            <VcIcon name="warning" size={16} stroke="#fff" strokeWidth={2.2} />
            Delete
          </button>
        </div>
      )}

      <ConfirmDeleteStockModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        names={rows
          .filter((item) => selected.includes(item.id))
          .map((item) => item.product?.name ?? "Product")}
        onConfirm={async () => {
          try {
            const response = await bulkDeleteStocks(selected);
            const ok =
              response?.statusCode === 200 ||
              response?.statusCode === 201 ||
              response?.status === true ||
              response?.success;
            if (!ok) {
              toast.error(
                response?.error || response?.message || "Could not delete stock",
              );
              return;
            }
            toast.success(
              `${selected.length} ${selected.length === 1 ? "product" : "products"} deleted`,
            );
            setSelected([]);
            setDeleteOpen(false);
            queryClient.invalidateQueries({ queryKey: ["stores", "stock"] });
          } catch (err: any) {
            toast.error(
              err?.response?.data?.message ||
                err?.message ||
                "Could not delete stock",
            );
          }
        }}
      />

      <AddNewSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onAddProduct={() => {
          setAddOpen(false);
          // Adding stock needs a specific store; use the active chip when there
          // is one, otherwise let them choose inside the sheet.
          setAddStockStore(storeId === "all" ? "" : storeId);
        }}
      />

      <AddStockSheet
        open={addStockStore !== null}
        onOpenChange={(next) => setAddStockStore(next ? addStockStore : null)}
        stores={stores}
        storeId={addStockStore ?? ""}
        onStoreChange={setAddStockStore}
        onSuccess={() => {
          setAddStockStore(null);
          queryClient.invalidateQueries({ queryKey: ["stores", "stock"] });
        }}
      />
    </div>
  );
};

export default MyStorePage;
