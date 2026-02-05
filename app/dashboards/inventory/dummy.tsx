"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPurchaseRequestById } from "@/lib/utils/api/apiHelper";
import {
  PurchaseRequest,
  PurchaseRequestItem,
  PurchaseRequestDetailResponse,
} from "@/types/purchaseRequest";
import { ThreeDots } from "react-loader-spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SInglePurchasedItem = () => {
  const { id } = useParams<{ id: string }>();

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

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMM yyyy • HH:mm");
    } catch {
      return "—";
    }
  };

  const formatCurrency = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="py-20 px-4 flex flex-col items-center justify-center">
          <ThreeDots height="80" width="80" color="#0A6DC0" visible={true} />
          <p className="mt-5 text-[#9E9A9A] font-dm-sans text-lg">
            Loading purchase request details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-dm-sans">
          Error
        </h2>
        <p className="text-gray-700 mb-8 text-center max-w-md font-dm-sans">
          {error || "Purchase request not found"}
        </p>
        <Link
          href="/dashboards/inventory/purchase-request"
          className="px-8 py-3.5 bg-[#0A6DC0] text-white rounded-lg hover:bg-[#09599a] transition font-medium font-dm-sans"
        >
          Back to Purchase Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-[26px] sm:text-[32px] font-bold text-[#2F2F2F] font-clash">
              Purchase Request {request.code}
            </h1>
            <p className="mt-1.5 text-[#9E9A9A] font-dm-sans text-[15px]">
              Created: {formatDate(request.created_at)}
            </p>
          </div>

          <Link
            href="/dashboards/inventory/purchase-request"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#D0D5DD] rounded-lg text-[#344054] hover:bg-gray-50 transition font-medium font-dm-sans shadow-sm"
          >
            <ArrowLeft size={18} />
            Back to list
          </Link>
        </div>

        <div className="mt-10">
          {request.items?.length === 0 ? (
            <div className="bg-[#FAFAFA] rounded-lg border border-gray-200 p-8 text-center text-[#667085] font-dm-sans">
              No items in this purchase request
            </div>
          ) : (
            <Card className="md:p-6">
              {request.items.map((item: PurchaseRequestItem) => (
                <div key={item.id} className="">
                  {/* Small image for each item */}
                  <div className="bg-[#FAFAFA] rounded-lg border border-gray-200 overflow-hidden">
                    <div className="h-56 md:h-64 w-full flex items-center justify-center p-4">
                      {item.product?.image ? (
                        <Image
                          src={
                            item.product.image.startsWith("//")
                              ? `https:${item.product.image}`
                              : item.product.image
                          }
                          alt={item.product.name || "Product"}
                          width={140}
                          height={140}
                          className="object-contain max-h-full rounded"
                        />
                      ) : (
                        <div className="text-gray-400 text-5xl">📦</div>
                      )}
                    </div>
                  </div>

                  {/* Item details */}
                  <div className="p-5 flex-1 flex flex-col gap-3 text-[13px] sm:text-[14px]">
                    <div>
                      <h3 className="font-bold font-dm-sans text-[#2F2F2F]">
                        Item Name
                      </h3>
                      <p className="mt-0.5">{item.product?.name || "—"}</p>
                    </div>

                    {/* <div>
                      <h3 className="font-bold font-dm-sans text-[#2F2F2F]">
                        SKU
                      </h3>
                      <p className="mt-0.5">{item.stock?.sku || "—"}</p>
                    </div> */}

                    <div>
                      <h3 className="font-bold font-dm-sans text-[#2F2F2F]">
                        Quantity
                      </h3>
                      <p className="mt-0.5">{item.quantity}</p>
                    </div>

                    <div>
                      <h3 className="font-bold font-dm-sans text-[#2F2F2F]">
                        Cost
                      </h3>
                      <p className="mt-0.5 font-medium">
                        {formatCurrency(item.cost)}
                      </p>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-[#667085]">
                        <span>Delivery:</span>
                        <span className={item.delivery ? "text-green-700" : ""}>
                          {item.delivery ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SInglePurchasedItem;
