/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { getPurchaseRequestById } from "@/lib/utils/api/apiHelper";
import {
  PurchaseRequest,
  PurchaseRequestItem,
  PurchaseRequestDetailResponse,
} from "@/types/purchaseRequest";
import { useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";

const PurchaseRequestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No request ID provided");
      setLoading(false);
      return;
    }

    const fetchRequest = async () => {
      setLoading(true);
      setError(null);

      try {
        const res: PurchaseRequestDetailResponse =
          await getPurchaseRequestById(id);

        if (res.statusCode === 200 && res.data) {
          setRequest(res.data);
        } else {
          setError(res.error || "Failed to load request details");
        }
      } catch (err: any) {
        console.error("Error fetching purchase request:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);



  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="py-20 px-4 flex flex-col items-center justify-center">
          <ThreeDots height="100" width="100" color="#0A6DC0" visible={true} />
          <p className="mt-4 text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
            Loading items...
          </p>
        </div>{" "}
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error || "Request not found"}</p>
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
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors "
      >
        <MoveLeft className="w-5 h-5" />
      </button>
      <div className="mb-4 md:mb-6">
        <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
          {request.code}
        </h1>
        <p className="font-medium font-dm-sans text-[#9E9A9A]">
          See see items on this invoice{" "}
        </p>
      </div>

      {/* Items Table */}
      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px]  ">
        <div className="">
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
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Product</th>
                    <th className="px-6 py-3 text-left font-medium">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left font-medium">Cost</th>
                    <th className="px-6 py-3 text-left font-medium">
                      Delivery
                    </th>
                    {/* <th className="px-6 py-3 text-left font-medium">Empties</th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {request.items.map((item: PurchaseRequestItem) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/inventory/purchase-request/${id}/item/${item.id}`,
                        )
                      }
                    >
                      {/* Product */}
                      <td className="px-6 ">
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

                      {/* Quantity */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.quantity}
                      </td>

                      {/* Cost */}
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(item.cost)}
                      </td>

                      {/* Delivery */}
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

                      {/* Empties */}
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        {item.empties != null ? item.empties : "—"}
                      </td> */}
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
