"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import StockForm from "@/app/(dashboard)/inventory/my-store/chunks/StockForm";
import MarketplaceConditions, {
  MarketplaceCondition,
  BundleOption,
} from "./MarketplaceConditions";
import StockCreatedModal from "./StockCreatedModal";
import { saveNewConditions } from "@/lib/conditionSync";
import type { Store } from "@/types/store";

interface AddStockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: Store[];
  /** Empty string means "not chosen yet" — the sheet asks first. */
  storeId: string;
  onStoreChange: (storeId: string) => void;
  onSuccess: () => void;
  /** Products already stocked in this store, for the bundle picker. */
  bundleOptions?: BundleOption[];
}

const TabIcon = ({ paths }: { paths: React.ReactNode }) => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths}
  </svg>
);

/**
 * The Add Stock sheet: two tabs over one form, with a single footer action.
 * Chrome lives here rather than in StockForm so both tabs share the footer.
 */
export const AddStockSheet = ({
  open,
  onOpenChange,
  stores,
  storeId,
  onStoreChange,
  onSuccess,
  bundleOptions = [],
}: AddStockSheetProps) => {
  const [tab, setTab] = useState<"stock" | "conditions">("stock");
  const [conditions, setConditions] = useState<MarketplaceCondition[]>([]);
  const [formState, setFormState] = useState({ submitting: false, ready: false });
  // Set once the stock exists — until then conditions cannot be attached.
  const [created, setCreated] = useState<{
    id?: string;
    productName?: string;
    sellingPrice?: number;
  } | null>(null);
  const [showCreated, setShowCreated] = useState(false);
  const [savingConditions, setSavingConditions] = useState(false);

  const store = stores.find((s) => String(s.id) === storeId);

  React.useEffect(() => {
    if (!open) {
      setTab("stock");
      setConditions([]);
      setCreated(null);
      setShowCreated(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // A popover open inside the sheet should take Escape first, otherwise a
      // single press closes the whole sheet out from under the user.
      if (document.querySelector("[data-radix-popper-content-wrapper]")) return;
      onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onOpenChange]);

  const pendingConditions = conditions.filter((c) => c.id.startsWith("tmp-"));

  const finish = async () => {
    if (created?.id && pendingConditions.length) {
      setSavingConditions(true);
      const result = await saveNewConditions(
        created.id,
        conditions,
        created.sellingPrice,
      );
      setSavingConditions(false);
      if (result.failed.length) {
        toast.error(
          result.failed.length === 1
            ? result.failed[0].message
            : `${result.failed.length} rules could not be saved`,
        );
        if (result.saved === 0) return;
      } else {
        toast.success(
          result.saved === 1 ? "Rule saved" : `${result.saved} rules saved`,
        );
      }
    }
    onOpenChange(false);
    onSuccess();
  };

  if (!open) return null;

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-2 pb-3 -mb-px border-b-2 bg-transparent cursor-pointer text-[15px] ${
      active
        ? "border-[#0A6DC0] text-[#0A6DC0] font-bold"
        : "border-transparent text-[#565656] font-semibold hover:text-[#2F2F2F]"
    }`;

  return (
    <div className="fixed inset-0 z-[76] flex items-center justify-center px-6 py-8 font-dm-sans">
      <div
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-[rgba(10,37,64,.46)]"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[720px] bg-white rounded-[18px] shadow-[0_24px_70px_rgba(10,37,64,.2),0_4px_14px_rgba(10,37,64,.08)] flex flex-col max-h-[calc(100vh-110px)] overflow-hidden"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-[30px] pt-[26px] shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold tracking-[.05em] uppercase text-[#0A6DC0]">
                New stock item
              </div>
              <h2 className="mt-1.5 font-clash font-bold text-[26px] leading-[1.15] text-[#1F2328]">
                {store ? `Add Stock to ${store.name}` : "Add Stock"}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="shrink-0 w-9 h-9 border-none bg-[#F5F6F8] rounded-[10px] flex items-center justify-center cursor-pointer text-[#565656] hover:bg-[#E7E9ED]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {store && (
            <div className="flex gap-[30px] mt-[22px] border-b border-[#D8D8D88C]">
              <button
                type="button"
                onClick={() => setTab("stock")}
                className={tabClass(tab === "stock")}
              >
                <TabIcon
                  paths={
                    <>
                      <path d="M5 4h11l3 4v12a2 2 0 0 1-2 2H5z" />
                      <path d="M8 11h8M8 15h5" />
                    </>
                  }
                />
                Stock Details
              </button>
              <button
                type="button"
                data-tour="np-cond-tab"
                onClick={() => setTab("conditions")}
                className={tabClass(tab === "conditions")}
              >
                <TabIcon
                  paths={
                    <>
                      <path d="M3 7h18l-2 13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
                      <path d="M8 7V5a4 4 0 0 1 8 0v2" />
                    </>
                  }
                />
                Marketplace Rules
                {conditions.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#E8F2FF] text-[#0A6DC0] text-[11.5px] font-bold">
                    {conditions.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-[30px] py-[26px]">
          {!store ? (
            <div className="flex flex-col gap-2.5">
              <p className="text-[13.5px] text-[#565656]">
                Which store is this stock going into?
              </p>
              {stores.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onStoreChange(String(option.id))}
                  className="flex items-center justify-between gap-3 w-full text-left cursor-pointer px-4 py-[14px] rounded-[14px] border border-[#D8D8D8CC] bg-white hover:border-[#0A6DC0] hover:bg-[#F8FBFF] transition"
                >
                  <span className="font-bold text-[15px] text-[#1F2328]">
                    {option.name}
                  </span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#B9BCC2" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className={tab === "stock" ? "block" : "hidden"}>
                <StockForm
                  storeId={String(store.id)}
                  successToast={false}
                  onSuccess={(result) => {
                    setCreated(result ?? {});
                    setShowCreated(true);
                  }}
                  onStateChange={setFormState}
                />
              </div>
              <div
                data-tour="np-conditions"
                className={tab === "conditions" ? "block" : "hidden"}
              >
                <MarketplaceConditions
                  conditions={conditions}
                  onChange={setConditions}
                  bundleOptions={bundleOptions}
                  mode="add"
                  mainProductName={created?.productName}
                  locked={!created?.id}
                  lockedMessage="You cannot create a rule until the stock is added."
                />
              </div>
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        {store && (
          <div className="px-[30px] pb-[26px] pt-4 border-t border-[#D8D8D88C] shrink-0">
            {created?.id ? (
              <button
                type="button"
                onClick={finish}
                disabled={savingConditions}
                className="w-full h-[52px] rounded-[12px] border-none bg-[#0A6DC0] text-white font-bold text-[16px] cursor-pointer hover:bg-[#09599A] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2.5"
              >
                {savingConditions ? (
                  <>
                    <span className="w-[18px] h-[18px] rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    <span>Saving conditions…</span>
                  </>
                ) : pendingConditions.length ? (
                  `Save ${pendingConditions.length} rule${
                    pendingConditions.length === 1 ? "" : "s"
                  }`
                ) : (
                  "Done"
                )}
              </button>
            ) : (
            <button
              type="submit"
              form="add-stock-form"
              disabled={formState.submitting || !formState.ready}
              className="w-full h-[52px] rounded-[12px] border-none bg-[#0A6DC0] text-white font-bold text-[16px] cursor-pointer hover:bg-[#09599A] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2.5"
            >
              {formState.submitting ? (
                <>
                  <span className="w-[18px] h-[18px] rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  <span>Adding Stock…</span>
                </>
              ) : (
                "Add Stock"
              )}
            </button>
            )}
          </div>
        )}
      </div>

      <StockCreatedModal
        open={showCreated}
        productName={created?.productName}
        storeName={store?.name}
        onAddConditions={() => {
          setShowCreated(false);
          setTab("conditions");
        }}
        onGoBack={() => {
          setShowCreated(false);
          onOpenChange(false);
          onSuccess();
        }}
      />
    </div>
  );
};

export default AddStockSheet;
