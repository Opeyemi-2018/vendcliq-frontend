/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Bridges the conditions UI shape and the `inventory/stock-conditions` API.
 * Conditions hang off a stock id, so nothing here can run until a stock exists.
 */

import type {
  MarketplaceCondition,
  FreeGiftDraft,
} from "@/components/inventory/MarketplaceConditions";
import {
  buildConditionPayload,
  kindOf,
  type ConditionDraft,
  type StockCondition,
} from "./stockConditions";
import {
  createStockCondition,
  deleteStockCondition,
} from "./utils/api/apiHelper";

/** UI condition → the draft shape `buildConditionPayload` understands. */
export const toDraft = (
  condition: MarketplaceCondition,
  unitPrice?: number,
): ConditionDraft => {
  switch (condition.type) {
    case "discount":
      return {
        kind: "discount",
        minQuantity: condition.triggerQty,
        discountMode: condition.discountMode ?? "percent",
        discountPercentage:
          condition.discountMode === "naira" ? undefined : condition.discountValue,
        discountAmount:
          condition.discountMode === "naira" ? condition.discountValue : undefined,
        unitPrice,
      };
    case "free_delivery":
      return { kind: "free_delivery", minQuantity: condition.triggerQty };
    case "minimum_qty":
      return { kind: "minimum_qty", minQuantity: condition.minimumQty };
    case "bundle":
      return {
        kind: "bundle",
        minQuantity: condition.bundleMainQty,
        bundleStockId: condition.bundleStockId,
        bundleMainRatio: condition.bundleRatioMain ?? 1,
        bundleItemRatio: condition.bundleRatioBundle ?? 1,
        // "terminate" means the order must not go through without the bundle.
        enforce: condition.bundleFallback !== "allow",
      };
    case "free_gift":
      return {
        kind: "free_gift",
        minQuantity: condition.triggerQty,
        gifts: condition.gifts ?? [],
      };
  }
};

/** API condition → the UI shape, for rendering saved conditions. */
export const fromApi = (
  condition: StockCondition,
  bundleName?: (stockId: string) => string | undefined,
): MarketplaceCondition => {
  const kind = kindOf(condition);
  const active = Boolean(condition.is_active);
  const base = { id: String(condition.id), active };
  const min = condition.min_quantity ?? undefined;

  switch (kind) {
    case "minimum_qty":
      return { ...base, type: "minimum_qty", minimumQty: min };
    case "free_delivery":
      return { ...base, type: "free_delivery", triggerQty: min };
    case "bundle": {
      const item = condition.bundle_items?.[0];
      const bundledId = item ? String(item.bundled_stock_id) : undefined;
      return {
        ...base,
        type: "bundle",
        bundleMainQty: min,
        bundleStockId: bundledId,
        bundleProduct: bundledId ? bundleName?.(bundledId) : undefined,
        bundleRatioMain: condition.trigger_quantity ?? 1,
        bundleRatioBundle: item?.quantity ?? 1,
        bundleFallback: condition.enforce ? "terminate" : "allow",
      };
    }
    case "free_gift":
      return {
        ...base,
        type: "free_gift",
        triggerQty: min,
        gifts: (condition.free_gifts ?? []) as FreeGiftDraft[],
      };
    default:
      return {
        ...base,
        type: "discount",
        triggerQty: min,
        discountMode: "percent",
        discountValue: condition.discount_percentage ?? undefined,
      };
  }
};

/** A condition that has never been sent still carries its temporary id. */
export const isUnsaved = (condition: MarketplaceCondition) =>
  condition.id.startsWith("tmp-");

export interface SyncResult {
  saved: number;
  failed: { condition: MarketplaceCondition; message: string }[];
}

/**
 * Sends every not-yet-saved condition for a stock. Each is posted on its own so
 * one bad condition does not take the rest down with it.
 */
export const saveNewConditions = async (
  stockId: string,
  conditions: MarketplaceCondition[],
  unitPrice?: number,
): Promise<SyncResult> => {
  const pending = conditions.filter(isUnsaved);
  const result: SyncResult = { saved: 0, failed: [] };

  for (const condition of pending) {
    try {
      const payload = buildConditionPayload(stockId, toDraft(condition, unitPrice));
      const response: any = await createStockCondition(payload);
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        result.saved += 1;
      } else {
        result.failed.push({
          condition,
          message: response?.error || "Could not save this condition",
        });
      }
    } catch (error: any) {
      result.failed.push({
        condition,
        message: error?.message || "Could not save this condition",
      });
    }
  }

  return result;
};

export { deleteStockCondition };
