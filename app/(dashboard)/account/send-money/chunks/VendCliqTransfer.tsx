/* eslint-disable @typescript-eslint/no-unused-vars */
// components/VendCliqTransfer.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Landmark, MoveRight, MoveLeft } from "lucide-react";

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
import { lookupAccount } from "@/actions/getAccountNumber";
import { ClipLoader } from "react-spinners";
import {
  handleValidatePin,
  handleVendCliqTransfer,
} from "@/lib/utils/api/apiHelper";
import { generateTransactionKey } from "@/lib/utils/generateTransactionKey";
import Lottie from "lottie-react";
import animationData from "@/public/animate.json";
import CreatePinPrompt from "@/components/SetPinModal";
import { useWallet } from "@/hooks/useWallet";

export default function VendCliqTransfer() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showBalance, setShowBallance] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [accountNumberInput, setAccountNumberInput] = useState("");
  const [accountInfo, setAccountInfo] = useState<{
    accountName: string;
    provider: string;
  } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const router = useRouter();
  const [isTransferring, setIsTransferring] = useState(false);

  const {  refreshWallet, getBalance, getAccountNumber } = useWallet();

  const fee = 3;

  const form = useForm<TransferFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transferSchema) as any,
    defaultValues: {
      beneficiaryType: "saved",
      savedBeneficiaryIndex: undefined,
      bank: "",
      accountNumber: "",
      accountName: "",
      amount: 0,
      narration: "",
      pin: "",
    },
  });

  const { watch, setValue, trigger } = form;
  const pin = watch("pin");

  const handleStep2 = async () => {
    const amount = watch("amount");
    const narration = watch("narration");

    // First trigger the amount validation from schema
    const amountValid = await trigger("amount");
    if (!amountValid) return;

    // Validate amount for zeros only (0, 00, 000, etc.)
    if (
      amount.toString().replace(/[^0-9]/g, "") === "" ||
      amount
        .toString()
        .replace(/[^0-9]/g, "")
        .match(/^0+$/)
    ) {
      toast.error("Amount cannot be zero or contain only zeros");
      return;
    }

    if (!narration || narration.trim() === "") {
      toast.error("Please enter a narration");
      return;
    }

    if (narration.trim().length < 2) {
      toast.error("Narration is too short (minimum 2 characters)");
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!pin || pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    if (!accountInfo) {
      toast.error("Please resolve the beneficiary account first");
      return;
    }

    const amount = watch("amount");
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsTransferring(true);

    try {
      const validateRes = await handleValidatePin({ pin });

      if (validateRes.status !== "success" || !validateRes.data?.validated) {
        toast.error(validateRes.msg || "Invalid PIN");
        setIsTransferring(false);
        return;
      }

      const pinToken = validateRes.data.pinToken;

      const transactionKey = await generateTransactionKey();

      const sourceAccountNumber = getAccountNumber("WEMA");
      if (!sourceAccountNumber) {
        toast.error("Your wallet account number not found");
        setIsTransferring(false);
        return;
      }

      const payload = {
        transactionKey,
        amount: Number(amount), 
        beneficiaryAccountNumber: accountNumberInput,
        beneficiaryAccountName: accountInfo.accountName,
        beneficiaryProvider: accountInfo.provider,
        narration: watch("narration") || "",
        sourceAccountNumber,
        pinToken,
        deviceFingerprint: `web-${Date.now()}-${Math.random()}`,
        ipAddress: "0.0.0.0",
      };

      const transferRes = await handleVendCliqTransfer(payload);

      if (transferRes.status === "success") {
        await refreshWallet();
        setShowSuccess(true);
      } else {
        toast.error(transferRes.msg || "Transfer failed");
      }
    } catch (err) {
      const errorMessage =
        (err as Record<string, unknown>)?.msg ||
        "An error occurred. Please try again.";
      toast.error(String(errorMessage));
      console.error("Transfer error:", err);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="">
      <Form {...form}>
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg bg-white ">
          <div className="flex justify-between mb-2">
            <h2 className="text-[16px] text-[#2F2F2F] font-semibold font-clash ">
              Vendcliq Transfer
            </h2>
            <CreatePinPrompt />
          </div>
          <Separator
            orientation="horizontal"
            className="h-[1px]"
            style={{ background: "#E0E0E0" }}
          />
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 1 */}
            {step === 1 && (
              <>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium mt-3 mb-6">
                  Enter the Vendcliq account number of recipient to continue
                  transfer
                </p>

                <div className="space-y-4">
                  <Input
                    placeholder="Enter account number"
                    className="h-[55px]"
                    value={accountNumberInput}
                    onChange={async (e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setAccountNumberInput(value);

                      setAccountInfo(null);
                      setLookupError(null);

                      if (value.length === 10) {
                        setIsLookingUp(true);

                        const token =
                          localStorage.getItem("accessToken") ||
                          localStorage.getItem("authToken");
                        if (!token) {
                          setLookupError(
                            "Session expired. Please log in again.",
                          );
                          setIsLookingUp(false);
                          return;
                        }

                        const result = await lookupAccount(value, token);

                        if (result.success && result.data) {
                          setAccountInfo(result.data);
                        } else {
                          setLookupError(result.error);
                        }

                        setIsLookingUp(false);
                      }
                    }}
                    maxLength={10}
                    type="text"
                    inputMode="numeric"
                  />

                  {/* Loading */}
                  {isLookingUp && (
                    <div className="text-[#0A6DC0] flex items-center gap-2">
                      Verifying Account Number...
                      <ClipLoader size={20} color="#0A6DC0" />
                    </div>
                  )}

                  {/* Success: Show name + bank — Clickable to go to Step 2 */}
                  {accountInfo && (
                    <div
                      onClick={() => setStep(2)}
                      className="hover:bg-[#0A6DC012] p-2 rounded-md space-y-1 cursor-pointer transition-all select-none"
                    >
                      <p className="flex items-center gap-5 font-medium text-[#2F2F2F] text-[16px] font-dm-sans">
                        {accountInfo.accountName}{" "}
                        <MoveRight className="text-[#0A6DC0]" />
                      </p>
                      <p className="text-[13px] font-dm-sans font-medium text-[#9E9A9A]">
                        {accountInfo.provider} BANK
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {lookupError && !isLookingUp && (
                    <p className="text-sm text-red-600">{lookupError}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} className="mt-4">
                  <MoveLeft />
                </button>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                  Enter Amount to transfer and click on the proceed button to
                  confirm transfer
                </p>

                <div className="bg-[url('/balance-bg.svg')] my-6 bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-4">
                          <h1 className="font-bold font-dm-sans font-regular text-[13px] text-white">
                            Wallet Balance
                          </h1>
                          <button
                            type="button"
                            onClick={() => setShowBallance(!showBalance)}
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
                            * * * *
                          </h1>
                        ) : (
                          <h1 className="font-clash text-white text-[20px] font-semibold">
                            ₦ {getBalance() || "0.00"}
                          </h1>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Landmark color="#9E9A9A" />

                  <div>
                    <p className="font-medium text-[#2F2F2F] font-dm-sans">
                      {accountInfo?.accountName}
                    </p>
                    <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                      {accountNumberInput}
                    </p>
                    <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                      {accountInfo?.provider} BANK
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
                            
                            placeholder="Enter amount"
                            className="h-[55px]"
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
                        <FormLabel>Narration</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Goods payment"
                            {...field}
                            className="h-[55px]"
                            onBlur={(e) => {
                              // Validate on blur
                              if (e.target.value.trim() === "") {
                                toast.error("Narration is required");
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
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
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <button onClick={() => setStep(2)} className="mt-4">
                  <MoveLeft />
                </button>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium ">
                  Confirm the information below is correct and click the proceed
                  button to enter transaction pin
                </p>
                <div className="gap-y-2 md:gap-y-4 text-left mt-5 grid grid-cols-2 gap-x-5 md:gap-x-0">
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Account Name
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      {accountInfo?.accountName}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Account No
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      {accountNumberInput}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Bank
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      {accountInfo?.provider} BANK
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Transfer amount
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      ₦{Number(watch("amount") || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Fee amount
                    </h2>
                    <p className="text-[13px] md:text-[16px]">₦{fee}</p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Total amount
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      ₦{(Number(watch("amount") || 0) + fee).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Narration:
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      {watch("narration") || "None"}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Destination
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      Vendcliq Account
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] my-4 py-6"
                >
                  Proceed
                </Button>
              </>
            )}

            {/* Step 4 - PIN Entry */}
            {step === 4 && (
              <div className="md:mt-8">
                <button onClick={() => setStep(3)} className="mt-4">
                  <MoveLeft />
                </button>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                  Enter your transaction PIN to confirm transaction{" "}
                </p>
                <h1 className="font-dm-sans text-[#1E1E1E] text-[16px] mt-4">
                  Enter Pin
                </h1>
                <div className="flex gap-4 mb-4 mt-2">
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
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-5 md:py-6 "
                  disabled={isTransferring}
                >
                  {isTransferring ? (
                    <>
                      <ClipLoader size={20} color="white" className="mr-2" />
                      Sending Money...
                    </>
                  ) : (
                    "Send Money"
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </Form>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="text-center w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] p-8">
          <AlertDialogHeader className="">
            <Lottie
              animationData={animationData}
              loop={true}
              className="w-40 md:w-64 md:h-64 mx-auto drop-shadow-lg"
            />
            <div className="">
              <AlertDialogTitle className="text-center text-[#2F2F2F] text-[20px] md:text-[28px] font-bold font-clash">
                🎉 Transfer Successful! 🎉
              </AlertDialogTitle>

              <AlertDialogDescription className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans text-center">
                <p>You have successfully sent</p>
                <p className="text-[22px] md:text-[28px] font-bold text-[#0A6DC0]">
                  ₦{(Number(watch("amount") || 0) + fee).toLocaleString()}
                </p>
                <p className="text-sm text-[#9E9A9A] mt-2">
                  (Amount: ₦{Number(watch("amount") || 0).toLocaleString()} +
                  Fee: ₦{fee})
                </p>
                <p>to</p>
                <p className="text-[14px] md:text-[16px] text-[#2F2F2F] font-bold">
                  {accountInfo?.accountName}
                </p>
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-8">
            <AlertDialogAction
              className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 text-lg font-medium"
              onClick={() => router.push("/account/overview")}
            >
              OK
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
