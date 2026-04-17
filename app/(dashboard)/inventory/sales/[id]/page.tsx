/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Edit, MoveLeft, MoveRight, Printer } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { getSaleById } from "@/lib/utils/api/apiHelper";
import { SaleInvoice, SaleInvoiceItem } from "@/types/sales";

export default function SaleInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [invoice, setInvoice] = useState<SaleInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount?: number | null) => {
    const safeAmount = typeof amount === "number" ? amount : 0;
    return safeAmount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });
  };

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

  // const getSubtotal = (quantity?: number, cost?: number) => {
  //   const q = typeof quantity === "number" ? quantity : 0;
  //   const c = typeof cost === "number" ? cost : 0;
  //   return q * c;
  // };

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="">
      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors mb-4 print:hidden"
      >
        <MoveLeft className="w-5 h-5" />
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="mb-4 md:mb-6">
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
            {invoice?.code || "Loading..."}
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A]">
            View all items sold in this invoice
          </p>
        </div>

        <div className="flex items-center gap-10">
          {invoice?.status?.toLowerCase() === "pending" && (
            <div className="flex items-center gap-2 text-[#0A2540] hover:text-[#0A6DC0] print:hidden">
              <Edit
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/inventory/sales/edit/${invoice.id}`)
                }
              />
              Edit
            </div>
          )}

          <div
            className="flex items-center gap-2 text-[#0A2540] hover:text-[#0A6DC0] cursor-pointer print:hidden"
            onClick={handlePrint}
          >
            <Printer />
            <button>Print</button>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
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
              <table className="min-w-full divide-y divide-gray-200">
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

      {/* ================= PRINT SECTION ================= */}
      <div id="print-section" className="hidden print:block">
        <div className="w-[80mm] mx-auto p-4 text-sm">
          <h3 className="text-center font-bold">{invoice?.code}</h3>
          <p className="text-center text-xs mb-2">
            {invoice?.created_at
              ? new Date(invoice.created_at).toLocaleString()
              : ""}
          </p>
          <hr className="my-2 border-dashed" />

          {invoice?.items?.map((item) => (
            <div key={item.id} className="mb-2">
              <div className="flex justify-between">
                <span>{item.product?.name}</span>
                <span>{item.quantity}x</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>{formatCurrency(item.stock.price)}</span>
                <span>{formatCurrency(item.sub_total)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Profit</span>
                <span>{formatCurrency(item.profit)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Status</span>
                <span>{invoice.status}</span>
              </div>
            </div>
          ))}

          <hr className="my-2 border-dashed" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(Number(invoice?.total_amount))}</span>
          </div>
          <p className="text-center text-xs mt-4">
            Thank you for your purchase
          </p>
        </div>
      </div>
    </div>
  );
}
