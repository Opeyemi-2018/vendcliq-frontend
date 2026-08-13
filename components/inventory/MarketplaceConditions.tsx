"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { uploadImage, UPLOAD_ACCEPT, MAX_UPLOAD_BYTES } from "@/lib/uploadImage";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import ProductThumb from "./ProductThumb";

export type ConditionType =
  | "discount"
  | "free_delivery"
  | "minimum_qty"
  | "bundle"
  | "free_gift";

export type GiftType = "same_stock" | "other_stock" | "external_item";

export interface FreeGiftDraft {
  gift_type: GiftType;
  quantity?: number;
  stock_id?: string;
  item_name?: string;
  item_description?: string;
  external_image?: string;
}

export interface MarketplaceCondition {
  id: string;
  type: ConditionType;
  active: boolean;
  triggerQty?: number;
  discountMode?: "percent" | "naira";
  discountValue?: number;
  minimumQty?: number;
  bundleProduct?: string;
  bundleStockId?: string;
  bundleMainQty?: number;
  bundleRatioMain?: number;
  bundleRatioBundle?: number;
  bundleFallback?: "terminate" | "allow";
  gifts?: FreeGiftDraft[];
}

export interface BundleOption {
  /** Stock id, sent as bundled_stock_id. */
  id?: string;
  name: string;
  pack?: string;
  image?: string | null;
}

/* Icons drawn to match the prototype's picker cards. */
const Ic = {
  discount: (
    <>
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
      <path d="M18 6 6 18" />
    </>
  ),
  delivery: (
    <>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  minqty: (
    <>
      <path d="M12 4v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  bundle: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
      <path d="M11 7.5h3a3 3 0 0 1 3 3v3" />
    </>
  ),
  gift: (
    <>
      <path d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M3 7.5h18V11H3z" />
      <path d="M12 7.5V21" />
      <path d="M12 7.5S10.5 3 8.2 3a2.2 2.2 0 0 0 0 4.5H12Z" />
      <path d="M12 7.5S13.5 3 15.8 3a2.2 2.2 0 0 1 0 4.5H12Z" />
    </>
  ),
  bag: (
    <>
      <path d="M3 7h18l-2 13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M8 7V5a4 4 0 0 1 8 0v2" />
    </>
  ),
};

const Glyph = ({
  paths,
  size = 20,
  width = 1.8,
}: {
  paths: React.ReactNode;
  size?: number;
  width?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths}
  </svg>
);

const TYPES: {
  id: ConditionType;
  label: string;
  sub: string;
  icon: React.ReactNode;
}[] = [
  { id: "discount", label: "Price discount", sub: "Bulk-buy price cuts", icon: Ic.discount },
  { id: "free_delivery", label: "Free delivery", sub: "Delivery waived on big orders", icon: Ic.delivery },
  { id: "minimum_qty", label: "Minimum quantity", sub: "Buyers must order at least this much", icon: Ic.minqty },
  { id: "bundle", label: "Bundle products", sub: "Require another product alongside", icon: Ic.bundle },
  { id: "free_gift", label: "Free gift", sub: "Buy enough and get something free", icon: Ic.gift },
];

const iconOf = (type: ConditionType) =>
  TYPES.find((t) => t.id === type)?.icon ?? Ic.bag;
const labelOf = (type: ConditionType) =>
  TYPES.find((t) => t.id === type)?.label ?? "Condition";

export const summarise = (c: MarketplaceCondition, unit = "packs"): string => {
  switch (c.type) {
    case "discount":
      return `Buy ${c.triggerQty ?? 0}+ ${unit}, get ${
        c.discountMode === "naira"
          ? `₦${(c.discountValue ?? 0).toLocaleString("en-NG")} per pack`
          : `${c.discountValue ?? 0}% off`
      }`;
    case "free_delivery":
      return `Free delivery on ${c.triggerQty ?? 0}+ ${unit}`;
    case "minimum_qty":
      return `Minimum order: ${c.minimumQty ?? 0} ${unit}`;
    case "bundle":
      return `Requires ${c.bundleProduct || "another product"} at ${
        c.bundleRatioMain ?? 1
      }:${c.bundleRatioBundle ?? 1}, minimum ${c.bundleMainQty ?? 0} ${unit}`;
    case "free_gift": {
      const gift = c.gifts?.[0];
      const what =
        gift?.gift_type === "external_item"
          ? gift.item_name || "a gift"
          : gift?.gift_type === "other_stock"
            ? `${gift.quantity ?? 1} of another product`
            : `${gift?.quantity ?? 1} free ${unit}`;
      return `Buy ${c.triggerQty ?? 0}+ ${unit}, get ${what}`;
    }
  }
};

const LABEL = "block text-[13px] font-semibold text-[#1F2328] mb-2";
const INPUT =
  "w-full box-border h-[46px] px-[14px] rounded-[10px] border border-[#D8D8D8B3] bg-white text-[14px] text-[#2F2F2F] outline-none focus:border-[#0A6DC0] placeholder:text-[#8E8E93]";

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  invalid,
  hint,
}: {
  label?: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  invalid?: boolean;
  hint?: string;
}) => (
  <div>
    {label ? <label className={LABEL}>{label}</label> : null}
    <input
      type="number"
      min={0}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) =>
        onChange(e.target.value === "" ? undefined : Number(e.target.value))
      }
      className={`${INPUT} ${invalid ? "!border-[#C83C3C]" : ""}`}
    />
    {hint && <div className="text-[12px] text-[#C83C3C] mt-[7px]">{hint}</div>}
  </div>
);

const StepLabel = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 text-[13.5px] font-bold text-[#1F2328] mb-2.5">
    <span className="w-[22px] h-[22px] rounded-full bg-[#0A6DC0] text-white inline-flex items-center justify-center text-[12px] font-bold shrink-0">
      {n}
    </span>
    {children}
  </div>
);

interface MarketplaceConditionsProps {
  conditions: MarketplaceCondition[];
  onChange: (next: MarketplaceCondition[]) => void;
  bundleOptions?: BundleOption[];
  mode?: "add" | "edit";
  unit?: string;
  mainProductName?: string;
  /**
   * Conditions attach to a stock id, so they cannot be created before the stock
   * exists. When locked the flows stay browsable but saving is blocked.
   */
  locked?: boolean;
  lockedMessage?: string;
}

export const MarketplaceConditions = ({
  conditions,
  onChange,
  bundleOptions = [],
  mode = "add",
  unit = "packs",
  mainProductName = "this product",
  locked = false,
  lockedMessage = "Add the stock first — conditions attach to a saved product.",
}: MarketplaceConditionsProps) => {
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState<MarketplaceCondition | null>(null);
  const [touched, setTouched] = useState(false);
  const [bundleOpen, setBundleOpen] = useState(false);
  const [bundleSearch, setBundleSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const selectedBundle = useMemo(
    () => bundleOptions.find((o) => o.name === draft?.bundleProduct),
    [bundleOptions, draft?.bundleProduct],
  );

  const filteredBundles = useMemo(() => {
    const q = bundleSearch.trim().toLowerCase();
    return bundleOptions
      .filter((o) => o.name !== mainProductName)
      .filter((o) => !q || o.name.toLowerCase().includes(q));
  }, [bundleOptions, bundleSearch, mainProductName]);

  const start = (type: ConditionType) => {
    setPicking(false);
    setTouched(false);
    setDraft({
      id: `tmp-${Date.now()}`,
      type,
      active: true,
      discountMode: "percent",
      bundleRatioMain: 1,
      bundleRatioBundle: 1,
      bundleFallback: "terminate",
      gifts:
        type === "free_gift"
          ? [{ gift_type: "same_stock", quantity: 1 }]
          : undefined,
    });
  };

  const valid = (() => {
    if (!draft) return false;
    switch (draft.type) {
      case "discount":
        return Boolean(draft.triggerQty && draft.discountValue);
      case "free_delivery":
        return Boolean(draft.triggerQty);
      case "minimum_qty":
        return Boolean(draft.minimumQty);
      case "bundle":
        return Boolean(draft.bundleProduct && draft.bundleMainQty);
      case "free_gift": {
        const g = draft.gifts?.[0];
        if (!draft.triggerQty || !g) return false;
        return g.gift_type === "external_item"
          ? Boolean(g.item_name)
          : Boolean(g.quantity);
      }
    }
  })();

  const save = () => {
    setTouched(true);
    if (locked) {
      toast.error(lockedMessage);
      return;
    }
    if (!draft || !valid) return;
    const exists = conditions.some((c) => c.id === draft.id);
    onChange(
      exists
        ? conditions.map((c) => (c.id === draft.id ? draft : c))
        : [...conditions, draft],
    );
    setDraft(null);
    toast.success("Condition saved");
  };

  const panel =
    "border border-[#D8D8D8B3] rounded-[14px] p-[18px] bg-[#FAFBFC] flex flex-col gap-[18px]";
  const cancelBtn =
    "bg-transparent border-none cursor-pointer text-[#8E8E93] text-[13px] font-semibold inline-flex items-center gap-1 hover:text-[#2F2F2F]";

  return (
    <div className="flex flex-col gap-[18px]">
      {locked && (
        <div className="flex items-start gap-2.5 rounded-[12px] border border-[#F2D9A0] bg-[#FFF3DB] px-4 py-3">
          <Glyph
            paths={
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16.5v.01" />
              </>
            }
            size={17}
            width={1.9}
          />
          <p className="text-[13px] text-[#85540A] leading-[1.5] m-0">
            {lockedMessage} Look through the options here, then come back once
            the stock is saved.
          </p>
        </div>
      )}

      {mode === "edit" && conditions.length > 0 && (
        <p className="text-[13px] text-[#565656] leading-[1.55]">
          These conditions are live on the marketplace. Pause one to stop it
          without losing its setup.
        </p>
      )}

      {conditions.map((condition) => (
        <div
          key={condition.id}
          className="border border-[#D8D8D8B3] rounded-[14px] p-4 flex items-start gap-3"
          style={{ opacity: condition.active ? 1 : 0.6 }}
        >
          <span className="w-10 h-10 rounded-[10px] bg-[#E8F2FF] text-[#0A6DC0] inline-flex items-center justify-center shrink-0">
            <Glyph paths={iconOf(condition.type)} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14px] text-[#1F2328]">
              {labelOf(condition.type)}
            </div>
            <div className="text-[12.5px] text-[#565656] mt-0.5">
              {summarise(condition, unit)}
            </div>
            {condition.type === "bundle" && (
              <div className="text-[12px] text-[#8E8E93] mt-1">
                If bundle stock runs out:{" "}
                {condition.bundleFallback === "allow"
                  ? "order continues without it"
                  : "order is held"}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                onChange(
                  conditions.map((c) =>
                    c.id === condition.id ? { ...c, active: !c.active } : c,
                  ),
                )
              }
              className="text-[12px] font-bold text-[#565656] bg-transparent border-none cursor-pointer hover:text-[#0A6DC0]"
            >
              {condition.active ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(condition);
                setPicking(false);
              }}
              className="text-[12px] font-bold text-[#0A6DC0] bg-transparent border-none cursor-pointer hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() =>
                onChange(conditions.filter((c) => c.id !== condition.id))
              }
              className="text-[12px] font-bold text-[#C83C3C] bg-transparent border-none cursor-pointer hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {conditions.length === 0 && !picking && !draft && (
        <div className="border-[1.5px] border-dashed border-[#D8D8D8E6] rounded-[14px] px-7 py-[38px] text-center flex flex-col items-center gap-[14px]">
          <div className="w-[54px] h-[54px] rounded-[14px] bg-[#E8F2FF] text-[#0A6DC0] flex items-center justify-center">
            <Glyph paths={Ic.bag} size={26} width={1.6} />
          </div>
          <div className="max-w-[420px]">
            <div className="font-bold text-[16px] text-[#1F2328]">
              No conditions on this product yet
            </div>
            <div className="text-[13.5px] text-[#565656] mt-1.5 leading-[1.55]">
              Add a condition to create deals like bundle offers, minimum order
              quantities, free delivery, or price discounts.
            </div>
          </div>
        </div>
      )}

      {picking && (
        <div className="border border-[#D8D8D8B3] rounded-[14px] p-[18px] bg-[#FAFBFC]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="font-bold text-[14.5px] text-[#1F2328]">
              Choose a condition type
            </div>
            <button
              type="button"
              onClick={() => setPicking(false)}
              className={cancelBtn}
            >
              <Glyph
                paths={<path d="M6 6l12 12M18 6L6 18" />}
                size={14}
                width={2.2}
              />
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => start(type.id)}
                className="flex items-center gap-[13px] text-left bg-white border border-[#D8D8D8B3] rounded-[12px] p-[14px] cursor-pointer hover:border-[#0A6DC0] hover:bg-[#F8FBFF]"
              >
                <span className="w-10 h-10 rounded-[10px] bg-[#E8F2FF] text-[#0A6DC0] flex items-center justify-center shrink-0">
                  <Glyph paths={type.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-[14px] text-[#1F2328]">
                    {type.label}
                  </span>
                  <span className="block text-[12px] text-[#8E8E93] mt-0.5">
                    {type.sub}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {draft && (
        <div className={panel}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-[14.5px] text-[#1F2328]">
              {labelOf(draft.type)}
            </span>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className={cancelBtn}
            >
              Cancel
            </button>
          </div>

          {draft.type === "discount" && (
            <>
              <Field
                label="Trigger quantity"
                value={draft.triggerQty}
                onChange={(v) => setDraft({ ...draft, triggerQty: v })}
                placeholder={`Buy this many ${unit} or more`}
              />
              <div>
                <label className={LABEL}>Discount type</label>
                <div className="flex bg-[#F5F6F8] rounded-[10px] p-1 gap-1">
                  {(
                    [
                      { id: "percent", label: "Percentage off" },
                      { id: "naira", label: "Fixed price per pack" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, discountMode: option.id })
                      }
                      className={`flex-1 h-[38px] rounded-[8px] text-[13.5px] font-bold cursor-pointer border-none ${
                        draft.discountMode === option.id
                          ? "bg-white text-[#0A6DC0] shadow-[0_1px_3px_rgba(0,0,0,.1)]"
                          : "bg-transparent text-[#565656]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <Field
                label={
                  draft.discountMode === "naira"
                    ? "Fixed price per pack"
                    : "Discount percentage"
                }
                value={draft.discountValue}
                onChange={(v) => setDraft({ ...draft, discountValue: v })}
                placeholder={
                  draft.discountMode === "naira" ? "₦ e.g. 4500" : "% e.g. 8"
                }
              />
              {draft.discountMode === "naira" && (
                <p className="text-[12px] text-[#8E8E93] -mt-2">
                  Stored as a percentage of the unit price — that is the only
                  shape the API accepts.
                </p>
              )}
            </>
          )}

          {draft.type === "free_delivery" && (
            <Field
              label="Trigger quantity"
              value={draft.triggerQty}
              onChange={(v) => setDraft({ ...draft, triggerQty: v })}
              placeholder={`Buy this many ${unit} or more`}
            />
          )}

          {draft.type === "minimum_qty" && (
            <Field
              label="Minimum quantity"
              value={draft.minimumQty}
              onChange={(v) => setDraft({ ...draft, minimumQty: v })}
              placeholder={`Buyers must order at least this many ${unit}`}
            />
          )}

          {draft.type === "bundle" && (
            <div className="flex flex-col gap-5">
              <div>
                <StepLabel n={1}>Select the bundle product</StepLabel>
                <Popover open={bundleOpen} onOpenChange={setBundleOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`${INPUT} flex items-center justify-between text-left`}
                    >
                      {selectedBundle ? (
                        <span className="flex items-center gap-3 min-w-0">
                          <ProductThumb
                            src={selectedBundle.image}
                            alt={selectedBundle.name}
                            size={32}
                          />
                          <span className="flex flex-col items-start min-w-0">
                            <span className="font-medium text-[14px] text-[#2F2F2F] truncate">
                              {selectedBundle.name}
                            </span>
                            {selectedBundle.pack && (
                              <span className="text-[11.5px] text-[#8E8E93]">
                                {selectedBundle.pack}
                              </span>
                            )}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#8E8E93]">
                          Select a product in this store
                        </span>
                      )}
                      <Glyph paths={<path d="M6 9l6 6 6-6" />} size={18} width={2} />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="p-0 max-h-[320px] w-[var(--radix-popover-trigger-width)]"
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search products in this store"
                        className="h-9"
                        onValueChange={setBundleSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          No matching products in this store
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredBundles.map((option) => (
                            <CommandItem
                              key={option.id ?? option.name}
                              value={option.id ?? option.name}
                              onSelect={() => {
                                setDraft({
                                  ...draft,
                                  bundleProduct: option.name,
                                  bundleStockId: option.id,
                                });
                                setBundleOpen(false);
                                setBundleSearch("");
                              }}
                              className="cursor-pointer py-3 px-4"
                            >
                              <div className="flex items-center gap-3 w-full min-w-0">
                                <ProductThumb
                                  src={option.image}
                                  alt={option.name}
                                  size={40}
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium text-[14px] text-[#1F2328] truncate">
                                    {option.name}
                                  </span>
                                  {option.pack && (
                                    <span className="text-[12px] text-[#8E8E93]">
                                      {option.pack}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="text-[12px] text-[#8E8E93] mt-[7px]">
                  Only products already in stock here. {mainProductName}{" "}
                  can&apos;t bundle with itself.
                </div>
              </div>

              <div>
                <StepLabel n={2}>
                  Minimum quantity to trigger this bundle{" "}
                  <span className="text-[#C83C3C] ml-0.5">*</span>
                </StepLabel>
                <Field
                  value={draft.bundleMainQty}
                  onChange={(v) => setDraft({ ...draft, bundleMainQty: v })}
                  placeholder={`Minimum ${unit} of this product to trigger this bundle`}
                  invalid={touched && !draft.bundleMainQty}
                  hint={
                    touched && !draft.bundleMainQty
                      ? "Required — a bundle can't be saved without a minimum quantity."
                      : undefined
                  }
                />
              </div>

              <div>
                <StepLabel n={3}>Set the ratio</StepLabel>
                <div className="flex items-end gap-3.5">
                  <div className="flex-1">
                    <div className="text-[12.5px] text-[#565656] mb-1.5">
                      Main · {mainProductName}
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={draft.bundleRatioMain ?? 1}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          bundleRatioMain: Number(e.target.value),
                        })
                      }
                      className={INPUT}
                    />
                  </div>
                  <div className="pb-3.5 font-bold text-[18px] text-[#8E8E93]">
                    :
                  </div>
                  <div className="flex-1">
                    <div className="text-[12.5px] text-[#565656] mb-1.5">
                      Bundle · {draft.bundleProduct || "bundle product"}
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={draft.bundleRatioBundle ?? 1}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          bundleRatioBundle: Number(e.target.value),
                        })
                      }
                      className={INPUT}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={LABEL}>If bundle stock runs out</label>
                <div className="flex gap-2 flex-wrap">
                  {(
                    [
                      { id: "terminate", label: "Hold the order" },
                      { id: "allow", label: "Continue without it" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setDraft({ ...draft, bundleFallback: option.id })
                      }
                      className={`h-10 px-4 rounded-full text-[13px] font-semibold cursor-pointer border ${
                        draft.bundleFallback === option.id
                          ? "border-[#0A6DC0] bg-[#E8F2FF] text-[#0A6DC0]"
                          : "border-[#D8D8D8B3] bg-white text-[#2F2F2F]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {draft.type === "free_gift" && (
            <div className="flex flex-col gap-5">
              <div>
                <StepLabel n={1}>How much must they buy?</StepLabel>
                <Field
                  value={draft.triggerQty}
                  onChange={(v) => setDraft({ ...draft, triggerQty: v })}
                  placeholder={`Buy this many ${unit} or more`}
                />
              </div>

              <div>
                <StepLabel n={2}>What do they get?</StepLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: "same_stock", label: "More of this product" },
                      { id: "other_stock", label: "Another product" },
                      { id: "external_item", label: "Something else" },
                    ] as const
                  ).map((option) => {
                    const active = draft.gifts?.[0]?.gift_type === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            gifts: [
                              {
                                gift_type: option.id,
                                quantity:
                                  option.id === "external_item" ? undefined : 1,
                              },
                            ],
                          })
                        }
                        className={`h-11 px-3 rounded-[10px] text-[13px] font-semibold cursor-pointer border ${
                          active
                            ? "border-[#0A6DC0] bg-[#E8F2FF] text-[#0A6DC0]"
                            : "border-[#D8D8D8B3] bg-white text-[#2F2F2F]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <StepLabel n={3}>Gift details</StepLabel>
                {draft.gifts?.[0]?.gift_type !== "external_item" ? (
                  <div className="flex flex-col gap-4">
                    <Field
                      label="Free quantity"
                      value={draft.gifts?.[0]?.quantity}
                      onChange={(v) =>
                        setDraft({
                          ...draft,
                          gifts: [
                            {
                              ...(draft.gifts?.[0] as FreeGiftDraft),
                              quantity: v,
                            },
                          ],
                        })
                      }
                      placeholder={`How many free ${unit}`}
                    />
                    {draft.gifts?.[0]?.gift_type === "other_stock" && (
                      <div>
                        <label className={LABEL}>Which product</label>
                        <select
                          value={draft.gifts?.[0]?.stock_id ?? ""}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              gifts: [
                                {
                                  ...(draft.gifts?.[0] as FreeGiftDraft),
                                  stock_id: e.target.value,
                                },
                              ],
                            })
                          }
                          className={INPUT}
                        >
                          <option value="">Select a product in this store</option>
                          {filteredBundles.map((option) => (
                            <option key={option.name} value={option.name}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={LABEL}>Gift name</label>
                      <input
                        value={draft.gifts?.[0]?.item_name ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            gifts: [
                              {
                                ...(draft.gifts?.[0] as FreeGiftDraft),
                                item_name: e.target.value,
                              },
                            ],
                          })
                        }
                        placeholder="e.g. Samsung Fridge 200L"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Description</label>
                      <input
                        value={draft.gifts?.[0]?.item_description ?? ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            gifts: [
                              {
                                ...(draft.gifts?.[0] as FreeGiftDraft),
                                item_description: e.target.value,
                              },
                            ],
                          })
                        }
                        placeholder="e.g. White, energy A+"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Gift photo</label>
                      <div className="flex items-center gap-3 flex-wrap">
                        {draft.gifts?.[0]?.external_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={draft.gifts[0].external_image}
                            alt="Gift"
                            className="w-16 h-16 rounded-[12px] object-cover border border-[#D8D8D8B3]"
                          />
                        ) : (
                          <span className="w-16 h-16 rounded-[12px] border border-dashed border-[#D8D8D8E6] text-[#0A6DC0] inline-flex items-center justify-center">
                            <Glyph paths={Ic.gift} size={24} width={1.6} />
                          </span>
                        )}
                        <label className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] border border-[#D8D8D8B3] bg-white cursor-pointer text-[13px] font-bold text-[#2F2F2F] hover:border-[#0A6DC0] hover:text-[#0A6DC0]">
                          <span>{uploading ? "Uploading…" : "Add photo"}</span>
                          <input
                            type="file"
                            accept={UPLOAD_ACCEPT}
                            className="hidden"
                            disabled={uploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.size > MAX_UPLOAD_BYTES) {
                                toast.error("That image is larger than 5MB");
                                return;
                              }
                              try {
                                setUploading(true);
                                const url = await uploadImage(file);
                                setDraft((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        gifts: [
                                          {
                                            ...(prev.gifts?.[0] as FreeGiftDraft),
                                            external_image: url,
                                          },
                                        ],
                                      }
                                    : prev,
                                );
                                toast.success("Gift photo added");
                              } catch (err) {
                                toast.error(
                                  err instanceof Error
                                    ? err.message
                                    : "Upload failed",
                                );
                              } finally {
                                setUploading(false);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={save}
            disabled={!valid || locked}
            title={locked ? lockedMessage : undefined}
            className="w-full h-[48px] rounded-[12px] border-none text-white text-[14.5px] font-bold cursor-pointer disabled:cursor-not-allowed"
            style={{ background: valid && !locked ? "#0A6DC0" : "#C7D5E5" }}
          >
            {locked ? "Add the stock to save this" : "Save condition"}
          </button>
        </div>
      )}

      {!picking && !draft && (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="flex items-center justify-center gap-2 w-full bg-white border-[1.5px] border-dashed border-[#0A6DC0] rounded-[12px] p-[15px] font-bold text-[14.5px] text-[#0A6DC0] cursor-pointer hover:bg-[#F8FBFF]"
        >
          <Glyph
            paths={
              <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </>
            }
            size={18}
            width={2.2}
          />
          Add condition
        </button>
      )}
    </div>
  );
};

export default MarketplaceConditions;
