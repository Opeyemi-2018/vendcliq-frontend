/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTrackingStatus } from "@/hooks/useTracking";
import { format } from "date-fns";

const TRACKING_STEPS = [
  {
    key: "ORDER_PLACED",
    label: "Order Placed",
    desc: "Your order is confirmed.",
  },
  {
    key: "ARRIVED_AT_PICKUP",
    label: "Arrived at Pickup",
    desc: "Driver has arrived at the pickup location.",
  },
  {
    key: "ACCEPTED",
    label: "Accepted",
    desc: "Your order has been accepted by the driver.",
  },
  {
    key: "PICKED_UP",
    label: "Picked Up",
    desc: "Your item has been picked up by the driver.",
  },
  {
    key: "ARRIVED",
    label: "Arrived",
    desc: "The driver has arrived at your location.",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    desc: "Your item has been delivered.",
  },
];

// Returns all steps up to and including the current status
function getCompletedSteps(currentStatus: string): string[] {
  const index = TRACKING_STEPS.findIndex((s) => s.key === currentStatus);
  if (index === -1) return [];
  return TRACKING_STEPS.slice(0, index + 1).map((s) => s.key);
}

function TrackingTimeline({
  itemId,
  delivery,
}: {
  itemId: string;
  delivery: boolean;
}) {
  const { data, isLoading, isError, error } = useTrackingStatus(itemId);

  if (!delivery) return null;

  if (isLoading) {
    return (
      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white font-dm-sans mb-3">
        <h2 className="font-bold text-[16px] md:text-[18px] mb-5">
          Tracking details
        </h2>
        <div className="flex flex-col gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-7 h-7 rounded-sm bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data || !data.status) {
    return (
      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white font-dm-sans mb-3">
        <h2 className="font-bold text-[16px] md:text-[18px] mb-3">
          Tracking details
        </h2>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-700 font-medium">
            {/* ← Show real server message if available */}
            {isError
              ? (error as any)?.message || "Failed to load tracking"
              : data?.message ||
                "No tracking information available for this item yet."}
          </p>
        </div>
      </div>
    );
  }

  const completedSteps = getCompletedSteps(data.status);

  return (
    <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white font-dm-sans mb-3">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-[16px] md:text-[18px]">
          Tracking details
        </h2>
        {data.lastUpdated && (
          <span className="text-xs text-gray-400">
            Updated {format(new Date(data.lastUpdated), "dd MMM yyyy, hh:mm a")}
          </span>
        )}
      </div>

      {/* Current status badge */}
      <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 bg-[#31A078]/10 border border-[#31A078]/20 rounded-full">
        <span className="w-2 h-2 rounded-full bg-[#31A078] animate-pulse" />
        <span className="text-sm font-semibold text-[#31A078]">
          {data.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="flex flex-col">
        {TRACKING_STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = data.status === step.key;
          const isLast = idx === TRACKING_STEPS.length - 1;

          return (
            <div key={step.key} className="flex gap-4">
              {/* Icon + line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 z-10 transition-colors",
                    isCompleted ? "bg-[#31A078]" : "bg-gray-200",
                    isCurrent && "ring-2 ring-[#31A078] ring-offset-1",
                  )}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 my-1 transition-colors",
                      isCompleted ? "bg-[#31A078]" : "bg-gray-200",
                    )}
                    style={{ minHeight: 32 }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-6 flex-1", isLast && "pb-0")}>
                <p
                  className={cn(
                    "font-semibold text-sm",
                    isCompleted ? "text-[#31A078]" : "text-gray-400",
                    isCurrent && "text-[#31A078] font-bold",
                  )}
                >
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 text-[10px] font-bold bg-[#31A078] text-white px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ItemDetailPage = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawItemId = decodeURIComponent(params.itemId as string);
  const uuidMatch = rawItemId.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  const itemId = uuidMatch ? uuidMatch[0] : rawItemId;
  const delivery = searchParams.get("delivery") === "true";
  const productName = decodeURIComponent(searchParams.get("productName") || "");
  const quantity = parseInt(searchParams.get("quantity") || "0");
  const cost = parseFloat(searchParams.get("cost") || "0");
  const price = parseFloat(searchParams.get("price") || "0");
  const productImage = decodeURIComponent(
    searchParams.get("productImage") || "",
  );
  const sku = decodeURIComponent(searchParams.get("sku") || "");
  const address = decodeURIComponent(searchParams.get("address") || "");
  const customerOtp = searchParams.get("customerOtp") || "";

  if (!itemId) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Item ID is required</p>
          <Button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="font-dm-sans text-[#2F2F2F]">
      <div className="flex mb-4 justify-between">
        <ArrowLeft size={20} onClick={() => router.back()} />
        <div>
          <h1 className="text-right font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold">
            {sku}
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            Here is the details of this delivery
          </p>
        </div>
      </div>

      {delivery && customerOtp && (
        <div className="mb-5">
          <p className="md:font-bold mb-2 text-[13px] md:text-[16px]">
            Share this OTP delivery confirmation code with the driver or
            supplier
          </p>
          <div className="flex gap-2">
            {customerOtp.split("").map((digit, index) => (
              <span
                key={index}
                className="border border-[#9E9A9A] bg-[#D8D8D866] w-[50px] h-[50px] flex items-center justify-center rounded-lg font-bold text-lg"
              >
                {digit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white font-dm-sans mb-3">
        <div className="bg-[#FAFAFA] rounded-lg lg:border border-[#E4E4E4]">
          {productImage &&
            productImage !== "undefined" &&
            productImage !== "null" && (
              <div className="relative h-56 w-full">
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  className="object-contain"
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-y-3 lg:grid-cols-3">
          <div>
            <h1 className="font-bold">Item Name</h1>
            <p>{sku}</p>
          </div>
          <div>
            <h1 className="font-bold">Quantity</h1>
            <p>{quantity}</p>
          </div>
          <div>
            <h1 className="font-bold">Unit Price</h1>
            <p>{price}</p>
          </div>
          <div>
            <h1 className="font-bold">Amount</h1>
            <p>{cost}</p>
          </div>
          {address && (
            <div>
              <h1 className="font-bold">Delivery Address</h1>
              <p>{address}</p>
            </div>
          )}
        </div>
      </div>

      {/* ← Real tracking timeline */}
      <TrackingTimeline itemId={itemId} delivery={delivery} />

      <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
        <Button
          onClick={() => setReportOpen(!reportOpen)}
          className="w-full px-6 bg-[#0A6DC0] hover:bg-[#085a9e] py-5 md:py-6 text-white font-medium rounded-lg"
        >
          Report this delivery
        </Button>
        <p className="mt-3 text-center text-sm text-gray-500">
          Contact our support for any complaints about this delivery
        </p>
      </div>
    </div>
  );
};

export default ItemDetailPage;
