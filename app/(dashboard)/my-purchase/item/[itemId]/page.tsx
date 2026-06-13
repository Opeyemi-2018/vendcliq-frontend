/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

const ItemDetailPage = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemId = params.itemId as string;
  const delivery = searchParams.get("delivery") === "true";
  const productName = decodeURIComponent(searchParams.get("productName") || "");
  const quantity = parseInt(searchParams.get("quantity") || "0");
  const cost = parseFloat(searchParams.get("cost") || "0");
  const price = parseFloat(searchParams.get("price") || "0");
  const productImage = decodeURIComponent(searchParams.get("productImage") || "");
  const sku = decodeURIComponent(searchParams.get("sku") || "");
  const address = decodeURIComponent(searchParams.get("address") || "");
  const customerOtp = searchParams.get("customerOtp") || "";

  if (!itemId) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">Item ID is required</p>
          <Button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
            Share this OTP delivery confirmation code with the driver or supplier
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
          {productImage && (
            <div className="relative h-56 w-full">
              <Image src={productImage} alt={productName} fill className="object-contain" />
            </div>
          )}
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-y-3 lg:grid-cols-3">
          <div><h1 className="font-bold">Item Name</h1><p>{sku}</p></div>
          <div><h1 className="font-bold">Quantity</h1><p>{quantity}</p></div>
          <div><h1 className="font-bold">Unit Price</h1><p>{price}</p></div>
          <div><h1 className="font-bold">Amount</h1><p>{cost}</p></div>
          {address && <div><h1 className="font-bold">Delivery Address</h1><p>{address}</p></div>}
        </div>
      </div>

      <div className="px-6 py-6 bg-gray-50 border-t border-gray-100">
        <Button
          onClick={() => setReportOpen(!reportOpen)}
          className="w-full px-6 bg-[#0A6DC0] hover:bg-[#085a9e] py-5 md:py-6 text-white font-medium rounded-lg"
        >
          Report this delivery
        </Button>
        <p className="mt-3 text-center text-sm text-gray-500">Available for 24 hours after delivery</p>
      </div>
    </div>
  );
};

export default ItemDetailPage;