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

import { ChevronDown, EyeOff, Eye } from "lucide-react";
import Lottie from "lottie-react";

const networks = [
  { id: "mtn", label: "MTN", color: "bg-yellow-400" },
  { id: "airtel", label: "Airtel", color: "bg-red-500" },
  { id: "glo", label: "Glo", color: "bg-green-600" },
  { id: "9mobile", label: "9mobile", color: "bg-green-700" },
] as const;

const amounts = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimeFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<Partial<AirtimeFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [openNetwork, setOpenNetwork] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const router = useRouter();
  const pinInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AirtimeFormData>({
    resolver: zodResolver(airtimeSchema),
    defaultValues: {
      utilityType: "airtime",
      phoneNumber: "",
      network: "mtn",
      amount: 100,
      pin: "",
    },
  });

  const { handleSubmit, setValue, watch, getValues } = form;
  const selectedNetwork = networks.find((n) => n.id === watch("network"));

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
            Airtime
          </h2>
          <Separator
            orientation="horizontal"
            className="h-[1px]"
            style={{ background: "#E0E0E0" }}
          />
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6 mt-3">
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                Buy Airtime with your Vendcliq Account
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

              {/* Amount */}
              <div>
                <Label>Airtime Amount (₦)</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                  {amounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setValue("amount", amt);
                      }}
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
                  {...form.register("amount", {
                    valueAsNumber: true,
                  })}
                  placeholder="Enter amount"
                  className="mt-4 bg-[#F9F9F9] border border-[#D8D8D866] py-6"
                  onChange={(e) => {
                    const value = e.target.value;
                    // Ensure we always set a number, not undefined
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
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 "
              >
                Proceed
              </Button>
            </div>
          )}
          {/* Step 2 - Confirm */}
          {step === 2 && formData && (
            <div className="space-y-8  mt-3">
              <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                Confirm this purchase before you input PIN
              </p>
              <div className="bg-[url('/balance-bg.svg')] bg-cover bg-no-repeat bg-center  h-[100px] rounded-2xl p-6">
                <div className="space-y-3">
                  <div className=" flex items-center gap-2">
                    <p className="text-white font-dm-sans font-regular text-[14px]">
                      {" "}
                      Wallet Balance
                    </p>{" "}
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

              <div className="space-y-6">
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
                className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 "
              >
                Make Payment
              </Button>
            </div>
          )}
          {/* Step 3 - PIN */}
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
            </div>
          )}{" "}
        </Card>
      </form>

      {/* Success Modal */}

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="text-center w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] ">
          <AlertDialogHeader>
            <Lottie
              animationData={animationData}
              loop={true}
              className="w-64 h-64 mx-auto drop-shadow-lg"
            />
            <AlertDialogTitle className="text-center text-[#2F2F2F] text-[20px] md:text-[25px] font-semibold font-clash">
              {" "}
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
              {" "}
              Back to Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
