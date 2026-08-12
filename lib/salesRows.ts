/* eslint-disable @typescript-eslint/no-explicit-any */
import { PurchaseRequest, PurchaseRequestItem } from "@/types/purchaseRequest";
import { SaleInvoice } from "@/types/sales";

export type SalesChannel = "online" | "instore";

export interface SalesRowData {
  id: string;
  channel: SalesChannel;
  code: string;
  customerName: string;
  createdAt: string;
  amount: number;
  statusLabel: string;
  /** Status chip colours, straight from the prototype's token set. */
  statusBg: string;
  statusFg: string;
  /** Drives the amber "Hand over" button on the row. */
  awaitingHandover: boolean;
  handoverLabel?: string;
  /** True once every line on an online order has been handed over. */
  handoverComplete?: boolean;
  itemSummary?: string;
  href: string;
  storeId?: string | null;
}

const GREEN = { bg: "#E7F4EB", fg: "#003909" };
const AMBER = { bg: "#FFF3DB", fg: "#85540A" };
const BLUE = { bg: "#E1EEFF", fg: "#0A6DC0" };

/**
 * Pending items carry no handover fields at all — the key is absent rather than
 * `false` — so this counts truthy `handover_completed` only.
 */
export const handoverProgress = (items: PurchaseRequestItem[] = []) => {
  const total = items.length;
  const done = items.filter((i) => i.attributes?.handover_completed).length;
  return { done, total, complete: total > 0 && done === total };
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

const itemSummary = (items: PurchaseRequestItem[] = []): string | undefined => {
  const first = items[0];
  if (!first) return undefined;

  const qty = Number.isFinite(parseFloat(String(first.quantity ?? 0)))
    ? parseFloat(String(first.quantity))
    : 0;
  // `mode` arrives plural ("PACKS"/"CRATES"); singularise it for a qty of one.
  const unit = (first.mode || "PACKS").toLowerCase();
  const label = qty === 1 ? unit.replace(/s$/, "") : unit;
  const name = first.product?.name ?? "Item";
  const head = `${qty} ${label} · ${name}`;

  return items.length > 1 ? `${head} · +${items.length - 1} more` : head;
};

/**
 * Marketplace orders carry `store_id: null` at the top level — the fulfilling
 * store only appears on the line items — so fall back to the first item.
 */
const onlineStoreId = (request: PurchaseRequest): string | null => {
  if (request.store_id != null) return String(request.store_id);
  const fromItem = request.items?.find((i) => i.attributes?.store_id)
    ?.attributes?.store_id;
  return fromItem ? String(fromItem) : null;
};

/** An online (marketplace) order becomes a row. */
export const purchaseRequestToRow = (
  request: PurchaseRequest,
): SalesRowData => {
  const { done, total, complete } = handoverProgress(request.items);
  const status = (request.status || "").toUpperCase();

  const awaiting = status === "PAID" && !complete;

  let statusLabel = "Paid";
  let tone = GREEN;

  if (awaiting) {
    // Work still to do, but nothing wrong — blue rather than a warning colour.
    statusLabel = "Awaiting handover";
    tone = BLUE;
  } else if (complete) {
    statusLabel = "Handed over";
  } else if (status === "COMPLETED") {
    statusLabel = "Completed";
  } else if (status && status !== "PAID") {
    // Anything still unpaid (PENDING, etc.) is amber — it was rendering green
    // because only the label changed and the tone stayed at its default.
    statusLabel = titleCase(status);
    tone = AMBER;
  }

  return {
    id: request.id,
    channel: "online",
    code: request.code,
    customerName: (request.customer as any)?.name ?? "Marketplace buyer",
    createdAt: request.created_at,
    amount: request.total ?? 0,
    statusLabel,
    statusBg: tone.bg,
    statusFg: tone.fg,
    awaitingHandover: awaiting,
    handoverLabel: total
      ? complete
        ? "Handover complete"
        : `Handover ${done} of ${total}`
      : undefined,
    handoverComplete: complete,
    itemSummary: itemSummary(request.items),
    href: `/inventory/purchase-request/${request.id}`,
    storeId: onlineStoreId(request),
  };
};

/** An in-store sale invoice becomes a row. */
export const saleInvoiceToRow = (invoice: SaleInvoice): SalesRowData => {
  const status = (invoice.status || "").toUpperCase();

  let statusLabel = "Paid";
  let tone = GREEN;
  if (status === "COMPLETED") {
    statusLabel = "Completed";
  } else if (status && status !== "PAID") {
    statusLabel = titleCase(status);
    tone = AMBER;
  }

  return {
    id: invoice.id,
    channel: "instore",
    code: invoice.code,
    customerName: invoice.customer?.name ?? "Walk-in customer",
    createdAt: invoice.created_at,
    amount: invoice.total ?? 0,
    statusLabel,
    statusBg: tone.bg,
    statusFg: tone.fg,
    awaitingHandover: false,
    href: `/inventory/sales/${invoice.id}`,
    storeId: invoice.store_id != null ? String(invoice.store_id) : null,
  };
};

/** An online order still awaiting any handover, used by the Quick Handover card. */
export const isAwaitingHandover = (request: PurchaseRequest): boolean => {
  const status = (request.status || "").toUpperCase();
  if (status !== "PAID") return false;
  return !handoverProgress(request.items).complete;
};
