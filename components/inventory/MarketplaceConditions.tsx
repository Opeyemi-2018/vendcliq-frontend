"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { VcIcon, IconName } from "./VcIcon";

export type ConditionType =
  | "discount"
  | "free_delivery"
  | "minimum_qty"
  | "bundle";

export interface MarketplaceCondition {
  id: string;
  type: ConditionType;
  active: boolean;
  /** Quantity that triggers the rule. */
  triggerQty?: number;
  /** Discount only. */
  discountMode?: "percent" | "naira";
  discountValue?: number;
  /** Minimum quantity only. */
  minimumQty?: number;
  /** Bundle only. */
  bundleProduct?: string;
  bundleMainQty?: number;
  bundleRatioMain?: number;
  bundleRatioBundle?: number;
  bundleFallback?: "terminate" | "allow";
}

const TYPE_META: Record<
  ConditionType,
  { label: string; icon: IconName; bg: string; fg: string }
> = {
  discount: { label: "Price discount", icon: "naira", bg: "#E1EEFF", fg: "#0A6DC0" },
  free_delivery: { label: "Free delivery", icon: "truck", bg: "#E7F4EB", fg: "#0E6E55" },
  minimum_qty: { label: "Minimum quantity", icon: "box", bg: "#FFF3DB", fg: "#B47800" },
  bundle: { label: "Bundle products", icon: "cart", bg: "#F3EAFF", fg: "#7B61FF" },
};

/** One-line summary shown on a saved condition card. */
export const summarise = (c: MarketplaceCondition, unit = "packs"): string => {
  switch (c.type) {
    case "discount":
      return `Buy ${c.triggerQty ?? 0}+ ${unit}, get ${
        c.discountMode === "naira"
          ? `₦${(c.discountValue ?? 0).toLocaleString("en-NG")}`
          : `${c.discountValue ?? 0}%`
      } off`;
    case "free_delivery":
      return `Free delivery on ${c.triggerQty ?? 0}+ ${unit}`;
    case "minimum_qty":
      return `Minimum order: ${c.minimumQty ?? 0} ${unit}`;
    case "bundle":
      return `Requires ${c.bundleProduct || "another product"} at ${
        c.bundleRatioMain ?? 1
      }:${c.bundleRatioBundle ?? 1} ratio, minimum ${c.bundleMainQty ?? 0} ${unit}`;
  }
};

const numberField = (
  label: string,
  value: number | undefined,
  onChange: (v: number) => void,
  placeholder = "0",
) => (
  <label className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
    <span className="text-[12px] font-bold text-[#6E7480]">{label}</span>
    <input
      type="number"
      min={0}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-11 px-3 box-border rounded-[10px] border border-[#D8D8D8E6] bg-white text-[14px] text-[#2F2F2F] outline-none focus:border-[#0A6DC0]"
    />
  </label>
);

interface MarketplaceConditionsProps {
  conditions: MarketplaceCondition[];
  onChange: (next: MarketplaceCondition[]) => void;
  /** Other products in the store, for the bundle picker. */
  bundleOptions?: string[];
  /** "add" vs "edit" changes the intro copy. */
  mode?: "add" | "edit";
  unit?: string;
}

export const MarketplaceConditions = ({
  conditions,
  onChange,
  bundleOptions = [],
  mode = "add",
  unit = "packs",
}: MarketplaceConditionsProps) => {
  const [draft, setDraft] = useState<MarketplaceCondition | null>(null);

  const startDraft = (type: ConditionType) =>
    setDraft({
      id: `tmp-${type}-${conditions.length + 1}`,
      type,
      active: true,
      triggerQty: undefined,
      discountMode: "percent",
      bundleRatioMain: 1,
      bundleRatioBundle: 1,
      bundleFallback: "terminate",
    });

  // Each type has its own notion of "enough information to save".
  const draftValid = (() => {
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
    }
  })();

  const saveDraft = () => {
    if (!draft || !draftValid) return;
    const existing = conditions.some((c) => c.id === draft.id);
    onChange(
      existing
        ? conditions.map((c) => (c.id === draft.id ? draft : c))
        : [...conditions, draft],
    );
    setDraft(null);
    toast.success("Condition saved");
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-[#6E7480] leading-[1.5]">
        {mode === "edit"
          ? "These conditions are live on the marketplace. Use the switch to pause or resume one without losing its setup; Edit changes its values; Delete removes it entirely."
          : "Optional deals that apply when buyers shop this product on the marketplace."}
      </p>

      {conditions.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {conditions.map((condition) => {
            const meta = TYPE_META[condition.type];
            return (
              <div
                key={condition.id}
                className="border border-[#D8D8D8CC] rounded-[14px] p-4 flex items-start gap-3 transition"
                style={{ opacity: condition.active ? 1 : 0.6 }}
              >
                <span
                  className="w-10 h-10 rounded-[12px] inline-flex items-center justify-center shrink-0"
                  style={{ background: meta.bg }}
                >
                  <VcIcon name={meta.icon} size={20} stroke={meta.fg} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] text-[#2F2F2F]">
                    {meta.label}
                  </div>
                  <div className="text-[12.5px] text-[#6E7480] mt-0.5">
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
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        conditions.map((c) =>
                          c.id === condition.id
                            ? { ...c, active: !c.active }
                            : c,
                        ),
                      )
                    }
                    className="text-[12px] font-bold text-[#6B6B70] border-none bg-transparent cursor-pointer hover:text-[#0A6DC0]"
                  >
                    {condition.active ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(condition)}
                    className="text-[12px] font-bold text-[#0A6DC0] border-none bg-transparent cursor-pointer hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(conditions.filter((c) => c.id !== condition.id))
                    }
                    className="text-[12px] font-bold text-[#B3261E] border-none bg-transparent cursor-pointer hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {conditions.length === 0 && !draft && (
        <div className="border border-dashed border-[#D8D8D8E6] rounded-[14px] py-8 px-5 text-center">
          <div className="font-bold text-[14px] text-[#2F2F2F]">
            No marketplace conditions yet
          </div>
          <div className="text-[12.5px] text-[#8E8E93] mt-1">
            Add one to offer buyers a deal on this product.
          </div>
        </div>
      )}

      {draft ? (
        <div className="border border-[#0A6DC0] rounded-[14px] p-4 flex flex-col gap-3 bg-[#F9FCFF]">
          <div className="font-bold text-[14px] text-[#2F2F2F]">
            {TYPE_META[draft.type].label}
          </div>

          {draft.type === "discount" && (
            <>
              <div className="flex gap-3 flex-wrap">
                {numberField("Trigger quantity", draft.triggerQty, (v) =>
                  setDraft({ ...draft, triggerQty: v }),
                )}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
                  <span className="text-[12px] font-bold text-[#6E7480]">
                    Discount type
                  </span>
                  <div className="flex gap-1 bg-[#F4F5F7] p-1 rounded-[10px] h-11 box-border">
                    {(["percent", "naira"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDraft({ ...draft, discountMode: m })}
                        className={`flex-1 rounded-[8px] text-[13px] font-bold cursor-pointer border-none ${
                          draft.discountMode === m
                            ? "bg-white text-[#0A6DC0] shadow-[0_1px_3px_rgba(0,0,0,.1)]"
                            : "bg-transparent text-[#6B6B70]"
                        }`}
                      >
                        {m === "percent" ? "%" : "₦"}
                      </button>
                    ))}
                  </div>
                </div>
                {numberField("Value", draft.discountValue, (v) =>
                  setDraft({ ...draft, discountValue: v }),
                )}
              </div>
            </>
          )}

          {draft.type === "free_delivery" &&
            numberField("Trigger quantity", draft.triggerQty, (v) =>
              setDraft({ ...draft, triggerQty: v }),
            )}

          {draft.type === "minimum_qty" &&
            numberField("Minimum quantity", draft.minimumQty, (v) =>
              setDraft({ ...draft, minimumQty: v }),
            )}

          {draft.type === "bundle" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#6E7480]">
                  Bundle product
                </span>
                <input
                  list="vc-bundle-products"
                  value={draft.bundleProduct ?? ""}
                  onChange={(e) =>
                    setDraft({ ...draft, bundleProduct: e.target.value })
                  }
                  placeholder="Search products in this store"
                  className="h-11 px-3 box-border rounded-[10px] border border-[#D8D8D8E6] bg-white text-[14px] text-[#2F2F2F] outline-none focus:border-[#0A6DC0]"
                />
                <datalist id="vc-bundle-products">
                  {bundleOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </label>

              <div className="flex gap-3 flex-wrap">
                {numberField("Main minimum qty", draft.bundleMainQty, (v) =>
                  setDraft({ ...draft, bundleMainQty: v }),
                )}
                {numberField("Ratio · main", draft.bundleRatioMain, (v) =>
                  setDraft({ ...draft, bundleRatioMain: v }),
                )}
                {numberField("Ratio · bundle", draft.bundleRatioBundle, (v) =>
                  setDraft({ ...draft, bundleRatioBundle: v }),
                )}
              </div>

              <p className="text-[12px] text-[#8E8E93] leading-[1.45]">
                Main {draft.bundleRatioMain ?? 1}, Bundle{" "}
                {draft.bundleRatioBundle ?? 1} means for every{" "}
                {draft.bundleRatioMain ?? 1} {unit} of this product, the buyer
                needs {draft.bundleRatioBundle ?? 1} {unit} of the bundle
                product.
              </p>

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#6E7480]">
                  If bundle stock runs out
                </span>
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
                          ? "border-[#0A6DC0] bg-[#E1EEFF] text-[#0A6DC0]"
                          : "border-[#D8D8D8E6] bg-white text-[#2F2F2F]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2.5 mt-1">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="h-11 px-4 rounded-[10px] border border-[#D8D8D8E6] bg-white text-[#2F2F2F] text-[13.5px] font-bold cursor-pointer hover:border-[#0A6DC0]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveDraft}
              disabled={!draftValid}
              className="flex-1 h-11 rounded-[10px] border-none text-white text-[14px] font-bold cursor-pointer disabled:cursor-not-allowed"
              style={{ background: draftValid ? "#0A6DC0" : "#C7D5E5" }}
            >
              Save condition
            </button>
          </div>
          {!draftValid && draft.type === "bundle" && (
            <p className="text-[12px] text-[#8E8E93] text-center">
              Set the bundle product and minimum quantity to continue
            </p>
          )}
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(TYPE_META) as ConditionType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => startDraft(type)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#D8D8D8E6] bg-white text-[13px] font-semibold text-[#2F2F2F] cursor-pointer hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
            >
              <VcIcon name="plus" size={15} strokeWidth={2.4} />
              <span>{TYPE_META[type].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceConditions;
