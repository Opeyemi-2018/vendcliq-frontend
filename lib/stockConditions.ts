/* eslint-disable @typescript-eslint/no-explicit-any */

/** Condition types as the API models them. */
export type ConditionApiType =
  | "quantity_bundle"
  | "minimum_quantity"
  | "product_bundle"
  | "buy_x_get_free";

/** What the UI offers, which is finer-grained than the API's `type`. */
export type ConditionKind =
  | "discount"
  | "free_delivery"
  | "minimum_qty"
  | "bundle"
  | "free_gift";

export type GiftType = "same_stock" | "other_stock" | "external_item";

export interface FreeGift {
  gift_type: GiftType;
  quantity?: number;
  stock_id?: string;
  item_name?: string;
  item_description?: string;
  external_image?: string;
}

export interface StockCondition {
  id: string;
  type: ConditionApiType;
  min_quantity: number | null;
  trigger_quantity: number | null;
  reward_type: "discount" | "free_delivery" | null;
  discount_percentage: number | null;
  description: string;
  is_active: number | boolean;
  enforce: number | boolean;
  bundle_items: { bundled_stock_id: string; quantity: number }[];
  free_gifts: FreeGift[];
}

/** Collapses the API's type + reward_type into the kind the UI shows. */
export const kindOf = (condition: StockCondition): ConditionKind => {
  if (condition.type === "minimum_quantity") return "minimum_qty";
  if (condition.type === "product_bundle") return "bundle";
  if (condition.type === "buy_x_get_free") return "free_gift";
  return condition.reward_type === "free_delivery" ? "free_delivery" : "discount";
};

export interface ConditionDraft {
  kind: ConditionKind;
  minQuantity?: number;
  discountPercentage?: number;
  /** Fixed naira off per pack, converted to a percentage before sending. */
  discountAmount?: number;
  discountMode?: "percent" | "naira";
  unitPrice?: number;
  bundleStockId?: string;
  bundleMainRatio?: number;
  bundleItemRatio?: number;
  enforce?: boolean;
  gifts?: FreeGift[];
}

const describe = (draft: ConditionDraft, percentage?: number): string => {
  switch (draft.kind) {
    case "discount":
      return `Buy ${draft.minQuantity ?? 0}+ and get ${percentage ?? 0}% off`;
    case "free_delivery":
      return `Buy ${draft.minQuantity ?? 0}+ and get free delivery`;
    case "minimum_qty":
      return `Must buy at least ${draft.minQuantity ?? 0} units`;
    case "bundle":
      return `Bundle required at ${draft.bundleMainRatio ?? 1}:${
        draft.bundleItemRatio ?? 1
      }, minimum ${draft.minQuantity ?? 0}`;
    case "free_gift":
      return `Buy ${draft.minQuantity ?? 0}+ and get a free gift`;
  }
};

/**
 * A fixed naira discount has no API field of its own — the spec says convert it
 * to a percentage of the unit price and send that.
 */
export const toPercentage = (draft: ConditionDraft): number => {
  if (draft.discountMode === "naira") {
    if (!draft.unitPrice || !draft.discountAmount) return 0;
    return Number(((draft.discountAmount / draft.unitPrice) * 100).toFixed(2));
  }
  return Number(draft.discountPercentage ?? 0);
};

/** Builds the exact payload each condition type expects. */
export const buildConditionPayload = (
  stockId: string,
  draft: ConditionDraft,
): Record<string, any> => {
  const base = { stock_id: stockId };

  switch (draft.kind) {
    case "minimum_qty":
      return {
        ...base,
        type: "minimum_quantity",
        min_quantity: draft.minQuantity,
        description: describe(draft),
      };

    case "free_delivery":
      return {
        ...base,
        type: "quantity_bundle",
        min_quantity: draft.minQuantity,
        reward_type: "free_delivery",
        description: describe(draft),
      };

    case "discount": {
      const percentage = toPercentage(draft);
      return {
        ...base,
        type: "quantity_bundle",
        min_quantity: draft.minQuantity,
        reward_type: "discount",
        discount_percentage: percentage,
        description: describe(draft, percentage),
      };
    }

    case "bundle":
      return {
        ...base,
        type: "product_bundle",
        min_quantity: draft.minQuantity,
        trigger_quantity: draft.bundleMainRatio ?? 1,
        bundle_items: [
          {
            bundled_stock_id: draft.bundleStockId,
            quantity: draft.bundleItemRatio ?? 1,
          },
        ],
        description: describe(draft),
        enforce: Boolean(draft.enforce),
      };

    case "free_gift":
      return {
        ...base,
        type: "buy_x_get_free",
        min_quantity: draft.minQuantity,
        free_gifts: draft.gifts ?? [],
        description: describe(draft),
      };
  }
};

/** Whether a draft has enough to save. */
export const isDraftValid = (draft: ConditionDraft): boolean => {
  switch (draft.kind) {
    case "discount":
      return Boolean(
        draft.minQuantity &&
          (draft.discountMode === "naira"
            ? draft.discountAmount && draft.unitPrice
            : draft.discountPercentage),
      );
    case "free_delivery":
    case "minimum_qty":
      return Boolean(draft.minQuantity);
    case "bundle":
      return Boolean(draft.minQuantity && draft.bundleStockId);
    case "free_gift": {
      if (!draft.minQuantity || !draft.gifts?.length) return false;
      return draft.gifts.every((gift) =>
        gift.gift_type === "external_item"
          ? Boolean(gift.item_name)
          : Boolean(gift.quantity && (gift.gift_type === "same_stock" || gift.stock_id)),
      );
    }
  }
};

/** Human summary for a saved condition, preferring the API's own description. */
export const summariseCondition = (condition: StockCondition): string => {
  if (condition.description) return condition.description;
  const kind = kindOf(condition);
  if (kind === "free_gift") {
    const gift = condition.free_gifts?.[0];
    return gift?.item_name
      ? `Buy ${condition.min_quantity}+ and get ${gift.item_name}`
      : `Buy ${condition.min_quantity}+ and get a free gift`;
  }
  return `Condition on ${condition.min_quantity ?? 0}+ units`;
};
