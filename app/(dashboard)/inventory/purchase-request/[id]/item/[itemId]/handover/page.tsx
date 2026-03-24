/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getPurchaseRequestById,
  verifyHandover,
  handleSuccessfulHandover,
} from "@/lib/utils/api/apiHelper";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { MoveLeft } from "lucide-react";
import { ClipLoader } from "react-spinners";

export default function HandoverVerificationPage() {
  const { id: requestId, itemId } = useParams<{
    id: string;
    itemId: string;
  }>();
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [handoverType, setHandoverType] = useState<"customer" | "driver">(
    "customer",
  );
  const [submitting, setSubmitting] = useState(false);
  const [itemData, setItemData] = useState<any>(null);
  const [loadingOtp, setLoadingOtp] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!requestId || !itemId) {
      toast.error("Missing request or item information");
      router.back();
      return;
    }

    const fetchItem = async () => {
      if (handoverType === "driver") setLoadingOtp(true);
      try {
        const res = await getPurchaseRequestById(requestId as string);
        if (res.statusCode === 200 && res.data) {
          const foundItem = res.data.items?.find((i: any) => i.id === itemId);
          if (foundItem) {
            setItemData(foundItem);
          } else {
            toast.error("Item not found in this request");
          }
        } else {
          toast.error(res.error || "Failed to load request");
        }
      } catch (err: any) {
        const errorMessage =
          typeof err === "string"
            ? err
            : err?.message ||
              err?.response?.data?.message ||
              "An error occurred";
        toast.error(errorMessage);
      } finally {
        setLoadingOtp(false);
      }
    };

    fetchItem();
  }, [requestId, itemId, router]);

  useEffect(() => {
    if (!itemData?.otp_codes) return;

    const driverOtp = itemData.otp_codes.driver_otp || "";

    if (handoverType === "driver") {
      if (driverOtp.length === 4 && /^\d{4}$/.test(driverOtp)) {
        setOtp(driverOtp.split(""));
        inputRefs.current[3]?.focus();
      } else {
        setOtp(Array(4).fill(""));
      }
    } else {
      // customer — always show empty boxes
      setOtp(Array(4).fill(""));
    }
  }, [handoverType, itemData]);

  const handleSubmit = async () => {
    const otpCode = otp.join("").trim();
    if (otpCode.length !== 4) {
      toast.error("Please enter a complete 4-digit OTP");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        item_id: itemId as string,
        otp: otpCode,
        handover_type: handoverType,
      };

      const response = await verifyHandover(payload);

      if (
        response?.status === true ||
        response?.statusCode === 200 ||
        response?.success
      ) {
        toast.success("Handover verified successfully!");

        // ── Once handover is verified, add the item to the store ──
        try {
          const storeId = itemData?.attributes?.storeId;

          if (!storeId) {
            toast.error(
              "Store information missing, could not complete stock update",
            );
          } else {
            const handoverRes = await handleSuccessfulHandover({
              item_id: itemId as string,
              store_id: storeId,
            });

            if (
              handoverRes?.statusCode === 200 ||
              handoverRes?.status === true ||
              handoverRes?.success
            ) {
              toast.success("Item added to store successfully!");
            } else {
              toast.error(
                handoverRes?.error ||
                  handoverRes?.message ||
                  "Failed to add item to store",
              );
            }
          }
        } catch (handoverErr: any) {
          const errMsg =
            typeof handoverErr === "string"
              ? handoverErr
              : handoverErr?.response?.data?.message ||
                handoverErr?.message ||
                "Failed to add item to store";
          toast.error(errMsg);
        }

        // Navigate regardless of the store update result
        router.push(`/inventory/purchase-request/${requestId}`);
      } else {
        const msg =
          response?.message || response?.error || "Verification failed";
        toast.error(String(msg));
      }
    } catch (err: any) {
      const errorMessage =
        typeof err === "string"
          ? err
          : err?.response?.data?.message || err?.message || "An error occurred";
      toast.error(String(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors "
      >
        <MoveLeft className="w-5 h-5" />
      </button>
      <div>
        <h1 className="font-semibold font-clash text-[20px] md:text-[25px]">
          Hand Over Product{" "}
        </h1>
        <p className="font-dm-sans text-[#9E9A9A] font-medium">
          How would you like to hand over this item?
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 md:gap-8 mt-3 md:mt-8">
        <div className="block lg:hidden flex gap-2 bg-[#ECECF080] p-1 rounded-lg">
          <button
            onClick={() => setHandoverType("customer")}
            className={`
              flex-1 py-3 rounded-lg font-dm-sans font-medium text-[14px] transition-all
              ${
                handoverType === "customer"
                  ? "bg-[#0A6DC0] text-white"
                  : "text-[#9E9A9A]"
              }
            `}
          >
            Customer
          </button>
          <button
            onClick={() => setHandoverType("driver")}
            className={`
              flex-1 py-3 rounded-lg font-dm-sans font-medium text-[14px] transition-all
              ${
                handoverType === "driver"
                  ? "bg-[#0A6DC0] text-white"
                  : "text-[#9E9A9A]"
              }
            `}
          >
            Driver
          </button>
        </div>

        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg h-full lg:w-[35%] bg-white hidden lg:block">
          <div className="mb-3">
            <h2 className="text-[16px] text-[#2F2F2F] font-clash font-semibold mb-2">
              How would you like to hand over this item?
            </h2>
            <Separator
              orientation="horizontal"
              className="h-[1px]"
              style={{ background: "#E0E0E0" }}
            />
          </div>
          <div className="hidden lg:block space-y-4">
            <Label
              onClick={() => setHandoverType("customer")}
              className={`
                flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all relative
                ${
                  handoverType === "customer"
                    ? "border-[#0A6DC012] bg-[#0A6DC012]"
                    : "border-gray-200 bg-white"
                }
              `}
            >
              <div className="flex-1">
                <h3
                  className={`text-[16px] font-dm-sans font-medium ${
                    handoverType === "customer"
                      ? "text-[#2F2F2F]"
                      : "text-[#9E9A9A]"
                  }`}
                >
                  Customer
                </h3>
              </div>
              <div className="flex-shrink-0">
                {handoverType === "customer" ? (
                  <Image
                    src={"/checkbox.svg"}
                    alt="checkbox"
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src={"/border.svg"}
                    alt="checkbox"
                    width={16}
                    height={16}
                  />
                )}
              </div>
            </Label>

            <Label
              onClick={() => setHandoverType("driver")}
              className={`
                flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all relative
                ${
                  handoverType === "driver"
                    ? "border-[#0A6DC012] bg-[#0A6DC012]"
                    : "border-gray-200 bg-white"
                }
              `}
            >
              <div className="flex-1">
                <h3
                  className={`text-[16px] font-dm-sans font-medium ${
                    handoverType === "driver"
                      ? "text-[#2F2F2F]"
                      : "text-[#9E9A9A]"
                  }`}
                >
                  Driver
                </h3>
              </div>
              <div className="flex-shrink-0">
                {handoverType === "driver" ? (
                  <Image
                    src={"/checkbox.svg"}
                    alt="checkbox"
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src={"/border.svg"}
                    alt="checkbox"
                    width={16}
                    height={16}
                  />
                )}
              </div>
            </Label>
          </div>
        </div>

        {/* Right: OTP Input & Submit */}
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg lg:w-[65%] bg-white">
          <div className="mb-3">
            <h2 className="text-[16px] text-[#2F2F2F] font-clash font-semibold mb-2">
              Hand Over Item to{" "}
              {handoverType === "customer" ? "Customer" : "Driver"}
            </h2>
            <Separator
              orientation="horizontal"
              className="h-[1px]"
              style={{ background: "#E0E0E0" }}
            />
          </div>
          <p className="font-dm-sans font-medium text-[#9E9A9A]">
            Here is the details on how to hand-over to {handoverType}
          </p>

          <div className="flex gap-3 md:gap-4 my-6">
            {otp.map((digit, index) => (
              <div key={index} className="relative h-14 w-14 md:h-16 md:w-16">
                {loadingOtp && handoverType === "driver" ? (
                  <div className="h-full w-full border-2 border-[#9E9A9A] bg-[#D8D8D866] rounded-xl flex items-center justify-center">
                    <ClipLoader size={20} color="#0A6DC0" />
                  </div>
                ) : (
                  <Input
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    readOnly={handoverType === "driver"}
                    onChange={(e) => {
                      if (handoverType === "driver") return;
                      const val = e.target.value.replace(/\D/g, "");
                      if (!val) return;
                      const newOtp = [...otp];
                      newOtp[index] = val.slice(-1);
                      setOtp(newOtp);
                      if (index < 3) inputRefs.current[index + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (handoverType === "driver") return;
                      if (e.key === "Backspace") {
                        const newOtp = [...otp];
                        newOtp[index] = "";
                        setOtp(newOtp);
                        if (index > 0) inputRefs.current[index - 1]?.focus();
                      }
                    }}
                    className={`text-center text-[#333333] text-[20px] font-medium h-full w-full border-2 border-[#9E9A9A] bg-[#D8D8D866] rounded-xl ${
                      handoverType === "driver"
                        ? "cursor-not-allowed"
                        : "cursor-text"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="font-medium text-[#2F2F2F]">
            This code is only for the {handoverType}.
          </p>

          <Button
            onClick={handleSubmit}
            disabled={submitting || otp.join("").length !== 4 || loadingOtp}
            className="w-full mt-3 py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#085a9e] disabled:opacity-70"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                Verifying...
                <ClipLoader size={24} color="white" />
              </div>
            ) : (
              "Complete Hand-Over"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
