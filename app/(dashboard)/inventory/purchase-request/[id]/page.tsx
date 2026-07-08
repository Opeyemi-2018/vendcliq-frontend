"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { usePurchaseRequestById } from "@/hooks/usePurchaseRequests";

const PurchaseRequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: request, isLoading, error } = usePurchaseRequestById(id);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase();

    if (s === "paid") {
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Paid
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

  if (isLoading) {
    return (
      <div>
        {/* Back button skeleton */}
        <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse mb-4" />

        {/* Title skeleton */}
        <div className="mb-4 md:mb-6 space-y-2">
          <div className="h-7 bg-gray-100 rounded-lg w-40 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
        </div>

        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px]">
          <div className="h-6 bg-gray-100 rounded w-36 animate-pulse mb-4" />

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {/* Table header skeleton */}
            <div className="bg-gray-50 px-6 py-3 flex gap-8">
              {[
                "Product",
                "Quantity",
                "Unit Cost",
                "Subtotal",
                "Status",
                "Delivery",
                "Handover",
              ].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-100 rounded w-16 animate-pulse"
                />
              ))}
            </div>

            {/* Table rows skeleton */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="px-6 py-4 flex gap-8 items-center border-t border-gray-100"
              >
                {/* Product cell */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <div className="w-10 h-10 rounded-md bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                </div>
                {/* Other cells */}
                {Array.from({ length: 6 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-4 bg-gray-100 rounded w-16 animate-pulse"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">
          {error?.message || "Request not found"}
        </p>
        <Link
          href="/inventory/purchase-request"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Purchase Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="">
      <button
        onClick={() => router.push("/inventory/purchase-request")}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors"
      >
        <MoveLeft className="w-5 h-5" />
      </button>
      <div className="mb-4 md:mb-6">
        <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
          {request.code}
        </h1>
        <p className="font-medium font-dm-sans text-[#9E9A9A]">
          See items on this invoice
        </p>
      </div>

      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px]">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Requested Items
          </h2>
        </div>

        {request.items?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No items in this request
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto text-[#2F2F2F]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="whitespace-nowrap">
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
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">
                      Delivery
                    </th>
                    <th className="px-6 py-3 text-left font-medium">
                      Handover
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {request.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/inventory/purchase-request/${id}/item/${item.id}`,
                        )
                      }
                    >
                      <td className="px-6">
                        <div className="flex gap-2 items-center">
                          <div className="flex-shrink-0">
                            {item.product?.image ? (
                              <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200">
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name || "Product"}
                                  width={56}
                                  height={56}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                                No image
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium whitespace-nowrap">
                              {item.product?.name || "Unnamed Product"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(item.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(item.sub_total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.delivery ? (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.attributes?.handover_completed ? (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
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
};

export default PurchaseRequestDetailPage;
