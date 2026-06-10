/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Edit, MoveLeft, MoveRight, Printer, X, RotateCcw } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { getSaleById, handleReturnItems } from "@/lib/utils/api/apiHelper";
import { SaleInvoice, SaleInvoiceItem } from "@/types/sales";

interface ReturnEntry {
  item_id: string;
  quantity: number; // how many are being returned (starts at 0)
  reason: string;
  originalQuantity: number;
  unitPrice: number;
  productName: string;
  originalSubtotal: number;
}

const RETURN_REASONS = ["Damaged", "Wrong Item", "Expired", "Other"];

export default function SaleInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [invoice, setInvoice] = useState<SaleInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [returnMode, setReturnMode] = useState(false);
  const [returnEntries, setReturnEntries] = useState<Record<string, ReturnEntry>>({});
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState(false);

  const formatCurrency = (amount?: number | null) => {
    const safeAmount = typeof amount === "number" ? amount : 0;
    return safeAmount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });
  };

  const getAmountPayable = (inv: SaleInvoice) =>
    inv.amount_payable ?? inv.attributes?.amount_payable ?? inv.total ?? 0;

  const getTotalQuantity = (inv: SaleInvoice) =>
    inv.total_quantity ?? inv.attributes?.total_quantity ?? inv.items_count ?? 0;

  const getTotalDiscount = (inv: SaleInvoice) =>
    inv.total_discount ?? inv.attributes?.total_discount ?? 0;

  useEffect(() => {
    if (!id) {
      setError("No invoice ID provided");
      setLoading(false);
      return;
    }
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSaleById(id);
        if (res.statusCode === 200 && res.data) {
          setInvoice(res.data);
        } else {
          setError(res.error || "Failed to load invoice");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "completed")
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Completed
        </span>
      );
    if (s === "pending")
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    return (
      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
        {status || "Unknown"}
      </span>
    );
  };

  const numberToWords = (num: number): string => {
    const n = Math.floor(num);
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const convertHundreds = (n: number): string => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    };
    const convertChunk = (n: number): string => {
      if (n === 0) return "";
      if (n < 100) return convertHundreds(n);
      return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertHundreds(n % 100) : "");
    };
    if (n === 0) return "Zero";
    const billions = Math.floor(n / 1000000000);
    const millions = Math.floor((n % 1000000000) / 1000000);
    const thousands = Math.floor((n % 1000000) / 1000);
    const rest = n % 1000;
    let result = "";
    if (billions) result += convertChunk(billions) + " Billion ";
    if (millions) result += convertChunk(millions) + " Million ";
    if (thousands) result += convertChunk(thousands) + " Thousand ";
    if (rest) result += convertChunk(rest);
    return result.trim() + " Naira Only";
  };

  const handlePrintSmall = () => {
    if (!invoice) return alert("Invoice data not loaded yet");
    setShowPrintModal(false);
    setTimeout(() => {
      document.body.setAttribute("data-print-mode", "thermal");
      window.print();
      document.body.removeAttribute("data-print-mode");
    }, 100);
  };

  const handlePrintBig = () => {
    if (!invoice) return alert("Invoice data not loaded yet");
    setShowPrintModal(false);
    setTimeout(() => {
      document.body.setAttribute("data-print-mode", "a4");
      window.print();
      document.body.removeAttribute("data-print-mode");
    }, 100);
  };

  const openReturnMode = () => {
    setReturnEntries({});
    setReturnError(null);
    setReturnSuccess(false);
    setReturnMode(true);
  };

  const closeReturnMode = () => {
    setReturnMode(false);
    setReturnEntries({});
    setReturnError(null);
    setReturnSuccess(false);
  };

  // Toggle: selecting an item starts it with returnQty = 0 (nothing deducted yet)
  const toggleItemReturn = (item: SaleInvoiceItem) => {
    setReturnEntries((prev) => {
      if (prev[item.id]) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return {
        ...prev,
        [item.id]: {
          item_id: item.id,
          quantity: 0, // return qty starts at 0 — user increments to choose how many to return
          reason: RETURN_REASONS[0],
          originalQuantity: Number(item.quantity),
          unitPrice: Number(item.stock?.price ?? 0),
          productName: item.product?.name ?? "Product",
          originalSubtotal: Number(item.sub_total),
        },
      };
    });
  };

  const updateReturnQty = (itemId: string, delta: number) => {
    setReturnEntries((prev) => {
      const entry = prev[itemId];
      if (!entry) return prev;
      // returnQty can go from 0 up to originalQuantity
      const newQty = Math.max(0, Math.min(entry.originalQuantity, entry.quantity + delta));
      return { ...prev, [itemId]: { ...entry, quantity: newQty } };
    });
  };

  const updateReturnReason = (itemId: string, reason: string) => {
    setReturnEntries((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], reason },
    }));
  };

  // Total being credited = sum of (returnQty * unitPrice) per selected item
  const returnCredit = Object.values(returnEntries).reduce(
    (sum, e) => sum + e.quantity * e.unitPrice,
    0
  );

  const originalTotal = invoice ? getAmountPayable(invoice) : 0;
  // Live grand subtotal = original total minus what's being returned
  const liveGrandTotal = originalTotal - returnCredit;

  const handleConfirmReturn = async () => {
    if (!invoice) return;
    const items = Object.values(returnEntries).filter((e) => e.quantity > 0);
    if (items.length === 0) {
      setReturnError("Please select at least one item and set a return quantity.");
      return;
    }
    setReturnLoading(true);
    setReturnError(null);
    try {
      const payload = {
        invoice_id: invoice.id,
        items: items.map(({ item_id, quantity, reason }) => ({ item_id, quantity, reason })),
      };
      const res = await handleReturnItems(payload);
      if (res?.statusCode === 200 || res?.success) {
        setReturnSuccess(true);
        const updated = await getSaleById(id);
        if (updated.statusCode === 200 && updated.data) setInvoice(updated.data);
        setTimeout(() => closeReturnMode(), 2000);
      } else {
        setReturnError(res?.error || res?.message || "Failed to process return");
      }
    } catch (err: any) {
      setReturnError(err.message || "An error occurred");
    } finally {
      setReturnLoading(false);
    }
  };

  const isCompleted = invoice?.status?.toLowerCase() === "completed";
  const selectedCount = Object.keys(returnEntries).length;
  const itemsWithQty = Object.values(returnEntries).filter((e) => e.quantity > 0).length;

  return (
    <div className="">
      <style>{`
        @media print {
          .print-hidden { display: none !important; }
          body * { visibility: hidden; }
          #print-thermal, #print-a4 { position: absolute; top: 0; left: 0; width: 100%; }
          body[data-print-mode="thermal"] #print-thermal,
          body[data-print-mode="a4"] #print-a4 { display: block; }
          body[data-print-mode="thermal"] #print-thermal *,
          body[data-print-mode="a4"] #print-a4 * { visibility: visible; }
          body[data-print-mode="a4"] @page { size: A4; margin: 15mm; }
        }
        @media screen {
          #print-thermal, #print-a4 { display: none; }
        }
      `}</style>

      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/inventory/sales")}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors mb-4 print-hidden"
      >
        <MoveLeft className="w-5 h-5" />
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-between print-hidden mb-1">
        <div className="mb-4 md:mb-6">
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
            {invoice?.code || "Loading..."}
          </h1>
          <p className="font-medium text-[13px] md:text-[16px] font-dm-sans text-[#9E9A9A]">
            View all items sold in this invoice
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-end">
          {invoice?.status?.toLowerCase() === "pending" && (
            <button
              onClick={() => router.push(`/inventory/sales/edit/${invoice.id}`)}
              className="flex cursor-pointer items-center gap-2 text-[#0A2540] hover:text-[#0A6DC0]"
            >
              <Edit className="w-5 h-5" />
              Edit
            </button>
          )}
          {isCompleted && !returnMode && (
            <button
              onClick={openReturnMode}
              className="flex items-center gap-2 text-[#0A2540] hover:text-[#0A6DC0] cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              Return Items
            </button>
          )}
          {returnMode && (
            <button
              onClick={closeReturnMode}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 cursor-pointer text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Cancel Return
            </button>
          )}
          <div
            className="flex items-center gap-2 text-[#0A2540] hover:text-[#0A6DC0] cursor-pointer"
            onClick={() => setShowPrintModal(true)}
          >
            <Printer className="w-5 h-5" />
            <span>Print</span>
          </div>
        </div>
      </div>

      {/* Return mode banner */}
      {returnMode && (
        <div className="flex items-center gap-2 mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 print-hidden">
          <RotateCcw className="w-4 h-4 flex-shrink-0" />
          <span>
            <span className="font-semibold">Return Mode</span> — check items to return, use +/− to set how many, then confirm in the summary.
          </span>
        </div>
      )}

      {/* MAIN: table + return panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start print-hidden">

        {/* TABLE */}
        <div className="w-full min-w-0 flex-1">
          <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sold Items ({invoice?.items_count || 0})
            </h2>

            {loading ? (
              <div className="py-16 text-center text-gray-500">
                <div className="flex justify-center">
                  <ThreeDots height="40" width="40" color="#0A6DC0" visible />
                </div>
                <p className="mt-4">Loading invoice details...</p>
              </div>
            ) : error || !invoice ? (
              <div className="py-16 text-center text-red-600">{error || "Invoice not found"}</div>
            ) : invoice.items?.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No items in this invoice</div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto text-[#2F2F2F]">
                  <table className="min-w-full whitespace-nowrap divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {returnMode && <th className="px-4 py-3 w-10" />}
                        <th className="px-6 py-3 text-left font-medium">Product</th>
                        <th className="px-6 py-3 text-left font-medium">Quantity</th>
                        <th className="px-6 py-3 text-left font-medium">Unit Cost</th>
                        <th className="px-6 py-3 text-left font-medium">Subtotal</th>
                        {!returnMode && (
                          <>
                            <th className="px-6 py-3 text-left font-medium">Profit</th>
                            <th className="px-6 py-3 text-left font-medium">Invoice Status</th>
                            <th className="px-6 py-3 text-left font-medium">More</th>
                          </>
                        )}
                        {returnMode && (
                          <th className="px-6 py-3 text-left font-medium">Reason</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items.map((item: SaleInvoiceItem) => {
                        const entry = returnEntries[item.id];
                        const isSelected = !!entry;
                        // Subtotal shown = original subtotal minus (returnQty * unitPrice)
                        const deducted = isSelected ? entry.quantity * entry.unitPrice : 0;
                        const displaySubtotal = Number(item.sub_total) - deducted;

                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${
                              returnMode
                                ? isSelected
                                  ? "bg-blue-50 border-l-4 border-l-[#0A6DC0]"
                                  : "hover:bg-gray-50"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={
                              !returnMode
                                ? () => router.push(`/inventory/sales/${id}/item/${item.id}`)
                                : undefined
                            }
                          >
                            {/* Checkbox — return mode */}
                            {returnMode && (
                              <td className="pl-2 py-4" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleItemReturn(item)}
                                  className="w-4 h-4 accent-[#0A6DC0] cursor-pointer"
                                />
                              </td>
                            )}

                            {/* Product */}
                            <td className="px-2 py-4">
                              <div className="flex gap-3 items-center">
                                <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                                  {item.product?.image ? (
                                    <Image
                                      src={item.product.image.startsWith("//") ? `https:${item.product.image}` : item.product.image}
                                      alt={item.product.name || "Product"}
                                      width={48}
                                      height={48}
                                      className="object-contain w-full h-full"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                      No img
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">{item.product?.name || "Unnamed Product"}</div>
                                  <div className="text-xs text-gray-500">Mode: {item.mode}</div>
                                </div>
                              </div>
                            </td>

                            {/* Quantity — shows stepper for return qty when selected */}
                            <td className="px-6 py-4" onClick={(e) => returnMode && e.stopPropagation()}>
                              {returnMode && isSelected ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs text-gray-400">Total: {Number(item.quantity)}</span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => updateReturnQty(item.id, -1)}
                                      disabled={entry.quantity <= 0}
                                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 text-sm font-bold leading-none"
                                    >
                                      −
                                    </button>
                                    <span className="w-6 text-center text-sm font-semibold text-red-500">
                                      {entry.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateReturnQty(item.id, 1)}
                                      disabled={entry.quantity >= entry.originalQuantity}
                                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 text-sm font-bold leading-none"
                                    >
                                      +
                                    </button>
                                    <span className="text-[11px] text-gray-400">returning</span>
                                  </div>
                                </div>
                              ) : (
                                <span>{item.quantity}</span>
                              )}
                            </td>

                            {/* Unit Cost */}
                            <td className="px-6 py-4">{formatCurrency(item.stock.price)}</td>

                            {/* Subtotal — live deduction */}
                            <td className="px-6 py-4 font-medium">
                              <div className="flex flex-col">
                                <span className={isSelected && deducted > 0 ? "text-[#0A6DC0]" : ""}>
                                  {formatCurrency(displaySubtotal)}
                                </span>
                                {isSelected && deducted > 0 && (
                                  <span className="text-[11px] text-red-400 line-through">
                                    {formatCurrency(Number(item.sub_total))}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Normal mode cols */}
                            {!returnMode && (
                              <>
                                <td className="px-6 py-4 font-medium">{formatCurrency(item.profit)}</td>
                                <td className="px-6 py-4">{getStatusBadge(invoice.status || "unknown")}</td>
                                <td className="px-6 py-4 text-sm">
                                  <MoveRight className="w-5 h-5 text-gray-500" />
                                </td>
                              </>
                            )}

                            {/* Reason — return mode */}
                            {returnMode && (
                              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                {isSelected ? (
                                  <select
                                    value={entry.reason}
                                    onChange={(e) => updateReturnReason(item.id, e.target.value)}
                                    className="border border-gray-300 rounded-lg text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0A6DC0] bg-white"
                                  >
                                    {RETURN_REASONS.map((r) => (
                                      <option key={r} value={r}>{r}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-gray-300 text-xs">—</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* Live grand total row in return mode */}
                    {returnMode && invoice && (
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                          <td colSpan={5} className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            Grand Total:
                          </td>
                          <td className="px-6 py-3 text-left font-bold text-base text-[#0A6DC0]">
                            <div className="flex flex-col">
                              <span>{formatCurrency(liveGrandTotal)}</span>
                              {returnCredit > 0 && (
                                <span className="text-xs text-red-400 line-through font-normal">
                                  {formatCurrency(originalTotal)}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RETURN SUMMARY PANEL — inline right, stacks below on mobile */}
        {returnMode && (
          <div className="w-full lg:w-[300px] lg:flex-shrink-0 border border-[#E4E4E4] rounded-[20px] bg-white p-5 flex flex-col lg:sticky lg:top-6 lg:self-start">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-[#2F2F2F]">Return Summary</h3>
              <button onClick={closeReturnMode} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Review the items the customer is returning before confirming.
            </p>

            <div className="space-y-3 min-h-[60px]">
              {selectedCount === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">No items selected yet</p>
              ) : (
                Object.values(returnEntries).map((entry) => (
                  <div key={entry.item_id} className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#2F2F2F] truncate leading-tight">
                        {entry.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.quantity > 0
                          ? `×${entry.quantity} returning · ${entry.reason}`
                          : "No qty set yet"}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold whitespace-nowrap ${entry.quantity > 0 ? "text-red-500" : "text-gray-300"}`}>
                      {entry.quantity > 0 ? `−${formatCurrency(entry.quantity * entry.unitPrice)}` : "−₦0"}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-200 pt-3 mt-4 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Original total</span>
                <span>{formatCurrency(originalTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-500">
                <span>Return credit</span>
                <span>−{formatCurrency(returnCredit)}</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold text-[#2F2F2F] pt-1 border-t border-gray-100 mt-1">
                <span>Revised total</span>
                <span className="text-[#0A6DC0]">{formatCurrency(liveGrandTotal)}</span>
              </div>
            </div>

            {returnCredit > 0 && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 leading-relaxed">
                ⓘ The invoice status will update to{" "}
                <span className="font-semibold">Partially Returned</span> and the customer's credit balance will be reduced.
              </div>
            )}

            {returnError && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{returnError}</p>
            )}

            {returnSuccess && (
              <p className="mt-3 text-xs text-green-700 bg-green-50 rounded-xl px-3 py-2 font-medium">
                ✓ Return processed successfully!
              </p>
            )}

            <button
              onClick={handleConfirmReturn}
              disabled={returnLoading || itemsWithQty === 0}
              className="mt-4 w-full bg-[#0A6DC0] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#0859a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {returnLoading ? (
                <ThreeDots height="20" width="32" color="#ffffff" visible />
              ) : (
                `Confirm Return · ${formatCurrency(returnCredit)}`
              )}
            </button>

            <button
              onClick={closeReturnMode}
              className="mt-2 w-full border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel Return
            </button>
          </div>
        )}
      </div>

      {/* PRINT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print-hidden">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[320px] relative">
            <button onClick={() => setShowPrintModal(false)} className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-500">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-[#2F2F2F] mb-1">Select Print Format</h3>
            <p className="text-sm text-gray-500 mb-5">Choose how you want to print this invoice</p>
            <div className="flex flex-col gap-3">
              <button onClick={handlePrintSmall} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#0A6DC0] hover:bg-blue-50 transition-all group text-left">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-blue-100">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-600 group-hover:text-[#0A6DC0]">
                    <rect x="4" y="8" width="16" height="8" rx="2" />
                    <path d="M8 8V5a1 1 0 011-1h6a1 1 0 011 1v3" />
                    <path d="M8 16v3h8v-3" />
                    <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[#2F2F2F] text-sm">Small (Thermal)</div>
                  <div className="text-xs text-gray-500">80mm receipt — for thermal printers</div>
                </div>
              </button>
              <button onClick={handlePrintBig} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#0A6DC0] hover:bg-blue-50 transition-all group text-left">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-blue-100">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-600 group-hover:text-[#0A6DC0]">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M8 7h8M8 11h8M8 15h5" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[#2F2F2F] text-sm">Big (Full Invoice)</div>
                  <div className="text-xs text-gray-500">A4 format — for standard printers</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THERMAL PRINT */}
      <div id="print-thermal">
        {invoice && (
          <div className="w-[80mm] mx-auto p-3 text-[13px] leading-tight relative min-h-[400px]" style={{ fontFamily: "monospace" }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0">
              <div className="relative w-[220px] h-[220px]">
                <Image src="/invoice-logo.png" alt="Watermark" fill className="object-contain" priority />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-center mb-4">
                <h3 className="font-bold text-base uppercase">{invoice.store?.name || "TEST STORE"}</h3>
                {invoice.store?.address && (
                  <p className="text-[10px] mt-1 whitespace-pre-line">
                    {typeof invoice.store.address === "object" ? (invoice.store.address as any)?.name || JSON.stringify(invoice.store.address) : invoice.store.address}
                  </p>
                )}
                {invoice.store?.phone && <p className="text-[10px]">Mobile: {invoice.store.phone}</p>}
                <div className="mt-3 text-xs border-b border-dashed pb-2">
                  <p>Invoice No: {invoice.code}</p>
                  <p>Date: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit" }) + ", " + new Date(invoice.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="font-bold text-xs border-b border-dashed pb-1 mb-1">Items</div>
                {invoice.items?.map((item) => (
                  <div key={item.id} className="mb-2 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="flex-1 pr-2">{item.product?.name || "Product"}</span>
                      <span className="font-mono text-right">{formatCurrency(item.sub_total)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600 pl-1">
                      <span>{Number(item.quantity)} × {formatCurrency(item.stock?.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs border-t border-dashed pt-2 space-y-1">
                <div className="flex justify-between"><span>Discount Amount:</span><span>{formatCurrency(getTotalDiscount(invoice))}</span></div>
                <div className="flex justify-between"><span>Returnable Fee:</span><span>{formatCurrency(invoice.empties_value ?? invoice.empties_owed ?? 0)}</span></div>
                <div className="flex justify-between font-bold text-sm border-t border-dashed pt-2 mt-2">
                  <span>Amount Payable:</span><span>{formatCurrency(getAmountPayable(invoice))}</span>
                </div>
              </div>
              <div className="text-xs mt-4 border-t border-dashed pt-3">
                <p>Customer details</p>
                <p className="font-medium">{invoice.customer?.name || "Walk-in Customer"}</p>
                <p className="font-bold mt-3 text-sm text-center">**** {invoice.status?.toUpperCase() || "COMPLETED"} ****</p>
                <p className="text-[10px] mt-2 text-center">Thank you for your patronage!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* A4 PRINT */}
      <div id="print-a4">
        {invoice && (
          <div className="max-w-[720px] mx-auto p-8 text-sm text-gray-800" style={{ fontFamily: "Arial, sans-serif" }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 print:opacity-10" style={{ zIndex: 0 }}>
              <div className="relative w-[700px] h-[700px]">
                <Image src="/invoice-logo.png" alt="Watermark" fill className="object-contain" priority />
              </div>
            </div>
            <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
              <div className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">SALE INVOICE</div>
              <div className="text-2xl font-bold text-gray-900">{invoice.store?.name || "YOUR STORE"}</div>
              {invoice.store?.address && <div className="text-xs text-gray-600 mt-1">{typeof invoice.store.address === "object" ? invoice.store.address.name : invoice.store.address}</div>}
              {invoice.store?.phone && <div className="text-xs text-gray-600">Tel: {invoice.store.phone}</div>}
            </div>
            <div className="flex justify-between mb-6">
              <div>
                <div className="font-bold text-xs uppercase text-gray-500 mb-1">Party Details:</div>
                <div className="font-semibold text-base">{invoice.customer?.name || "Walk-in Customer"}</div>
                {invoice.customer?.phone && <div className="text-sm">{invoice.customer.phone}</div>}
                {invoice.customer?.address && <div className="text-xs text-gray-600 mt-1">{typeof invoice.customer.address === "object" ? invoice.customer.address.address : invoice.customer.address}</div>}
              </div>
              <div className="text-right">
                <div className="mb-1"><span className="font-semibold">Invoice No.: </span><span className="font-mono">{invoice.code}</span></div>
                <div className="mb-1"><span className="font-semibold">Date: </span>{invoice.created_at ? new Date(invoice.created_at).toLocaleDateString("en-NG", { day: "2-digit", month: "long", year: "numeric" }) : ""}</div>
                <div className="mb-1"><span className="font-semibold">Time: </span>{invoice.created_at ? new Date(invoice.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : ""}</div>
                <div><span className="font-semibold">Status: </span>{invoice.status || "Unknown"}</div>
              </div>
            </div>
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="border border-gray-800 bg-gray-100">
                  <th className="border border-gray-800 px-3 py-2 text-left w-12">S.No</th>
                  <th className="border border-gray-800 px-3 py-2 text-left">Description</th>
                  <th className="border border-gray-800 px-3 py-2 text-center w-16">Qty</th>
                  <th className="border border-gray-800 px-3 py-2 text-center w-20">Unit</th>
                  <th className="border border-gray-800 px-3 py-2 text-right w-28">Price (₦)</th>
                  <th className="border border-gray-800 px-3 py-2 text-right w-32">Amount (₦)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, idx) => (
                  <tr key={item.id} className="border border-gray-400">
                    <td className="border border-gray-400 px-3 py-2 text-center">{idx + 1}</td>
                    <td className="border border-gray-400 px-3 py-2">
                      <div className="font-medium">{item.product?.name || "Product"}</div>
                      <div className="text-xs text-gray-500">Mode: {item.mode}</div>
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-400 px-3 py-2 text-center">{item.mode === "PACKS" ? "Pack(s)" : "Piece(s)"}</td>
                    <td className="border border-gray-400 px-3 py-2 text-right">{Number(item.stock.price).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
                    <td className="border border-gray-400 px-3 py-2 text-right">{Number(item.sub_total).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border border-gray-800 bg-gray-50">
                  <td colSpan={2} className="border border-gray-800 px-3 py-2 text-right font-bold">Total Items: {getTotalQuantity(invoice)}</td>
                  <td className="border border-gray-800 px-3 py-2 text-center font-bold" />
                  <td className="border border-gray-800 px-3 py-2" />
                  <td className="border border-gray-800 px-3 py-2 text-right font-bold">Subtotal:</td>
                  <td className="border border-gray-800 px-3 py-2 text-right font-bold">₦{Number(getAmountPayable(invoice) + getTotalDiscount(invoice)).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
                </tr>
                {getTotalDiscount(invoice) > 0 && (
                  <tr className="border border-gray-400">
                    <td colSpan={4} className="border border-gray-400 px-3 py-2" />
                    <td className="border border-gray-400 px-3 py-2 text-right">Discount:</td>
                    <td className="border border-gray-400 px-3 py-2 text-right">₦{Number(getTotalDiscount(invoice)).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
                  </tr>
                )}
                <tr className="border border-gray-800 bg-gray-100 font-bold">
                  <td colSpan={4} className="border border-gray-800 px-3 py-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Amount in Words:</span>
                      <span className="text-sm font-normal ml-2">{numberToWords(getAmountPayable(invoice))}</span>
                    </div>
                  </td>
                  <td className="border border-gray-800 px-3 py-2 text-right text-base">GRAND TOTAL:</td>
                  <td className="border border-gray-800 px-3 py-2 text-right text-base">₦{Number(getAmountPayable(invoice)).toLocaleString("en-NG", { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
            <div className="border border-gray-400 bg-gray-50 px-4 py-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Payable:</span>
                <span className="text-xl font-bold">{formatCurrency(getAmountPayable(invoice))}</span>
              </div>
              {getTotalDiscount(invoice) > 0 && (
                <div className="text-xs text-gray-500 mt-1">* Discount of {formatCurrency(getTotalDiscount(invoice))} has been applied</div>
              )}
            </div>
            <div className="flex justify-between mt-8 pt-4">
              <div className="text-xs w-1/2">
                <div className="font-bold mb-2">Terms & Conditions:</div>
                <ul className="list-disc list-inside space-y-1 text-gray-600"><li>Goods once sold will not be taken back</li></ul>
              </div>
              <div className="text-right text-xs w-1/2">
                <div className="mb-12"><div className="font-semibold">for {invoice.store?.name || "Store"}</div></div>
                <div className="border-t border-gray-500 pt-1 inline-block min-w-[140px]">Authorised Signatory</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}