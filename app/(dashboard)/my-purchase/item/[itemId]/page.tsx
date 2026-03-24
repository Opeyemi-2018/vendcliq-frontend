/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { handleGetItemTrackingStatus } from "@/lib/utils/api/apiHelper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, SquareCheck, Star } from "lucide-react";
import Image from "next/image";

interface TrackingStep {
  title: string;
  description: string;
  time: string;
  status: "completed" | "pending";
}

const trackingSteps: TrackingStep[] = [
  {
    title: "Order Placed",
    description: "Your order is confirmed.",
    time: "12:18pm",
    status: "completed", // Default status
  },
  {
    title: "Driver Assigned",
    description: "A driver is on the way.",
    time: "",
    status: "pending",
  },
  {
    title: "Picked Up",
    description: "Your item has been picked up by the driver.",
    time: "",
    status: "pending",
  },
  {
    title: "On the Way",
    description: "Your item is in transit.",
    time: "",
    status: "pending",
  },
  {
    title: "Arrived",
    description: "The driver has arrived at your location.",
    time: "",
    status: "pending",
  },
  {
    title: "Delivered",
    description: "Your item has been delivered.",
    time: "",
    status: "pending",
  },
];

const ItemDetailPage = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingMessage, setTrackingMessage] = useState<string>("");
  const [loadingTracking, setLoadingTracking] = useState(false);

  const itemId = params.itemId as string;

  // Parse query parameters
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

  const fetchTrackingData = async () => {
    try {
      if (!delivery || !itemId) return;

      setLoadingTracking(true);
      const response = await handleGetItemTrackingStatus(itemId);

      if (response.message) {
        setTrackingMessage(response.message);
        setTrackingData(null);
      } else if (response.statusCode === 200 && response.data) {
        setTrackingData(response.data);
        setTrackingMessage("");
      } else {
        setTrackingData(null);
        setTrackingMessage("No tracking information available");
      }
    } catch (err: any) {
      console.warn("Tracking fetch error:", err?.message || err);
      setTrackingData(null);
      setTrackingMessage("Failed to fetch tracking information");
    } finally {
      setLoadingTracking(false);
    }
  };

  useEffect(() => {
    if (delivery && itemId) {
      fetchTrackingData();
    }
  }, [delivery, itemId]);

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
          <h1 className="text-right font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold ">
            {sku}
          </h1>
          <p className=" font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            Here is the details of this delivery
          </p>
        </div>
      </div>
      {/* {delivery && ( */}
        <div className="mb-5">
          <p className=" md:font-bold mb-2 text-[13px] md:text-[16px]">
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
      {/* )} */}

      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white font-dm-sans mb-3">
        <div className="bg-[#FAFAFA] rounded-lg lg:border border-[#E4E4E4]">
          {productImage && (
            <div className="relative h-56 w-full">
              <Image
                src={productImage}
                alt={productName}
                fill
                className="object-contain"
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
          <div>
            <h1 className="font-bold">You rated the driver</h1>
            <div className="flex items-center gap-2">
              <Star />
              <Star />
              <Star />
              <Star />
              <Star />
            </div>
          </div>
        </div>
      </div>

      {delivery && (
        <div className="px-6 py-8">
          {/* Comment out tracking fetch for now - will use when server provides tracking data */}
          {/* {loadingTracking ? (
            <div className="flex justify-center py-8">
              <ClipLoader size={30} color="#0A6DC0" />
            </div>
          ) : trackingMessage ? (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">{trackingMessage}</p>
            </div>
          ) : trackingData ? (
            <div className="space-y-4">
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                Tracking information not available
              </p>
              <p className="text-sm text-gray-400 mt-1">
                No tracking data found for this item
              </p>
            </div>
          )} */}

          <div className="relative">
            {/* Vertical line - starts after first circle, ends before last circle */}
            <div 
              className="absolute left-5 bg-gray-200" 
              style={{
                width: '2px',
                top: '40px', // Start after first check
                bottom: '40px', // End before last check
              }}
            />

            <div className="space-y-6">
              {trackingSteps.map((step, index) => (
                <div key={step.title} className="relative flex gap-4">
                  {/* Circle + Check / Pending */}
                  <div className="relative z-10 flex-shrink-0">
                    {step.status === "completed" ? (
                      <SquareCheck className="w-10 h-10 text-[#31A078]" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className={`${
                            step.status === "completed"
                              ? "text-[#31A078] font-bold"
                              : "text-gray-500 font-medium"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className={`mt-1 text-sm ${
                          step.status === "completed"
                            ? "text-gray-700 font-semibold"
                            : "text-gray-500"
                        }`}>
                          {step.description}
                        </p>
                      </div>
                      {step.time && (
                        <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                          {step.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Button Section */}
      <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
        <Button
          onClick={() => setReportOpen(!reportOpen)}
          className="w-full px-6 bg-[#0A6DC0] hover:bg-[#085a9e] py-5 md:py-6 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Report this delivery
        </Button>

        <p className="mt-3 text-center text-sm text-gray-500">
          Available for 24 hours after delivery
        </p>
      </div>

    </div>
  );
};

export default ItemDetailPage;