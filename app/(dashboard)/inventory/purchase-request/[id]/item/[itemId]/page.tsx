"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MoveLeft } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { Button } from "@/components/ui/button";
import { usePurchaseRequestItem } from "@/hooks/usePurchaseRequests";

export default function SinglePurchasedItemPage() {
  const { id, itemId } = useParams<{
    id: string;
    itemId: string;
  }>();
  const router = useRouter();

  const {
    data: item,
    request,
    isLoading,
    error,
  } = usePurchaseRequestItem(id, itemId);

  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "₦0";

    return `₦${num.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="py-20 px-4 flex flex-col items-center">
          <ThreeDots height="80" width="80" color="#0A6DC0" visible />
          <p className="mt-5 text-[#9E9A9A] font-dm-sans text-lg">
            Loading item details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !item || !request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-dm-sans">
          Error
        </h2>
        <p className="text-gray-700 mb-4">
          {error?.message || "Item not found"}
        </p>
        <Button
          onClick={() => router.back()}
          className="px-8 py-3.5 bg-[#0A6DC0] text-white rounded-lg hover:bg-[#09599a]"
        >
          Go Back to Request List
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors"
      >
        <MoveLeft className="w-5 h-5" />
      </button>

      <div className="mb-3">
        <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
          {item.product?.name || "Item Details"}
        </h1>
        <p className="text-[#9E9A9A] font-dm-sans text-[15px] mt-1">
          Here are the details of this particular Item
        </p>
      </div>

      <div className="bg-white rounded-xl md:border border-[#E4E7EC] shadow-sm overflow-hidden md:p-6">
        <div className="bg-[#FAFAFA] rounded-lg border border-gray-200 overflow-hidden mt-4 md:mt-0">
          <div className="h-20 md:h-80 w-full flex items-center justify-center p-6">
            {item.product?.image ? (
              <Image
                src={
                  item.product.image.startsWith("//")
                    ? `https:${item.product.image}`
                    : item.product.image
                }
                alt={item.product.name || "Product"}
                width={320}
                height={320}
                className="object-contain max-h-full rounded-lg drop-shadow-md"
                priority
              />
            ) : (
              <div className="text-gray-400 text-8xl opacity-50">📦</div>
            )}
          </div>
        </div>

        <div className="mt-8 md:mt-10 text-[#2F2F2F] text-[13px] sm:text-[15px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6">
          <div>
            <h2 className="font-bold font-dm-sans">Product Name</h2>
            <p className="mt-1.5">{item.product?.name || "—"}</p>
          </div>

          <div>
            <h2 className="font-bold font-dm-sans">Quantity</h2>
            <p className="mt-1.5 font-medium">{item.quantity}</p>
          </div>

          <div>
            <h2 className="font-bold font-dm-sans">Unit Cost</h2>
            <p className="mt-1.5 font-medium">{formatCurrency(item.cost)}</p>
          </div>

          <div>
            <h2 className="font-bold font-dm-sans">Total Cost</h2>
            <p className="mt-1.5 font-medium">
              {formatCurrency(item.sub_total)}
            </p>
          </div>

          <div>
            <h2 className="font-bold font-dm-sans">Delivery Required</h2>
            <p className="mt-1.5">
              {item.delivery ? (
                <span className="text-green-700 font-medium">Yes</span>
              ) : (
                "No"
              )}
            </p>
          </div>
        </div>

        {!item.attributes?.handover_completed && (
          <Button
            className="mt-5 bg-[#0A6DC0] hover:bg-[#085a9e] w-full py-5 md:py-6 font-medium text-base rounded-xl"
            onClick={() =>
              router.push(
                `/inventory/purchase-request/${id}/item/${itemId}/handover`,
              )
            }
          >
            Hand-over Product
          </Button>
        )}
      </div>
    </div>
  );
}
