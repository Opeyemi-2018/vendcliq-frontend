/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import animationData from "@/public/animate.json";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  MoveRight,
  ChevronDown,
  MoveLeft,
  ChevronRight,
} from "lucide-react";

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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { DataSchema, DataFormData, DataPlanItem } from "@/types/utilityBills";
import { Separator } from "@/components/ui/separator";
import { getNetworkProvider, fetchDataPlans } from "@/actions/utility";
import { ClipLoader } from "react-spinners";
import { handleValidatePin, handleBuyData } from "@/lib/utils/api/apiHelper";
import { generateIdempotencyKey } from "@/lib/utils/generateIdempotencyKey";
import CreatePinPrompt from "@/components/SetPinModal";
import Image from "next/image";
import { useWallet } from "@/hooks/useWallet";

const networkLogos: Record<string, string> = {
  MTN: "/logos/mtn.jpeg",
  AIRTEL: "/logos/airtel.svg",
  GLO: "/logos/glo.png",
  "9MOBILE": "/logos/9mobile.jpeg",
  ETISALAT: "/logos/9mobile.png",
};

export default function DataFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { wallet, refreshWallet, getBalance } = useWallet();

  const [detectedNetwork, setDetectedNetwork] = useState<string | null>(null);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const [fetchedPlans, setFetchedPlans] = useState<DataPlanItem[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  const form = useForm<DataFormData>({
    resolver: zodResolver(DataSchema),
    defaultValues: {
      utilityType: "data",
      phoneNumber: "",
      network: "",
      dataBundle: { size: "", validity: "", price: 0 },
      pin: "",
    },
  });

  const { setValue, watch, getValues } = form;
  const phoneNumber = watch("phoneNumber");
  const dataBundle = watch("dataBundle");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const ITEMS_PER_PAGE = isMobile ? 3 : 4;
  const totalPages = Math.ceil(fetchedPlans.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentPlans = fetchedPlans.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      const cleanPhone = phoneNumber?.replace(/\D/g, "") || "";

      if (cleanPhone.length === 11) {
        setNetworkLoading(true);
        setNetworkError(null);
        setDetectedNetwork(null);

        const token =
          localStorage.getItem("accessToken") 

        if (!token) {
          setNetworkError("Please log in to detect network");
          setNetworkLoading(false);
          return;
        }

        const result = await getNetworkProvider(token, cleanPhone);

        if (result.success && result.network) {
          setDetectedNetwork(result.network);
          setValue("network", result.network);
        } else {
          setNetworkError(result.error || "Could not detect network");
        }

        setNetworkLoading(false);
      } else {
        setDetectedNetwork(null);
        setNetworkError(null);
        setValue("network", "");
      }
    }, 800); 

    return () => clearTimeout(timer);
  }, [phoneNumber, setValue]);

  useEffect(() => {
    const cleanPhone = phoneNumber?.replace(/\D/g, "") || "";

    if (cleanPhone.length === 11 && detectedNetwork) {
      const loadPlans = async () => {
        setPlansLoading(true);
        setPlansError(null);

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");

        if (!token) {
          setPlansError("Please log in");
          toast.error("Authentication required");
          setPlansLoading(false);
          return;
        }

        const result = await fetchDataPlans(token, cleanPhone);

        if (result.success) {
          setFetchedPlans(result.plans || []);
          setCurrentPage(0);
          // toast.success("Data plans loaded");
        } else {
          setPlansError(result.error);
          toast.error(result.error);
        }

        setPlansLoading(false);
      };

      loadPlans();
    }
  }, [phoneNumber, detectedNetwork]);

  // Auto-select first plan if none selected
  useEffect(() => {
    if (fetchedPlans.length > 0 && !getValues("dataBundle")?.size) {
      const first = fetchedPlans[0];
      if (first) {
        setValue("dataBundle", {
          size: first.dataBundle,
          validity: first.validity,
          price: Number(first.amount),
        });
      }
    }
  }, [fetchedPlans]);

  const handleProceed = () => {
    const values = getValues();
    const errors: string[] = [];

    if (
      !values.phoneNumber ||
      values.phoneNumber.replace(/\D/g, "").length !== 11
    ) {
      errors.push("Phone number must be 11 digits");
    }
    if (!values.network) {
      errors.push("Network required");
    }
    if (!values.dataBundle?.size) {
      errors.push("Select a plan");
    }

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    setStep(2);
  };

  const handleMakePayment = async () => {
    const pinValue = watch("pin");

    if (pinValue.length !== 4) {
      toast.error("Please enter your 4-digit PIN");
      pinInputRefs.current[0]?.focus();
      return;
    }

    setIsPaying(true);

    try {
      // 1. Validate PIN → get pinToken
      const pinRes = await handleValidatePin({ pin: pinValue });

      if (pinRes.status !== "success" || !pinRes.data?.validated) {
        toast.error(pinRes.msg || "Invalid PIN");
        return;
      }

      const pinToken = pinRes.data.pinToken;

      // 2. Selected plan
      const selectedPlan = fetchedPlans.find(
        (p) => p.dataBundle === getValues("dataBundle.size"),
      );

      if (!selectedPlan) {
        toast.error("Selected plan not found");
        return;
      }

      // 3. Build payload
      const payload = {
        phoneNumber: getValues("phoneNumber").replace(/\D/g, ""),
        productId: selectedPlan.productId,
        amount: selectedPlan.amount.toString(), // string
        network: getValues("network"),
        pinToken,
        idempotencyKey: generateIdempotencyKey(),
        deviceFingerprint: "web-client-" + Date.now(),
        ipAddress: "127.0.0.1",
      };

      // 4. Buy data
      const response = await handleBuyData(payload);

      if (response.status === "success") {
        toast.success(response.msg || "Data purchased successfully!");
        await refreshWallet(); // refresh balance
        setShowSuccess(true);
      } else {
        toast.error(response.msg || "Data purchase failed");
      }
    } catch (error: any) {
      console.error("[DATA] Exception:", error);
      const msg =
        error?.response?.data?.msg || error?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setIsPaying(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Form {...form}>
      <form>
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg bg-white">
          <div className="flex justify-between mb-2">
            <h2 className="text-[16px] text-[#2F2F2F] font-semibold font-clash">
              Data
            </h2>
            <CreatePinPrompt />
          </div>
          <Separator
            orientation="horizontal"
            className="h-[1px]"
            style={{ background: "#E0E0E0" }}
          />

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                Buy Data with your Vendcliq Account
              </p>

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g. 07066369927"
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

              {/* Network Provider */}
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
                      <Image
                        height={32}
                        width={32}
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
                    <span className="text-gray-400 text-[10px]">
                      Enter 11-digit phone number to detect network
                    </span>
                  )}
                </div>
              </div>

              {/* Data Plans */}
              <div>
                <Label>Select Data Plans</Label>

                {plansLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <ClipLoader color="#0A6DC0" size={30} />
                  </div>
                ) : plansError ? (
                  <p className="text-red-600 text-sm">{plansError}</p>
                ) : fetchedPlans.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Enter 11-digit phone number to load plans
                  </p>
                ) : (
                  <>
                    {/* Plans Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-4 mt-1">
                      {currentPlans.map((plan: DataPlanItem, index: number) => (
                        <button
                          key={startIndex + index}
                          type="button"
                          onClick={() =>
                            setValue(
                              "dataBundle",
                              {
                                size: plan.dataBundle,
                                validity: plan.validity,
                                price: Number(plan.amount),
                              },
                              { shouldValidate: true },
                            )
                          }
                          className={`p-2 h-[110px] md:h-[95px] flex flex-col items-center justify-center text-[12px] font-medium font-dm-sans rounded-xl transition-all ${
                            dataBundle?.size === plan.dataBundle
                              ? "text-white bg-[#0A6DC0] border-[#0A6DC0]"
                              : "border border-[#0A6DC033] bg-[#0A6DC01A] text-[#0A6DC0] hover:border-gray-300"
                          }`}
                        >
                          <span>{plan.dataBundle}</span>
                          <span>{plan.validity}</span>
                          <span>₦{Number(plan.amount).toLocaleString()}</span>
                        </button>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center my-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      <span className="text-sm text-gray-600">
                        Page {currentPage + 1} of {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        type="button"
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {form.formState.errors.dataBundle && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.dataBundle.message}
                </p>
              )}

              <Button
                type="button"
                onClick={handleProceed}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6"
                disabled={plansLoading || fetchedPlans.length === 0}
              >
                Proceed
              </Button>
            </div>
          )}

          {/* Step 2 - Confirm */}
          {step === 2 && (
            <div className="space-y-2 mt-1">
              <button type="button" onClick={() => setStep(1)} className="mt-2">
                <MoveLeft />
              </button>
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                Confirm this purchase before you input PIN
              </p>

              <div className="bg-[url('/balance-bg.svg')] bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex items-center gap-4">
                        <h1 className="font-bold font-dm-sans font-regular text-[13px] text-white">
                          Wallet Balance
                        </h1>
                        <button
                          type="button"
                          onClick={() => setShowBalance(!showBalance)}
                        >
                          {showBalance ? (
                            <EyeOff size={21} color="white" />
                          ) : (
                            <Eye size={23} color="white" />
                          )}
                        </button>
                      </div>
                      {showBalance ? (
                        <h1 className="text-[28px] text-white font-clash font-bold">
                          ******
                        </h1>
                      ) : (
                        <h1 className="font-clash text-white text-[20px] font-semibold">
                          ₦{getBalance()?.toLocaleString() || "0"}
                        </h1>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-[#2F2F2F] font-dm-sans font-bold text-[16px]">
                    Amount
                  </p>
                  <p className="text-[16px] font-dm-sans text-[#2F2F2F] font-regular">
                    ₦{watch("dataBundle.price")?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[#2F2F2F] font-dm-sans font-bold text-[16px]">
                    Data Bundle
                  </p>
                  <p className="text-[16px] font-dm-sans text-[#2F2F2F] font-regular">
                    {watch("dataBundle.size")} • {watch("dataBundle.validity")}
                  </p>
                </div>
                <div>
                  <p className="text-[#2F2F2F] font-dm-sans font-bold text-[16px]">
                    Phone Number
                  </p>
                  <p className="text-[16px] font-dm-sans text-[#2F2F2F] font-regular">
                    {watch("phoneNumber")}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setStep(3)}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6"
              >
                Proceed
              </Button>
            </div>
          )}

          {/* Step 3 - PIN Entry */}
          {step === 3 && (
            <div className="space-y-8 mt-3">
              <button type="button" onClick={() => setStep(2)} className="mt-2">
                <MoveLeft />
              </button>
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                To proceed with this transaction, please enter your PIN
              </p>

              {/* PIN Boxes */}
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
                            pinInputRefs.current[index + 1]?.focus();
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
                          pinInputRefs.current[index - 1]?.focus();
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      ref={(el) => {
                        pinInputRefs.current[index] = el;
                      }}
                      className="absolute inset-0 opacity-0 cursor-default"
                      autoFocus={index === 0}
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
                disabled={isPaying || watch("pin")?.length !== 4}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] font-dm-sans py-6"
              >
                {isPaying ? (
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
        </div>
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
              🎉 Data Purchase Successful 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans text-center">
              <div>
                <span className="font-bold text-[#2F2F2F]">
                  {watch("dataBundle.size")} • {watch("dataBundle.validity")}
                </span>{" "}
                data has been sent!
              </div>
              <div className="text-[#0A6DC0] font-semibold tracking-wide text-[17px]">
                to {watch("phoneNumber")}
              </div>
              <div className="text-[#9E9A9A] text-[14px] mt-4">
                Thank you for using Vendcliq!
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccess(false);
                router.push("/account/overview");
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
