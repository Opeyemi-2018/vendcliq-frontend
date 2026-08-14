"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import MarketplaceConditions, {
  MarketplaceCondition,
  BundleOption,
} from "./MarketplaceConditions";
import { fromApi, toDraft } from "@/lib/conditionSync";
import { buildConditionPayload, type StockCondition } from "@/lib/stockConditions";
import {
  getStockConditions,
  createStockCondition,
  updateStockCondition,
  deleteStockCondition,
} from "@/lib/utils/api/apiHelper";

interface StockConditionsPanelProps {
  stockId: string;
  productName?: string;
  /** Needed to turn a fixed naira discount into the percentage the API wants. */
  sellingPrice?: number;
  bundleOptions?: BundleOption[];
}

/**
 * Marketplace rules on the stock detail page: shows what is live and lets
 * one be added, edited, paused or removed without leaving the page.
 */
export const StockConditionsPanel = ({
  stockId,
  productName,
  sellingPrice,
  bundleOptions = [],
}: StockConditionsPanelProps) => {
  const [conditions, setConditions] = useState<MarketplaceCondition[]>([]);
  const [busy, setBusy] = useState(false);

  const nameOfStock = useMemo(() => {
    const byId = new Map(
      bundleOptions.filter((o) => o.id).map((o) => [String(o.id), o.name]),
    );
    return (id: string) => byId.get(id);
  }, [bundleOptions]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["stock-conditions", stockId],
    queryFn: () => getStockConditions(stockId),
    enabled: Boolean(stockId),
  });

  useEffect(() => {
    const rows: StockCondition[] = Array.isArray(data?.data) ? data.data : [];
    setConditions(rows.map((row) => fromApi(row, nameOfStock)));
  }, [data, nameOfStock]);

  /**
   * The conditions component hands back the whole list, so the change is worked
   * out by comparing against what is currently saved.
   */
  const handleChange = async (next: MarketplaceCondition[]) => {
    const previous = conditions;
    setConditions(next); // optimistic — reverted below if the call fails

    const added = next.find((c) => c.id.startsWith("tmp-"));
    const removed = previous.find((c) => !next.some((n) => n.id === c.id));
    const edited = next.find((c) => {
      if (c.id.startsWith("tmp-")) return false;
      const before = previous.find((p) => p.id === c.id);
      return before && JSON.stringify(before) !== JSON.stringify(c);
    });

    const revert = (message: string) => {
      setConditions(previous);
      toast.error(message);
    };

    try {
      setBusy(true);

      if (added) {
        const response: any = await createStockCondition(
          buildConditionPayload(stockId, toDraft(added, sellingPrice)),
        );
        if (response?.statusCode !== 200 && response?.statusCode !== 201) {
          return revert(response?.error || "Could not save this rule");
        }
        toast.success("Rule added");
      } else if (removed) {
        const response: any = await deleteStockCondition(removed.id);
        if (response?.statusCode && response.statusCode >= 400) {
          return revert(response?.error || "Could not delete this rule");
        }
        toast.success("Rule removed");
      } else if (edited) {
        const before = previous.find((p) => p.id === edited.id);
        const onlyToggled =
          before &&
          JSON.stringify({ ...before, active: edited.active }) ===
            JSON.stringify(edited);
        const payload = onlyToggled
          ? { is_active: edited.active }
          : buildConditionPayload(stockId, toDraft(edited, sellingPrice));
        const response: any = await updateStockCondition(edited.id, payload);
        if (response?.statusCode && response.statusCode >= 400) {
          return revert(response?.error || "Could not update this rule");
        }
        toast.success(onlyToggled ? "Rule updated" : "Rule saved");
      }

      await refetch();
    } catch (error: any) {
      revert(error?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 border border-[#D8D8D8B3] rounded-[16px] bg-white p-5 sm:p-6 font-dm-sans">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-clash font-bold text-[18px] text-[#1F2328]">
            Marketplace rules
          </h2>
          <p className="text-[13px] text-[#565656] mt-1 leading-[1.5]">
            Deals buyers see for this product on the marketplace — bundles,
            discounts, minimum orders and free gifts.
          </p>
        </div>
        {conditions.length > 0 && (
          <span className="shrink-0 inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 rounded-full bg-[#E8F2FF] text-[#0A6DC0] text-[12.5px] font-bold">
            {conditions.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-[13px] text-[#8E8E93]">Loading conditions…</p>
      ) : (
        <div className={busy ? "opacity-60 pointer-events-none" : undefined}>
          <MarketplaceConditions
            conditions={conditions}
            onChange={handleChange}
            bundleOptions={bundleOptions}
            mode="edit"
            mainProductName={productName}
          />
        </div>
      )}
    </div>
  );
};

export default StockConditionsPanel;
