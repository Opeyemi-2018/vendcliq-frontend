/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MoveLeft, MoveRight } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { getSaleById } from "@/lib/utils/api/apiHelper";
import { SaleInvoice, SaleInvoiceItem } from "@/types/sales";
import { Button } from "@/components/ui/button";

export default function SaleInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [invoice, setInvoice] = useState<SaleInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="py-20 px-4 flex flex-col items-center">
          <ThreeDots height="80" width="80" color="#0A6DC0" visible />
          <p className="mt-5 text-[#9E9A9A] font-dm-sans text-lg">
            Loading invoice details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-dm-sans">
          Error
        </h2>
        <p className="text-gray-700 mb-4 max-w-md">
          {error || "Missing invoice ID in the URL"}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Current ID: {id || "missing"}
        </p>
        <Button
          onClick={() => router.back()}
          className="px-8 py-3.5 bg-[#0A6DC0] text-white rounded-lg hover:bg-[#085a9e]"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors mb-4"
      >
        <MoveLeft className="w-5 h-5" />
      </button>

      <div className="mb-4 md:mb-6">
        <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
          {invoice.code}
        </h1>
        <p className="font-medium font-dm-sans text-[#9E9A9A]">
          View all items sold in this invoice
        </p>
      </div>

      {/* Items Table */}
      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sold Items ({invoice.items_count})
        </h2>

        {invoice.items?.length === 0 ? (
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
                    <th className="px-6 py-3 text-left font-medium">Quantity</th>
                    <th className="px-6 py-3 text-left font-medium">Unit Cost</th>
                    <th className="px-6 py-3 text-left font-medium">Subtotal</th>
                    <th className="px-6 py-3 text-left font-medium">Profit</th>
                    <th className="px-6 py-3 text-left font-medium">More</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item: SaleInvoiceItem) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/dashboards/inventory/sales/${id}/item/${item.id}`
                        )
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
                                className="object-cover w-full h-full"
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(item.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(item.sub_total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-green-700">
                        {formatCurrency(item.profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
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
    </div>
  );
}