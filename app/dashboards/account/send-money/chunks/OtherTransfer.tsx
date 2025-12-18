/* eslint-disable @typescript-eslint/no-unused-vars */
// components/OtherBankTransfer.tsx
"use client";

import { useState } from "react";
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
import { ChevronLeft, Banknote, Eye, EyeOff, Landmark } from "lucide-react";

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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { transferSchema, TransferFormData } from "@/types/transfer";
import { Separator } from "@/components/ui/separator";

const beneficiaries = [
  {
    name: "Shotayo Samson Olumide",
    accountNo: "2764758697",
    bank: "United Bank for Africa",
  },
  {
    name: "Shotayo Samson Olumide",
    accountNo: "2764758697",
    bank: "United Bank for Africa",
  },
  {
    name: "Shotayo Samson Olumide",
    accountNo: "2764758697",
    bank: "United Bank for Africa",
  },
];

export default function OtherBankTransfer() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showBalance, setShowBalance] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const [showAccount, setShowAccount] = useState(false);

  const form = useForm<TransferFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transferSchema) as any,
    defaultValues: {
      beneficiaryType: "saved",
      savedBeneficiaryIndex: undefined,
      bank: "",
      accountNumber: "",
      accountName: "Shotayo Samson Olumide",
      amount: 100,
      narration: "",
      pin: "",
    },
  });

  const { watch, setValue, trigger } = form;
  const beneficiaryType = watch("beneficiaryType");
  const savedIndex = watch("savedBeneficiaryIndex");
  const pin = watch("pin");

  const selectedBeneficiary =
    beneficiaryType === "saved" && savedIndex !== undefined
      ? beneficiaries[savedIndex]
      : null;

  const handleStep1 = async () => {
    const fields: (keyof TransferFormData)[] = ["beneficiaryType"];
    if (beneficiaryType === "new")
      fields.push("accountName", "bank", "accountNumber");
    else if (savedIndex === undefined) {
      toast.error("Please select a beneficiary");
      return;
    }
    const valid = await trigger(fields);
    if (valid) setStep(2);
  };

  const handleStep2 = async () => {
    const valid = await trigger("amount");
    if (valid) setStep(3);
  };

  // Handle final submission - bypassing form validation
  const handleFinalSubmit = () => {
    if (!pin || pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    // toast.success("Transfer completed successfully!");
    setShowSuccess(true);
  };

  return (
    <div className="">
      <Form {...form}>
        <Card className="p-6">
          <h2 className="text-[16px] text-[#2F2F2F] font-semibold font-clash mb-2">
            Other Bank Transfer
          </h2>
          <Separator
            orientation="horizontal"
            className="h-[1px]"
            style={{ background: "#E0E0E0" }}
          />
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 1 */}
            {step === 1 && (
              <>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium mt-3">
                  Select from the list of beneficiary or add a new account
                </p>

                <div className="flex flex-col my-6 gap-4">
                  <Button
                    type="button"
                    variant={
                      beneficiaryType === "saved" ? "default" : "outline"
                    }
                    onClick={() => setValue("beneficiaryType", "saved")}
                    className={`font-medium hover:bg-[#0A6DC012] ${
                      beneficiaryType === "saved"
                        ? " bg-[#cbdff5] text-[#2F2F2F] hover:bg-[#cbdff5]"
                        : "bg-white border border-[#E3E3E3] text-[#9E9A9A]"
                    }`}
                  >
                    Select from Beneficiary ({beneficiaries.length}/5)
                  </Button>
                  <Button
                    type="button"
                    variant={beneficiaryType === "new" ? "default" : "outline"}
                    onClick={() => setValue("beneficiaryType", "new")}
                    className={`font-medium hover:bg-[#0A6DC012] ${
                      beneficiaryType === "new"
                        ? " bg-[#cbdff5] text-[#2F2F2F] hover:bg-[#cbdff5]"
                        : "bg-white border border-[#E3E3E3] text-[#9E9A9A]"
                    }`}
                  >
                    Add a new account to Beneficiary
                  </Button>
                </div>

                {beneficiaryType === "saved" ? (
                  <div className="space-y-5">
                    {beneficiaries.map((ben, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setValue("savedBeneficiaryIndex", i)}
                        className={`w-full border-b p-2 border-[#E0E0E0] text-left flex items-center gap-4 transition-all ${
                          savedIndex === i
                            ? " bg-[#0A6DC01A]"
                            : "border-gray-300"
                        }`}
                      >
                        <Landmark color="#9E9A9A" />
                        <div>
                          <p className="font-medium text-[#2F2F2F] font-dm-sans">
                            {ben.name}
                          </p>
                          <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                            {ben.accountNo}
                          </p>
                          <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                            {ben.bank}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 pb-3">
                    <FormField
                      control={form.control}
                      name="bank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="10 digits" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="text-[#0A6DC0] font-dm-sans font-bold text-[16px]">
                      Shotayo Samson Olumide
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleStep1}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 mt-7"
                >
                  Proceed
                </Button>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium mt-3">
                  Enter Amount to transfer and click on the proceed button to
                  confirm transfer
                </p>

                <div className="bg-[url('/balance-bg.svg')] my-6 bg-cover bg-no-repeat bg-center  h-[100px] rounded-2xl p-6">
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

                <div className="flex items-center gap-4 mb-4">
                  <Landmark color="#9E9A9A" />

                  <div>
                    <p className="font-medium text-[#2F2F2F] font-dm-sans">
                      {selectedBeneficiary?.name || "Shotayo Samson Olumide"}
                    </p>
                    <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                      {selectedBeneficiary?.accountNo ||
                        form.getValues("accountNumber")}
                    </p>
                    <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                      {selectedBeneficiary?.bank}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="narration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Narration (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Goods payment" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleStep2}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 mt-6"
                >
                  Proceed to Confirm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="mt-8"
                >
                  <ChevronLeft className="w-4  mr-2" /> Back
                </Button>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium mt-3">
                  Confirm the information below is correct and click the proceed
                  button to enter transaction` pin
                </p>
                <div className="space-y-4 text-left mt-5">
                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Account Name
                    </h2>{" "}
                    {selectedBeneficiary?.name || "Shotayo Samson Olumide"}
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Account No
                    </h2>{" "}
                    {selectedBeneficiary?.accountNo ||
                      form.getValues("accountNumber")}
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Bank
                    </h2>{" "}
                    {selectedBeneficiary?.bank || form.getValues("bank")}
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Transfer amount
                    </h2>{" "}
                    ₦{watch("amount")?.toLocaleString()}
                  </div>

                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Narration:
                    </h2>{" "}
                    {watch("narration") || "None"}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] my-4 py-6"
                >
                  Proceed
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="mt-8"
                >
                  <ChevronLeft className="w-4  mr-2" /> Back
                </Button>
              </>
            )}

            {/* Step 4 - PIN Entry */}
            {step === 4 && (
              <div className="mt-8">
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                  To proceed with this transaction, please enter your PIN
                </p>

                <div className="flex gap-4 my-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <div
                        className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-[16px] font-medium transition-all relative ${
                          pin?.[index]
                            ? "border-[#0A6DC0] bg-[#0A6DC01A]"
                            : "border-[#D8D8D866] bg-[#F9F9F9]"
                        } ${
                          pin?.length === index
                            ? "!border-[#0A6DC0] !bg-white"
                            : ""
                        }`}
                      >
                        {pin?.[index] || ""}
                        {pin?.length === index && !pin?.[index] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[2px] h-4 bg-[#0A6DC0] animate-blink" />
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={pin?.[index] || ""}
                        onChange={(e) => {
                          const digit = e.target.value.replace(/\D/g, "");
                          if (digit || e.target.value === "") {
                            const newPin = (pin || "").split("");
                            newPin[index] = digit;
                            setValue("pin", newPin.join("").slice(0, 4));
                            if (digit && index < 3) {
                              document
                                .getElementById(`pin-${index + 1}`)
                                ?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            !pin?.[index] &&
                            index > 0
                          ) {
                            e.preventDefault();
                            document
                              .getElementById(`pin-${index - 1}`)
                              ?.focus();
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        id={`pin-${index}`}
                        className="absolute inset-0 opacity-0 cursor-default"
                        autoFocus={index === 0}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 text-lg font-medium"
                  disabled={pin?.length !== 4}
                >
                  {pin?.length === 4
                    ? "Send Money"
                    : `Enter PIN (${pin?.length || 0}/4)`}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="mt-8"
                >
                  <ChevronLeft className="w-4  mr-2" /> Back
                </Button>
              </div>
            )}
          </form>
        </Card>
      </Form>

      {/* Success Modal */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="text-center w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] ">
          <AlertDialogHeader>
            <Lottie
              animationData={animationData}
              loop
              className="w-64 h-64 mx-auto"
            />
            <AlertDialogTitle className="text-center text-[#2F2F2F] text-[20px] md:text-[25px] font-semibold font-clash">
              Transfer Successful!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans text-center">
              ₦{watch("amount")?.toLocaleString()} has been sent successfully
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
              onClick={() => router.push("/dashboards/account/overview")}
            >
              Back to Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Blink Animation */}
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
    </div>
  );
}
