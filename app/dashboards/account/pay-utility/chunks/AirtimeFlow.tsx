/* eslint-disable @typescript-eslint/no-unused-vars */
// components/AirtimeFlow.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { airtimeSchema, AirtimeFormData } from "@/types/utilityBills";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import animationData from "@/public/animate.json";
import { ClipLoader } from "react-spinners";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ChevronLeft, EyeOff, Eye } from "lucide-react";
import Lottie from "lottie-react";
import { getNetworkProvider } from "@/actions/utility";
import { handleValidatePin } from "@/lib/utils/api/apiHelper";
import { handleBuyAirtime } from "@/lib/utils/api/apiHelper"; // ← Add this import
import { generateIdempotencyKey } from "@/lib/utils/generateIdempotencyKey"; // ← Add this
import { useUser } from "@/context/userContext";
import Image from "next/image";

// Network logos (place images in /public/logos/)
const networkLogos: Record<string, string> = {
  MTN: "/logos/mtn.jpeg",
  AIRTEL: "/logos/airtel.svg",
  GLO: "/logos/glo.png",
  "9MOBILE": "/logos/9mobile.jpeg",
  ETISALAT: "/logos/9mobile.png", // alias
};

const amounts = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimeFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<Partial<AirtimeFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBallance, setShowBallance] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false); // New loading state
  const router = useRouter();
  const pinInputRef = useRef<HTMLInputElement>(null);
  const { wallet } = useUser();

  // Network detection states
  const [detectedNetwork, setDetectedNetwork] = useState<string | null>(null);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const form = useForm<AirtimeFormData>({
    resolver: zodResolver(airtimeSchema),
    defaultValues: {
      utilityType: "airtime",
      phoneNumber: "",
      network: "",
      amount: 100,
      pin: "",
    },
  });

  const { handleSubmit, setValue, watch, getValues } = form;
  const phoneNumber = watch("phoneNumber");

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Clean phone: remove everything except digits
      const cleanPhone = phoneNumber?.replace(/\D/g, "") || "";

      console.log("Current phone (raw):", phoneNumber);
      console.log("Cleaned phone:", cleanPhone, "Length:", cleanPhone.length);

      if (cleanPhone.length === 11) {
        setNetworkLoading(true);
        setNetworkError(null);
        setDetectedNetwork(null);

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");

        console.log("Token:", token ? "Found" : "Missing");

        if (!token) {
          setNetworkError("Please log in to detect network");
          setNetworkLoading(false);
          return;
        }

        const result = await getNetworkProvider(token, cleanPhone);
        console.log("API Result:", result);

        if (result.success && result.network) {
          setDetectedNetwork(result.network);
          setValue("network", result.network);
          toast.success(`Network detected: ${result.network}`);
        } else {
          setNetworkError(result.error || "Could not detect network");
        }

        setNetworkLoading(false);
      } else {
        setDetectedNetwork(null);
        setNetworkError(null);
        setValue("network", "");
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [phoneNumber, setValue]);

  const handleProceed = () => {
    const values = getValues();

    const errors = [];

    if (
      !values.phoneNumber ||
      values.phoneNumber.replace(/\D/g, "").length !== 11
    ) {
      errors.push("Phone number must be exactly 11 digits");
    }

    if (!values.network) {
      errors.push("Network provider is required");
    }

    if (!values.amount || values.amount < 100) {
      errors.push("Amount must be at least ₦100");
    }

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    setFormData(values);
    setStep(2);
  };

  const handleMakePayment = async () => {
  const pinValue = watch("pin");
  const phoneNumber = getValues("phoneNumber");
  const amountRaw = getValues("amount");
  const network = getValues("network");

  if (!pinValue || pinValue.length !== 4) {
    toast.error("Please enter your 4-digit PIN");
    pinInputRef.current?.focus();
    return;
  }

  if (!phoneNumber || phoneNumber.replace(/\D/g, "").length !== 11) {
    toast.error("Invalid phone number");
    return;
  }

  if (!amountRaw || Number(amountRaw) < 100) {
    toast.error("Amount must be at least ₦100");
    return;
  }

  if (!network) {
    toast.error("Network not detected");
    return;
  }

  setIsTransferring(true);

  try {
    // 1. Validate PIN
    const pinRes = await handleValidatePin({ pin: pinValue });

    if (pinRes.status !== "success" || !pinRes.data?.validated) {
      toast.error(pinRes.msg || "Invalid PIN");
      return;
    }

    const pinToken = pinRes.data.pinToken;

    // 2. Idempotency key
    const idempotencyKey = generateIdempotencyKey();

    // 3. Build payload - match Postman exactly
    const payload = {
      phoneNumber: phoneNumber.replace(/\D/g, ""),
      amount: amountRaw.toString(),          // ← force string like Postman
      pinToken,
      idempotencyKey,
      deviceFingerprint: "web-client-" + Date.now(), // ← non-empty, realistic
      ipAddress: "127.0.0.1",                // ← non-empty, common fallback
    };


    // 4. Buy airtime
    const response = await handleBuyAirtime(payload);

    console.log("[AIR] Full response:", JSON.stringify(response, null, 2));

    // Success check - matches both success and your error structure
    if (response.status === "success") {
      const ref = response?.data?.transactionReference || "N/A";
      toast.success(response.msg || `Airtime of ₦${amountRaw} sent! Ref: ${ref}`);
      setShowSuccess(true);
    } else {
      // Show the REAL backend message
      const errorMsg = response.msg || "Airtime purchase failed";
      toast.error(errorMsg);
    }
  } catch (error: any) {
    console.error("[AIR] Exception:", error);

    let msg = "Something went wrong. Please try again.";
    if (error?.response?.data?.msg) {
      msg = error.response.data.msg; // proxy-wrapped error
    } else if (error?.response?.data) {
      msg = error.response.data.msg || error.response.data.error || "Server error";
    } else if (error?.message) {
      msg = error.message;
    }

    toast.error(msg);
  } finally {
    setIsTransferring(false);
  }
};

  return (
    <Form {...form}>
      <form>
        <Card className=" p-3 md:p-6">
          <h2 className="text-[16px] text-[#2F2F2F] font-semibold font-clash mb-2">
            Airtime
          </h2>
          <Separator
            orientation="horizontal"
            className="h-[1px]"
            style={{ background: "#E0E0E0" }}
          />

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-3 ">
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                Buy Airtime with your Vendcliq Account
              </p>

              {/* Phone Number - Simple Input */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g. 07012121212"
                        maxLength={11}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                        className="bg-[#F9F9F9] border-[#D8D8D866] p-6 text-lg placeholder:text-[12px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Network Provider - Auto-detected */}
              <div>
                <Label>Network Provider</Label>
                <div className="mt-1 flex items-center gap-3 h-12 px-4 border border-gray-300 rounded-xl bg-gray-50">
                  {networkLoading ? (
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-[#0A6DC0] border-t-transparent rounded-full"></span>
                      Detecting network...
                    </span>
                  ) : detectedNetwork && networkLogos[detectedNetwork] ? (
                    <>
                      <Image height={20} width={20}
                        src={networkLogos[detectedNetwork]}
                        alt={detectedNetwork}
                        className="h-8 w-8 object-contain rounded-full"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                      <span className="font-medium text-[#2F2F2F]">
                        {detectedNetwork}
                      </span>
                    </>
                  ) : networkError ? (
                    <span className="text-red-600 text-sm">{networkError}</span>
                  ) : (
                    <span className="text-gray-400 text-[12px]">
                      Enter 11-digit phone number to detect network
                    </span>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label>Airtime Amount (₦)</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                  {amounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setValue("amount", amt)}
                      className={`py-3 rounded-lg border font-regular text-[13px] font-dm-sans transition-all hover:bg-white hover:shadow-md ${
                        watch("amount") === amt
                          ? "border-[#0A6DC0] text-[#0A6DC0] bg-[#0A6DC01A] hover:shadow-none hover:bg-[#0A6DC01A]"
                          : "bg-gray-50"
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  {...form.register("amount", { valueAsNumber: true })}
                  placeholder="Enter amount"
                  className="mt-4 bg-[#F9F9F9] border border-[#D8D8D866] py-6"
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value ? Number(value) : 100;
                    setValue("amount", numValue);
                  }}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleProceed}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6"
              >
                Proceed
              </Button>
            </div>
          )}

          {/* Step 2 - Confirm */}
          {step === 2 && formData && (
            <div className="space-y-2 mt-1">
              <button
                type="button"
                
                onClick={() => setStep(1)}
                className="mt-2"
              >
                <ChevronLeft size={30} className="" /> 
              </button>
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                Confirm this purchase before you input PIN
              </p>

              <div className="bg-[url('/balance-bg.svg')]  bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex items-center gap-4">
                        <h1 className="font-bold font-dm-sans font-regular text-[13px] text-white">
                          Wallet Balance
                        </h1>
                        <button
                          type="button"
                          onClick={() => setShowBallance(!showBallance)}
                        >
                          {showBallance ? (
                            <EyeOff size={21} color="white" />
                          ) : (
                            <Eye size={23} color="white" />
                          )}
                        </button>
                      </div>
                      {showBallance ? (
                        <h1 className="text-[28px] text-white font-clash font-bold">
                          ******
                        </h1>
                      ) : (
                        <h1 className="font-clash text-white text-[20px] font-semibold">
                          ₦{wallet?.balance?.toLocaleString() || "0"}
                        </h1>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-[#2F2F2F] font-dm-sans font-bold text-[16px]">
                    Airtime Amount
                  </p>
                  <p className="text-[16px] font-dm-sans text-[#2F2F2F] font-regular">
                    ₦{formData.amount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[#2F2F2F] font-dm-sans font-bold text-[16px]">
                    Phone Number
                  </p>
                  <p className="text-[16px] font-dm-sans text-[#2F2F2F] font-regular">
                    {formData.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[#2F2F2F] font-dm-sans font-bold text-[16px]">
                    Network Provider
                  </p>
                  <p className="text-[16px] font-dm-sans text-[#2F2F2F] font-regular">
                    {formData.network}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setStep(3)}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-5 md:py-6"
              >
              Proceed
              </Button>
              
            </div>
          )}

          {/* Step 3 - PIN */}
          {step === 3 && (
            <div className="space-y-8 mt-3">
              <button
                type="button"
                
                onClick={() => setStep(2)}
                className="mt-2"
              >
                <ChevronLeft size={30} className="" /> 
              </button>
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                To proceed with this transaction, please enter your PIN
              </p>

              {/* PIN Display Boxes with blinking cursor */}
              <div className="flex gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="relative">
                    <div
                      className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-[16px] font-medium transition-all relative ${
                        watch("pin")?.[index]
                          ? "border-[#0A6DC0] bg-[#0A6DC01A]"
                          : "border-[#D8D8D866] bg-[#F9F9F9]"
                      } ${
                        watch("pin")?.length === index
                          ? "!border-[#0A6DC0] !bg-white"
                          : ""
                      }`}
                    >
                      {watch("pin")?.[index] || ""}
                      {watch("pin")?.length === index &&
                        !watch("pin")?.[index] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[2px] h-4 bg-[#0A6DC0] animate-blink" />
                          </div>
                        )}
                    </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={watch("pin")?.[index] || ""}
                      onChange={(e) => {
                        const digit = e.target.value.replace(/\D/g, "");
                        if (!digit && e.target.value !== "") return;

                        const currentPin = watch("pin") || "";
                        const newPin = currentPin.split("");
                        newPin[index] = digit;
                        const joined = newPin.join("").trim().slice(0, 4);
                        setValue("pin", joined);

                        if (digit && index < 3) {
                          setTimeout(() => {
                            document
                              .getElementById(`pin-input-${index + 1}`)
                              ?.focus();
                          }, 10);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          !watch("pin")?.[index] &&
                          index > 0
                        ) {
                          e.preventDefault();
                          document
                            .getElementById(`pin-input-${index - 1}`)
                            ?.focus();
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      onBlur={() => {}}
                      id={`pin-input-${index}`}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                      autoFocus={index === 0}
                      ref={index === 0 ? pinInputRef : null}
                    />
                  </div>
                ))}
              </div>

              <style jsx>{`
                @keyframes blink {
                  0%,
                  100% {
                    opacity: 1;
                  }
                  50% {
                    opacity: 0;
                  }
                }
                .animate-blink {
                  animation: blink 1s infinite;
                }
              `}</style>

              <Button
                type="button"
                onClick={handleMakePayment}
                disabled={isTransferring || watch("pin")?.length !== 4}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] font-dm-sans py-6"
              >
                {isTransferring ? (
                  <>
                    <ClipLoader size={20} color="white" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  "Make Payment"
                )}
              </Button>

            </div>
          )}
        </Card>
      </form>

      {/* Success Modal */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="text-center w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px]">
          <AlertDialogHeader>
            <Lottie
              animationData={animationData}
              loop={true}
              className="w-64 h-64 mx-auto drop-shadow-lg"
            />
            <AlertDialogTitle className="text-center text-[#2F2F2F] text-[20px] md:text-[25px] font-semibold font-clash">
              Airtime Purchased Successfully
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans text-center">
              Your airtime purchase is successful and has been sent to the phone
              number.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccess(false);
                router.push("/dashboards/account/overview");
              }}
              className="mt-6 bg-[#0A6DC0] hover:bg-[#09599a] w-full"
            >
              Back to Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
