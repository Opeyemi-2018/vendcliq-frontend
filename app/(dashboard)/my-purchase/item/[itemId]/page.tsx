/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTrackingStatus } from "@/hooks/useTracking";
import { format } from "date-fns";
import BackButton from "@/components/inventory/BackButton";
import { formatNaira } from "@/lib/salesFilters";
import { formatQty } from "@/lib/priceInput";

const EYEBROW =
  "text-[11.5px] font-bold tracking-[.5px] uppercase text-[#8E8E93]";

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
      <div className="bg-white border border-[#D8D8D8B3] rounded-[18px] p-4 sm:p-5 mb-[18px] font-dm-sans">
        <h2 className="font-clash font-semibold text-[17px] tracking-[-.3px] m-0 mb-4">
          Where it is
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
      <div className="bg-white border border-[#D8D8D8B3] rounded-[18px] p-4 sm:p-5 mb-[18px] font-dm-sans">
        <h2 className="font-clash font-semibold text-[17px] tracking-[-.3px] m-0 mb-3">
          Where it is
        </h2>
        <div className="flex items-start gap-2.5 bg-[#FFF3DB] border border-[#F2D9A0] rounded-[12px] px-4 py-3">
          <p className="text-[13px] text-[#85540A] font-medium leading-[1.45] m-0">
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
    <div className="bg-white border border-[#D8D8D8B3] rounded-[18px] p-4 sm:p-5 mb-[18px] font-dm-sans">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <h2 className="font-clash font-semibold text-[17px] tracking-[-.3px] m-0">
          Where it is
        </h2>
        {data.lastUpdated && (
          <span className="text-[12px] text-[#8E8E93]">
            Updated {format(new Date(data.lastUpdated), "dd MMM yyyy, hh:mm a")}
          </span>
        )}
      </div>

      {/* Current status badge */}
      <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 bg-[#E7F4EB] rounded-full">
        <span className="w-2 h-2 rounded-full bg-[#00681B] animate-pulse" />
        <span className="text-[13px] font-bold text-[#003909] capitalize">
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
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors",
                    isCompleted ? "bg-[#00681B]" : "bg-[#E4E7EB]",
                    isCurrent && "ring-2 ring-[#00681B] ring-offset-2",
                  )}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 my-1 transition-colors",
                      isCompleted ? "bg-[#00681B]" : "bg-[#E4E7EB]",
                    )}
                    style={{ minHeight: 32 }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-6 flex-1", isLast && "pb-0")}>
                <p
                  className={cn(
                    "font-semibold text-[14px]",
                    isCompleted ? "text-[#2F2F2F]" : "text-[#B9BCC2]",
                    isCurrent && "text-[#003909] font-bold",
                  )}
                >
                  {step.label}
                  {isCurrent && (
                    <span className="ml-2 text-[10px] font-bold bg-[#E7F4EB] text-[#003909] px-2 py-0.5 rounded-full uppercase tracking-[.4px]">
                      Now
                    </span>
                  )}
                </p>
                <p className="text-[12.5px] text-[#8E8E93] mt-0.5 leading-[1.45]">
                  {step.desc}
                </p>
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
    <div className="font-dm-sans text-[#2F2F2F] max-w-[900px]">
      <div className="flex items-start gap-[14px] flex-wrap mb-[18px]">
        <BackButton className="mt-1" />
        <div className="flex-1 min-w-[200px]">
          <h1 className="font-clash font-semibold text-[22px] md:text-[28px] tracking-[-.6px] m-0">
            {sku || productName || "Item"}
          </h1>
          <p className="text-[14.5px] text-[#8E8E93] mt-[5px] m-0">
            What you bought, and where it has got to.
          </p>
        </div>
      </div>

      {delivery && customerOtp && (
        <div className="mb-[18px] bg-[#FFF3DB] border border-[#F2D9A0] rounded-[16px] p-4 sm:p-5">
          <p className="text-[13.5px] font-semibold text-[#85540A] m-0">
            Give this code to the driver or supplier on delivery.
          </p>
          <div className="flex gap-2 mt-3">
            {customerOtp.split("").map((digit, index) => (
              <span
                key={index}
                className="w-11 h-12 sm:w-[50px] sm:h-[52px] bg-white border border-[#F2D9A0] rounded-[10px] flex items-center justify-center font-clash font-bold text-[20px] text-[#85540A]"
              >
                {digit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#D8D8D8B3] rounded-[18px] p-4 sm:p-5 mb-[18px]">
        <div className="bg-[#F9FAFB] rounded-[12px] border border-[#D8D8D873]">
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

        <div className="mt-4 grid gap-x-6 gap-y-4 grid-cols-2 sm:grid-cols-4">
          <div>
            <div className={EYEBROW}>Quantity</div>
            <div className="font-clash font-bold text-[19px] tracking-[-.3px] mt-1">
              {formatQty(quantity)}
            </div>
          </div>
          <div>
            <div className={EYEBROW}>Unit price</div>
            <div className="font-clash font-bold text-[19px] tracking-[-.3px] mt-1">
              {formatNaira(price)}
            </div>
          </div>
          <div>
            <div className={EYEBROW}>Amount</div>
            <div className="font-clash font-bold text-[19px] tracking-[-.3px] mt-1">
              {formatNaira(cost)}
            </div>
          </div>
          <div className="min-w-0">
            <div className={EYEBROW}>Item</div>
            <div className="text-[13.5px] mt-1.5 truncate">
              {sku || productName || "—"}
            </div>
          </div>
          {address && (
            <div className="col-span-2 sm:col-span-4">
              <div className={EYEBROW}>Delivery address</div>
              <div className="text-[13.5px] mt-1.5">{address}</div>
            </div>
          )}
        </div>
      </div>

      {/* ← Real tracking timeline */}
      <TrackingTimeline itemId={itemId} delivery={delivery} />

      <div className="bg-white border border-[#D8D8D8B3] rounded-[18px] p-4 sm:p-5 mt-[18px]">
        <button
          type="button"
          onClick={() => setReportOpen(!reportOpen)}
          className="w-full h-12 rounded-[12px] border-none bg-[#0A6DC0] text-white font-bold text-[15px] cursor-pointer hover:bg-[#09599A]"
        >
          Report this delivery
        </button>
        <p className="mt-3 text-center text-[13px] text-[#8E8E93]">
          Contact support if anything about this delivery is wrong.
        </p>
      </div>
    </div>
  );
};

export default ItemDetailPage;
