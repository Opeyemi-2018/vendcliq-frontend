/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboards/my-purchases/item/[itemId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { handleGetItemTrackingStatus } from "@/lib/utils/api/apiHelper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Truck } from "lucide-react";
import { ClipLoader } from "react-spinners";
import Image from "next/image";

const ItemDetailPage = () => {
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

      // Handle the new response format from logistics API
      if (response.message) {
        // Plain text response wrapped in { message: "..." }
        setTrackingMessage(response.message);
        setTrackingData(null);
      } else if (response.statusCode === 200 && response.data) {
        // Normal JSON response with tracking data
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
      {delivery && (
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

          {/* <p className="text-2xl font-bold font-mono tracking-widest">
                        {driverOtp}
                      </p> */}
        </div>
      )}

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
          <div>
            <h1 className="font-bold">Delivery Address</h1>
            <p>{address}</p>
          </div>
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
        <div>
          {loadingTracking ? (
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
              {/* ... existing tracking data display ... */}
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
          )}
        </div>
      )}
    </div>
  );
};

export default ItemDetailPage;
