/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Edit, MoveLeft, MoveRight, Printer, X } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { getSaleById } from "@/lib/utils/api/apiHelper";
import { SaleInvoice, SaleInvoiceItem } from "@/types/sales";

export default function SaleInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [invoice, setInvoice] = useState<SaleInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

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
    inv.total_quantity ??
    inv.attributes?.total_quantity ??
    inv.items_count ??
    0;

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
    if (s === "completed") {
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
        {status || "Unknown"}
      </span>
    );
  };

  // Add this helper function to convert number to words
  const numberToWords = (num: number): string => {
    const n = Math.floor(num);

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const convertHundreds = (n: number): string => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      return tens[ten] + (unit ? " " + ones[unit] : "");
    };

    const convertChunk = (n: number): string => {
      if (n === 0) return "";
      if (n < 100) return convertHundreds(n);
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      return (
        ones[hundred] +
        " Hundred" +
        (remainder ? " and " + convertHundreds(remainder) : "")
      );
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
    if (!invoice) {
      alert("Invoice data not loaded yet");
      return;
    }
    setShowPrintModal(false);
    setTimeout(() => {
      document.body.setAttribute("data-print-mode", "thermal");
      window.print();
      document.body.removeAttribute("data-print-mode");
    }, 100);
  };

  const handlePrintBig = () => {
    if (!invoice) {
      alert("Invoice data not loaded yet");
      return;
    }
    setShowPrintModal(false);
    setTimeout(() => {
      document.body.setAttribute("data-print-mode", "a4");
      window.print();
      document.body.removeAttribute("data-print-mode");
    }, 100);
  };

  return (
    <div className="">
      {/* PRINT CSS */}
      <style>{`
        @media print {
          .print-hidden { display: none !important; }
          
          /* Hide everything by default in print */
          body * {
            visibility: hidden;
          }
          
          /* Show only the selected print format */
          #print-thermal, #print-a4 {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          
          body[data-print-mode="thermal"] #print-thermal,
          body[data-print-mode="a4"] #print-a4 {
            display: block;
          }
          
          body[data-print-mode="thermal"] #print-thermal *,
          body[data-print-mode="a4"] #print-a4 * {
            visibility: visible;
          }
          
          /* Page setup for thermal */
          body[data-print-mode="thermal"] @page {
            size: 80mm auto;
            margin: 0mm;
          }
          
          /* Page setup for A4 */
          body[data-print-mode="a4"] @page {
            size: A4;
            margin: 15mm;
          }
        }
        
        @media screen {
          #print-thermal, #print-a4 {
            display: none;
          }
        }
      `}</style>

      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors mb-4 print-hidden"
      >
        <MoveLeft className="w-5 h-5" />
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-between print-hidden">
        <div className="mb-4 md:mb-6">
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
            {invoice?.code || "Loading..."}
          </h1>
          <p className="font-medium text-[13px] md:text-[16px] font-dm-sans text-[#9E9A9A]">
            View all items sold in this invoice
          </p>
        </div>

        <div className="flex items-center gap-10 flex-col md:flex-row">
          {invoice?.status?.toLowerCase() === "pending" && (
            <button
              onClick={() => router.push(`/inventory/sales/edit/${invoice.id}`)}
              className="flex cursor-pointer items-center gap-2 text-[#0A2540] hover:text-[#0A6DC0]"
            >
              <Edit />
              Edit
            </button>
          )}

          <div
            className="flex items-center gap-2 text-[#0A2540] hover:text-[#0A6DC0] cursor-pointer"
            onClick={() => setShowPrintModal(true)}
          >
            <Printer />
            <button>Print</button>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white print-hidden">
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
          <div className="py-16 text-center text-red-600">
            {error || "Invoice not found"}
          </div>
        ) : invoice.items?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No items in this invoice
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto text-[#2F2F2F]">
              <table className="min-w-full whitespace-nowrap divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Product</th>
                    <th className="px-6 py-3 text-left font-medium">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left font-medium">
                      Unit Cost
                    </th>
                    <th className="px-6 py-3 text-left font-medium">
                      Subtotal
                    </th>
                    <th className="px-6 py-3 text-left font-medium">Profit</th>
                    <th className="px-6 py-3 text-left font-medium">
                      Invoice Status
                    </th>
                    <th className="px-6 py-3 text-left font-medium">More</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item: SaleInvoiceItem) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/inventory/sales/${id}/item/${item.id}`)
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex gap-3 items-center">
                          <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border border-gray-200">
                            {item.product?.image ? (
                              <Image
                                src={
                                  item.product.image.startsWith("//")
                                    ? `https:${item.product.image}`
                                    : item.product.image
                                }
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
                            <div className="text-sm font-medium">
                              {item.product?.name || "Unnamed Product"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Mode: {item.mode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">
                        {formatCurrency(item.stock.price)}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(item.sub_total)}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(item.profit)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invoice.status || "unknown")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <MoveRight className="w-5 h-5 text-gray-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* PRINT FORMAT PICKER MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print-hidden">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[320px] relative">
            <button
              onClick={() => setShowPrintModal(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-semibold text-[#2F2F2F] mb-1">
              Select Print Format
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Choose how you want to print this invoice
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePrintSmall}
                className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#0A6DC0] hover:bg-blue-50 transition-all group text-left"
              >
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-blue-100">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="text-gray-600 group-hover:text-[#0A6DC0]"
                  >
                    <rect x="4" y="8" width="16" height="8" rx="2" />
                    <path d="M8 8V5a1 1 0 011-1h6a1 1 0 011 1v3" />
                    <path d="M8 16v3h8v-3" />
                    <circle
                      cx="17"
                      cy="12"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[#2F2F2F] text-sm">
                    Small (Thermal)
                  </div>
                  <div className="text-xs text-gray-500">
                    80mm receipt — for thermal printers
                  </div>
                </div>
              </button>

              <button
                onClick={handlePrintBig}
                className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#0A6DC0] hover:bg-blue-50 transition-all group text-left"
              >
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-blue-100">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="text-gray-600 group-hover:text-[#0A6DC0]"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M8 7h8M8 11h8M8 15h5" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[#2F2F2F] text-sm">
                    Big (Full Invoice)
                  </div>
                  <div className="text-xs text-gray-500">
                    A4 format — for standard printers
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THERMAL PRINT TARGET (80mm) */}
      {/* THERMAL PRINT TARGET (80mm) - Exact Match to Receipt Image */}
      <div id="print-thermal">
        {invoice && (
          <div
            className="w-[80mm] mx-auto p-3 text-[13px] leading-tight relative min-h-[400px]"
            style={{ fontFamily: "monospace" }}
          >
            {/* Background Logo - Same style as A4 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0">
              <div className="relative w-[220px] h-[220px]">
                <Image
                  src="/invoice-logo.png"
                  alt="Watermark"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-base uppercase">
                  {invoice.store?.name || "TEST STORE"}
                </h3>

                {/* Address */}
                {invoice.store?.address && (
                  <p className="text-[10px] mt-1 whitespace-pre-line">
                    {typeof invoice.store.address === "object"
                      ? (invoice.store.address as any)?.name ||
                        JSON.stringify(invoice.store.address)
                      : invoice.store.address}
                  </p>
                )}

                {invoice.store?.phone && (
                  <p className="text-[10px]">Mobile: {invoice.store.phone}</p>
                )}

                <div className="mt-3 text-xs border-b border-dashed pb-2">
                  <p>Invoice No: {invoice.code}</p>
                  <p>
                    Date:{" "}
                    {invoice.created_at
                      ? new Date(invoice.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "2-digit",
                          },
                        ) +
                        ", " +
                        new Date(invoice.created_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : ""}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mb-3">
                <div className="font-bold text-xs border-b border-dashed pb-1 mb-1">
                  Items
                </div>

                {invoice.items?.map((item) => (
                  <div key={item.id} className="mb-2 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="flex-1 pr-2">
                        {item.product?.name || "Product"}
                      </span>
                      <span className="font-mono text-right">
                        {formatCurrency(item.sub_total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600 pl-1">
                      <span>
                        {Number(item.quantity)} ×{" "}
                        {formatCurrency(item.stock?.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="text-xs border-t border-dashed pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Discount Amount:</span>
                  <span>
                    {getTotalDiscount(invoice) > 0
                      ? `${formatCurrency(getTotalDiscount(invoice))}`
                      : formatCurrency(0)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Returnable Fee:</span>
                  <span>
                    {formatCurrency(
                      invoice.empties_value ?? invoice.empties_owed ?? 0,
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-sm border-t border-dashed pt-2 mt-2">
                  <span>Amount Payable:</span>
                  <span>{formatCurrency(getAmountPayable(invoice))}</span>
                </div>
              </div>

              {/* Footer */}
              <div className=" text-xs mt-4 border-t border-dashed pt-3">
                <p>Customer details</p>
                <p className="font-medium">
                  {invoice.customer?.name || "Walk-in Customer"}
                </p>

                <p className="font-bold mt-3 text-sm  text-center">
                  **** {invoice.status?.toUpperCase() || "COMPLETED"} ****
                </p>

                <p className="text-[10px] mt-2 text-center">
                  Thank you for your patronage!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* A4 PRINT TARGET (Full Invoice) */}
      <div id="print-a4">
        {invoice && (
          <div
            className="max-w-[720px] mx-auto p-8 text-sm text-gray-800"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 print:opacity-10"
              style={{ zIndex: 0 }}
            >
              <div className="relative w-[700px] h-[700px]">
                <Image
                  src="/invoice-logo.png"
                  alt="Watermark"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
              <div className="text-xs font-semibold tracking-widest uppercase text-gray-600 mb-1">
                SALE INVOICE
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {invoice.store?.name || "YOUR STORE"}
              </div>
              {invoice.store?.address && (
                <div className="text-xs text-gray-600 mt-1">
                  {typeof invoice.store.address === "object"
                    ? invoice.store.address.name
                    : invoice.store.address}
                </div>
              )}
              {invoice.store?.phone && (
                <div className="text-xs text-gray-600">
                  Tel: {invoice.store.phone}
                </div>
              )}
              {/* {invoice.store?.phone && (
                <div className="text-xs text-gray-600">Tel: {invoice.store.phone}</div>
              )}
              {invoice.store?.email && (
                <div className="text-xs text-gray-600">Email: {invoice.store.email}</div>
              )} */}
            </div>

            <div className="flex justify-between mb-6">
              <div>
                <div className="font-bold text-xs uppercase text-gray-500 mb-1">
                  Party Details:
                </div>
                <div className="font-semibold text-base">
                  {invoice.customer?.name || "Walk-in Customer"}
                </div>
                {invoice.customer?.phone && (
                  <div className="text-sm">{invoice.customer.phone}</div>
                )}
                {invoice.customer?.address && (
                  <div className="text-xs text-gray-600 mt-1">
                    {typeof invoice.customer.address === "object"
                      ? invoice.customer.address.address
                      : invoice.customer.address}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="mb-1">
                  <span className="font-semibold">Invoice No.: </span>
                  <span className="font-mono">{invoice.code}</span>
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Date: </span>
                  {invoice.created_at
                    ? new Date(invoice.created_at).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Time: </span>
                  {invoice.created_at
                    ? new Date(invoice.created_at).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
                <div>
                  <span className="font-semibold">Status: </span>
                  <span
                  // className={
                  //   invoice.status === "completed"
                  //     ? ""
                  //     : "text-yellow-600"
                  // }
                  >
                    {invoice.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="border border-gray-800 bg-gray-100">
                  <th className="border border-gray-800 px-3 py-2 text-left w-12">
                    S.No
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-left">
                    Description
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-center w-16">
                    Qty
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-center w-20">
                    Unit
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-right w-28">
                    Price (₦)
                  </th>
                  <th className="border border-gray-800 px-3 py-2 text-right w-32">
                    Amount (₦)
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, idx) => (
                  <tr key={item.id} className="border border-gray-400">
                    <td className="border border-gray-400 px-3 py-2 text-center">
                      {idx + 1}
                    </td>
                    <td className="border border-gray-400 px-3 py-2">
                      <div className="font-medium">
                        {item.product?.name || "Product"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Mode: {item.mode}
                      </div>
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-center">
                      {item.mode === "PACKS" ? "Pack(s)" : "Piece(s)"}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-right">
                      {Number(item.stock.price).toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-right">
                      {Number(item.sub_total).toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border border-gray-800 bg-gray-50">
                  <td
                    colSpan={2}
                    className="border border-gray-800 px-3 py-2 text-right font-bold"
                  >
                    Total Items: {getTotalQuantity(invoice)}
                  </td>
                  <td className="border border-gray-800 px-3 py-2 text-center font-bold"></td>
                  <td className="border border-gray-800 px-3 py-2"></td>
                  <td className="border border-gray-800 px-3 py-2 text-right font-bold">
                    Subtotal:
                  </td>
                  <td className="border border-gray-800 px-3 py-2 text-right font-bold">
                    ₦
                    {Number(
                      getAmountPayable(invoice) + getTotalDiscount(invoice),
                    ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {getTotalDiscount(invoice) > 0 && (
                  <tr className="border border-gray-400">
                    <td
                      colSpan={4}
                      className="border border-gray-400 px-3 py-2"
                    ></td>
                    <td className="border border-gray-400 px-3 py-2 text-right">
                      Discount:
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-right ">
                      ₦
                      {Number(getTotalDiscount(invoice)).toLocaleString(
                        "en-NG",
                        { minimumFractionDigits: 2 },
                      )}
                    </td>
                  </tr>
                )}
                <tr className="border border-gray-800 bg-gray-100 font-bold">
                  <td colSpan={4} className="border border-gray-800 px-3 py-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">
                        Amount in Words:
                      </span>
                      <span className="text-sm font-normal ml-2">
                        {numberToWords(getAmountPayable(invoice))}
                      </span>
                    </div>
                  </td>
                  <td className="border border-gray-800 px-3 py-2 text-right text-base">
                    GRAND TOTAL:
                  </td>
                  <td className="border border-gray-800 px-3 py-2 text-right text-base">
                    ₦
                    {Number(getAmountPayable(invoice)).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="border border-gray-400 bg-gray-50 px-4 py-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Payable:</span>
                <span className="text-xl font-bold ">
                  {formatCurrency(getAmountPayable(invoice))}
                </span>
              </div>
              {getTotalDiscount(invoice) > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  * Discount of {formatCurrency(getTotalDiscount(invoice))} has
                  been applied
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8 pt-4">
              <div className="text-xs w-1/2">
                <div className="font-bold mb-2">Terms & Conditions:</div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Goods once sold will not be taken back</li>
                </ul>
              </div>
              <div className="text-right text-xs w-1/2">
                <div className="mb-12">
                  <div className="font-semibold">
                    for {invoice.store?.name || "Store"}
                  </div>
                </div>
                <div className="border-t border-gray-500 pt-1 inline-block min-w-[140px]">
                  Authorised Signatory
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
