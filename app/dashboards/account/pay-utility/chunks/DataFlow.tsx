/* eslint-disable @typescript-eslint/no-unused-vars */
// components/DataFlow.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DataSchema, DataFormData, dataPlanTypes } from "@/types/utilityBills";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";
import animationData from "@/public/animate.json";

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

import { ChevronDown, EyeOff, Eye, ChevronLeft } from "lucide-react";
import Lottie from "lottie-react";

const networks = [
  { id: "mtn", label: "MTN", color: "bg-yellow-400" },
  { id: "airtel", label: "Airtel", color: "bg-red-500" },
  { id: "glo", label: "Glo", color: "bg-green-600" },
  { id: "9mobile", label: "9mobile", color: "bg-green-700" },
] as const;

// Data plans organized by plan type
const dataPlans = {
  HOT: [
    {
      size: "2.5GB",
      validity: "2 Days",
      price: 500,
    },
    {
      size: "1GB",
      validity: "1 Day",
      price: 300,
    },
    {
      size: "500MB",
      validity: "1 Day",
      price: 200,
    },
  ],
  Daily: [
    {
      size: "1GB",
      validity: "7 Days",
      price: 500,
    },
    {
      size: "2GB",
      validity: "7 Days",
      price: 1000,
    },
    {
      size: "3GB",
      validity: "7 Days",
      price: 1500,
    },
  ],
  Weekly: [
    {
      size: "2GB",
      validity: "14 Days",
      price: 1200,
    },
    {
      size: "4.5GB",
      validity: "30 Days",
      price: 2000,
    },
    {
      size: "6GB",
      validity: "30 Days",
      price: 2500,
    },
  ],
  Monthly: [
    {
      size: "10GB",
      validity: "30 Days",
      price: 3000,
    },
    {
      size: "15GB",
      validity: "30 Days",
      price: 4000,
    },
    {
      size: "25GB",
      validity: "30 Days",
      price: 6000,
    },
  ],
  XtraValue: [
    {
      size: "3GB",
      validity: "30 Days",
      price: 1500,
    },
    {
      size: "5GB",
      validity: "30 Days",
      price: 2000,
    },
    {
      size: "8GB",
      validity: "30 Days",
      price: 3000,
    },
  ],
  Broadband: [
    {
      size: "50GB",
      validity: "30 Days",
      price: 15000,
    },
    {
      size: "100GB",
      validity: "30 Days",
      price: 25000,
    },
    {
      size: "200GB",
      validity: "60 Days",
      price: 40000,
    },
  ],
};

export default function DataFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<Partial<DataFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [openNetwork, setOpenNetwork] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [selectedPlanType, setSelectedPlanType] =
    useState<keyof typeof dataPlans>("HOT");
  const router = useRouter();
  const pinInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DataFormData>({
    resolver: zodResolver(DataSchema),
    defaultValues: {
      utilityType: "data",
      phoneNumber: "",
      network: "mtn",
      dataBundle: dataPlans.HOT[0],
      pin: "",
    },
  });

  const { handleSubmit, setValue, watch, getValues } = form;
  const selectedNetwork = networks.find((n) => n.id === watch("network"));
  const selectedDataBundle = watch("dataBundle");

  // Focus PIN input when step changes to 3
  useEffect(() => {
    if (step === 3 && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [step]);

  const handleProceed = () => {
    const values = getValues();

    // Manual validation
    const errors = [];

    if (!values.phoneNumber || values.phoneNumber.length < 10) {
      errors.push("Phone number must be at least 10 digits");
    }

    if (!values.network) {
      errors.push("Please select a network");
    }

    if (!values.dataBundle) {
      errors.push("Please select a data plan");
    }

    if (errors.length > 0) {
      toast.error(errors.join(", "));
      return;
    }

    setFormData(values);
    setStep(2);
  };

  const handlePinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setValue("pin", value);
  };

  const handleMakePayment = () => {
    const pinValue = watch("pin");

    // Check if PIN is complete
    if (pinValue?.length === 4) {
      toast.success("Payment successful!");
      setShowSuccess(true);
    } else {
      toast.error("Please enter your 4-digit PIN");
      // Focus back to PIN input if not complete
      if (pinInputRef.current) {
        pinInputRef.current.focus();
      }
    }
  };

  return (
    <Form {...form}>
      <form>
        <Card className="p-6">
          <h2 className="text-[16px] text-[#2F2F2F] font-semibold font-clash mb-2">
            Data
          </h2>
          <Separator
            orientation="horizontal"
            className="h-[1px]"
            style={{ background: "#E0E0E0" }}
          />

          {/* Step 1 - Select Data Plan */}
          {step === 1 && (
            <div className="space-y-6 mt-3">
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
                      <PhoneInput
                        country={"ng"}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        inputStyle={{
                          width: "100%",
                          height: "56px",
                          backgroundColor: "#F9F9F9",
                          borderRadius: "8px",
                          borderColor: "#D8D8D866",
                        }}
                        buttonStyle={{
                          borderRadius: "8px 0 0 8px",
                          border: "#D8D8D866",
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Network Provider */}
              <div>
                <Label>Network Provider</Label>
                <div className="relative mt-4">
                  <button
                    type="button"
                    onClick={() => setOpenNetwork(!openNetwork)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                      watch("network")
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selectedNetwork ? (
                        <>
                          <div
                            className={`w-6 h-6 rounded-full ${selectedNetwork.color}`}
                          />
                          <span className="font-medium">
                            {selectedNetwork.label}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500">Select network</span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        openNetwork ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openNetwork && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-10">
                      {networks.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            setValue("network", n.id);
                            setOpenNetwork(false);
                          }}
                          className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-all first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className={`w-6 h-6 rounded-full ${n.color}`} />
                          <span className="font-medium">{n.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {form.formState.errors.network && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.network.message}
                  </p>
                )}
              </div>

              {/* Data Plan Selection */}
              <div>
                <Label>Select Data Plans</Label>

                {/* Plan Type Tabs */}
                <div className="flex gap-8 flex-wrap mt-4 mb-6">
                  {Object.keys(dataPlans).map((planType) => (
                    <button
                      key={planType}
                      type="button"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onClick={() => setSelectedPlanType(planType as any)}
                      className="font-dm-sans text-start"
                    >
                      <span
                        className={`inline-block ${
                          selectedPlanType === planType
                            ? "text-[13px] font-bold text-[#0A6DC0] border-b-2 border-[#0A6DC0]"
                            : "text-[#9E9A9A] text-[13px] font-regular"
                        }`}
                      >
                        {planType}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Data Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dataPlans[selectedPlanType].map((plan, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setValue("dataBundle", plan)}
                      className={`p-4 flex flex-col gap-2 items-center justify-center rounded-xl border-2 text-left transition-all ${
                        selectedDataBundle?.size === plan.size
                          ? "border-[#0A6DC0] text-[#0A6DC0] bg-[#0A6DC01A] hover:shadow-none hover:bg-[#0A6DC01A]"
                          : "border bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="">{plan.size}</span>

                      <span>{plan.validity}</span>

                      <span className="">₦{plan.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
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
                disabled={!selectedDataBundle}
              >
                Proceed
              </Button>
            </div>
          )}

          {/* Step 2 - Confirm Data Purchase */}
          {step === 2 && formData && (
            <div className="space-y-8 mt-3">
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                Confirm this purchase before you input PIN
              </p>

              {/* Wallet Balance */}
              <div className="bg-[url('/balance-bg.svg')] bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-dm-sans font-regular text-[14px]">
                      Wallet Balance
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAccount(!showAccount)}
                    >
                      {showAccount ? (
                        <EyeOff size={18} color="white" />
                      ) : (
                        <Eye size={20} color="white" />
                      )}
                    </button>
                  </div>
                  {showAccount ? (
                    <h1 className="text-[20px] text-white font-clash font-bold">
                      ******
                    </h1>
                  ) : (
                    <h1 className="text-[20px] text-white font-clash font-bold">
                      ₦300,500,750
                    </h1>
                  )}
                </div>
              </div>

              {/* Purchase Details */}
              <div className="space-y-6">
                <div>
                  <p className="text-[#2F2F2F] font-dm-sans font-bold text-[16px]">
                    Amount
                  </p>
                  <p className="text-[16px] font-dm-sans text-[#2F2F2F] font-regular">
                    ₦{formData.dataBundle?.price?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[#2F2F2F] font-dm-sans font-bold text-[16px]">
                    Data Bundle
                  </p>
                  <p className="text-[16px] font-dm-sans text-[#2F2F2F] font-regular">
                    {formData.dataBundle?.size} •{" "}
                    {formData.dataBundle?.validity}
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
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`w-6 h-6 rounded-full ${selectedNetwork?.color}`}
                    />
                    <span className="text-[16px] font-dm-sans text-[#2F2F2F] font-regular">
                      {selectedNetwork?.label}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setStep(3)}
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6"
              >
                Make Payment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="mt-8"
              >
                <ChevronLeft className="w-4  mr-2" /> Back
              </Button>
            </div>
          )}

          {/* Step 3 - PIN Entry */}
          {step === 3 && (
            <div className="space-y-8 mt-3">
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                To proceed with this transaction, please enter your PIN
              </p>

              {/* PIN Display Boxes with blinking cursor */}
              <div className="flex gap-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="relative">
                    {/* Display box */}
                    <div
                      className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-[16px] font-medium transition-all relative ${
                        watch("pin")?.[index]
                          ? "border-[#0A6DC0] bg-[#0A6DC01A]"
                          : "border-[#D8D8D866] bg-[#F9F9F9]"
                      } ${
                        // Highlight the current empty box
                        watch("pin")?.length === index
                          ? "!border-[#0A6DC0] !bg-white"
                          : ""
                      }`}
                    >
                      {watch("pin")?.[index] || ""}

                      {/* Blinking cursor - only show on current empty box */}
                      {watch("pin")?.length === index &&
                        !watch("pin")?.[index] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[2px] h-4 bg-[#0A6DC0] animate-blink" />
                          </div>
                        )}
                    </div>

                    {/* Hidden input for capturing keystrokes */}
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

                        // Auto-focus next input
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
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      onBlur={() => {
                        // Optional: You can add blur effects here
                      }}
                      id={`pin-input-${index}`}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                      autoFocus={index === 0}
                      ref={index === 0 ? pinInputRef : null}
                    />
                  </div>
                ))}
              </div>

              {/* Add CSS for blinking animation */}
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
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] font-dm-sans py-6"
              >
                Make Payment
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="mt-8"
              >
                <ChevronLeft className="w-4  mr-2" /> Back
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
              Data Purchased Successfully
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans text-center">
              Your {formData.dataBundle?.size} data bundle has been sent to{" "}
              {formData.phoneNumber}
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
