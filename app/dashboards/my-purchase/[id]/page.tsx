/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboards/my-purchases/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { handleGetPurchasedInvoiceById } from "@/lib/utils/api/apiHelper";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MoveRight } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { InvoiceItem, PurchasedInvoiceDetails } from "@/types/purchase";
import Image from "next/image";

const PurchasedInvoiceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<PurchasedInvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const id = params.id as string;
      const response = await handleGetPurchasedInvoiceById(id);

      if (response.statusCode === 200) {
        setInvoice(response.data);
      } else {
        setError(response.error || "Failed to load invoice details");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Network error");
      console.error("Fetch invoice details error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchInvoiceDetails();
    }
  }, [params.id]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  const navigateToItemDetail = (item: InvoiceItem) => {
    const params = new URLSearchParams();
    params.set("delivery", item.delivery.toString());
    params.set("productName", encodeURIComponent(item.product.name));
    params.set("quantity", item.quantity.toString());
    params.set("cost", item.cost.toString());
    params.set("price", item.stock.price.toString());
    params.set("subTotal", item.sub_total.toString());
    params.set("profit", item.profit.toString());
    if (item.product.image) {
      params.set("productImage", encodeURIComponent(item.product.image));
    }
    if (item.stock.sku) {
      params.set("sku", encodeURIComponent(item.stock.sku));
    }
    if (item.mode) {
      params.set("mode", item.mode);
    }
    if (item.attributes.address) {
      params.set("address", encodeURIComponent(item.attributes.address));
    }
    if (item.attributes.storeId) {
      params.set("storeId", item.attributes.storeId);
    }
    // Add OTP codes if they exist
    if (item.otp_codes?.driver_otp) {
      params.set("driverOtp", item.otp_codes.driver_otp);
    }
    if (item.otp_codes?.customer_otp) {
      params.set("customerOtp", item.otp_codes.customer_otp);
    }

    router.push(`/dashboards/my-purchase/item/${item.id}?${params.toString()}`);
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button
            onClick={fetchInvoiceDetails}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="text-[#2F2F2F]">
      <div className="flex mb-4 justify-between">
        <ArrowLeft size={20} onClick={() => router.back()} />
        <div>
          <h1 className="text-right font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold ">
            {loading ? "Loading..." : invoice?.code.slice(0, 10)}
          </h1>
          <p className=" font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            See see items on this invoice
          </p>
        </div>
      </div>

      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white font-dm-sans ">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[150px]">
            <ClipLoader size={40} color="#0A6DC0" />
            <p className="mt-4 text-gray-600">Loading invoice details...</p>
          </div>
        ) : invoice ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 md:gap-y-5">
            <div>
              <p className="font-bold">No of Products</p>
              <p className="">{invoice.items_count} items</p>
            </div>

            <div>
              <p className="font-bold">Total Amount</p>
              <p className="">{formatCurrency(invoice.total)}</p>
            </div>

            <div>
              <p className="font-bold">Created Date</p>
              <p className="">{formatDate(invoice.created_at)}</p>
            </div>

            <div>
              <p className="font-bold">Status</p>
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  invoice.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : invoice.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Invoice not found</p>
          </div>
        )}
      </div>

      <div className="md:p-5 lg:border border-[#E4E4E4] rounded-[20px] bg-white mt-8">
        <h1 className="font-clash text-[14px] md:text-[16px]  font-bold mb-3 ">
          {loading ? "Loading..." : invoice?.code.slice(0, 10)}
        </h1>
        <div className="overflow-x-auto border border-[#E4E4E4] rounded-[20px] ">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 pl-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[30%]">
                  Product
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[15%]">
                  Unit Price
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[10%]">
                  Qty
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[15%]">
                  Amount
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[15%]">
                  Status
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[15%]">
                  More
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <div className="flex flex-col items-center justify-center">
                      <ClipLoader size={40} color="#0A6DC0" />
                      <p className="mt-4 text-gray-600">Loading items...</p>
                    </div>
                  </td>
                </tr>
              ) : invoice && invoice.items.length > 0 ? (
                invoice.items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50  cursor-pointer transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                    onClick={() => navigateToItemDetail(item)}
                  >
                    <td className="py-4  pl-4 font-medium">
                      <div className="flex items-center gap-1">
                        <div className="w-10 h-10 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="truncate">
                          {item.product.name.slice(0, 15)}...
                        </p>
                      </div>
                    </td>

                    <td className="py-4 truncate">
                      {formatCurrency(item.stock.price)}
                    </td>
                    <td className="py-4 truncate">{item.quantity}</td>
                    <td className="py-4 truncate">
                      {formatCurrency(item.cost)}
                    </td>
                    <td className="py-4">
                      {" "}
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <MoveRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchasedInvoiceDetailPage;
