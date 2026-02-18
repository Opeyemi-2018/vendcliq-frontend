/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff, Check, MoveLeft } from "lucide-react";
import { toast } from "sonner";
import { DisplayPlan } from "@/types/plans";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { handlePaySubscription } from "@/lib/utils/api/apiHelper";
import { SubscriptionPaymentPayload } from "@/types/plans";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

interface PaymentInfoProps {
  plan: DisplayPlan;
  isAnnual: boolean;
  months: number;
  onBack: () => void;
}

type PaymentMethod = "WALLET" | "TRANSFER";

interface TransferDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: number;
  reference: string;
  expiresAt?: string;
}

const PaymentInfo: React.FC<PaymentInfoProps> = ({
  plan,
  isAnnual,
  months,
  onBack,
}) => {
  const totalAmount =
    (isAnnual ? plan.annualPrice : plan.monthlyPrice) * months;
  const router = useRouter();

  const { getBalance } = useWallet();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("WALLET");
  const [transactionPin, setTransactionPin] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferDetails, setTransferDetails] =
    useState<TransferDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);

    const payload: SubscriptionPaymentPayload = {
      planId: Number(plan.id),
      billingType: isAnnual ? "yearly" : "monthly",
      multiplier: months,
      paymentType: paymentMethod,
      ...(paymentMethod === "WALLET" && { transactionPin }),
    };

    try {
      const response = await handlePaySubscription(payload);

      if (
        (response.statusCode === 200 || response.statusCode === 201) &&
        response.data
      ) {
        toast.success("Subscription request successful!");

        if (paymentMethod === "WALLET") {
          setShowPinModal(false);
          setTransactionPin("");
          toast.success("Payment completed! Your plan is now active.");
          router.push("/payment-subscription");
        } else {
          const payData = response.data.paymentPayload;

          setTransferDetails({
            accountNumber: payData.accountNumber || "N/A",
            accountName: payData.accountName || "N/A",
            bankName: payData.bankName || "N/A",
            amount: totalAmount,
            reference: payData.paymentReference || "N/A",
            expiresAt: payData.expiresAt,
          });

          setShowTransferDialog(true);
        }
      } else {
        toast.error(
          response.error ||
            (response.data && "message" in response.data
              ? (response.data as any).message
              : "Failed to process subscription"),
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Payment failed. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  const handleTransferConfirmed = () => {
    setShowTransferDialog(false);
    toast.success("Thank you! We'll confirm your payment shortly.");
    router.push("/subscription");
  };

  const handleTransferNotYet = () => {
    setShowTransferDialog(false);
    toast.info("You can complete the payment later.");
  };

  return (
    <div className="">
      <div>
        <h1 className="font-semibold font-clash text-[20px] md:text-[25px]">
          Mode of Payment
        </h1>
        <p className="font-dm-sans text-[#9E9A9A] font-medium">
          How would you like to pay for this subscription?
        </p>
      </div>

      <Button
        onClick={onBack}
        variant="ghost"
        className="rounded-full p-2 hover:bg-gray-100 hover:text-[#0A6DC0]"
      >
        <MoveLeft size={25} />
      </Button>

      <div className="flex flex-col lg:flex-row gap-8 ">
        {/* Desktop payment selector */}
        <div className="lg:p-6 lg:w-[35%] md:p-6 lg:border border-[#E4E4E4] rounded-lg bg-white hidden lg:block">
          <h1 className="font-semibold font-clash mb-4">Mode of Payment</h1>
          <Separator className="mb-6 hidden md:block" />
          <div className="space-y-6 mt-6">
            <Label
              onClick={() => setPaymentMethod("WALLET")}
              className={`flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${
                paymentMethod === "WALLET"
                  ? "border-[#0A6DC012] bg-[#0A6DC012]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex-1">
                <h3
                  className={`text-[16px] font-dm-sans font-medium ${
                    paymentMethod === "WALLET"
                      ? "text-[#2F2F2F]"
                      : "text-[#9E9A9A]"
                  }`}
                >
                  Cliq Wallet
                </h3>
              </div>
              <div className="flex-shrink-0">
                {paymentMethod === "WALLET" ? (
                  <Image
                    src="/checkbox.svg"
                    alt="selected"
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src="/border.svg"
                    alt="unselected"
                    width={16}
                    height={16}
                  />
                )}
              </div>
            </Label>

            <Label
              onClick={() => setPaymentMethod("TRANSFER")}
              className={`flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${
                paymentMethod === "TRANSFER"
                  ? "border-[#0A6DC012] bg-[#0A6DC012]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex-1">
                <h3
                  className={`text-[16px] font-dm-sans font-medium ${
                    paymentMethod === "TRANSFER"
                      ? "text-[#2F2F2F]"
                      : "text-[#9E9A9A]"
                  }`}
                >
                  Bank Transfer
                </h3>
              </div>
              <div className="flex-shrink-0">
                {paymentMethod === "TRANSFER" ? (
                  <Image
                    src="/checkbox.svg"
                    alt="selected"
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src="/border.svg"
                    alt="unselected"
                    width={16}
                    height={16}
                  />
                )}
              </div>
            </Label>
          </div>
        </div>

        {/* Mobile payment selector */}
        <div className="lg:hidden flex gap-2 bg-[#ECECF080] p-1 rounded-lg">
          <button
            onClick={() => setPaymentMethod("WALLET")}
            className={`flex-1 py-3 rounded-lg font-dm-sans font-medium text-[14px] transition-all ${
              paymentMethod === "WALLET"
                ? "bg-[#0A6DC0] text-white"
                : "text-[#9E9A9A]"
            }`}
          >
            Cliq Wallet
          </button>
          <button
            onClick={() => setPaymentMethod("TRANSFER")}
            className={`flex-1 py-3 rounded-lg font-dm-sans font-medium text-[14px] transition-all ${
              paymentMethod === "TRANSFER"
                ? "bg-[#0A6DC0] text-white"
                : "text-[#9E9A9A]"
            }`}
          >
            Bank Transfer
          </button>
        </div>

        {/* Summary & Pay Button */}
        <div className="md:p-6 lg:w-[65%]  lg:border border-[#E4E4E4] rounded-lg bg-white">
          <h1 className="font-semibold font-clash mb-2">Summary</h1>
          <Separator className="mb-4" />
          <p className="font-dm-sans text-[#9E9A9A] mb-6">
            Here is your subscription summary
          </p>

          {paymentMethod === "WALLET" && (
            <div className="mb-8">
              <p className="text-[#2F2F2F] font-dm-sans mb-3">Wallet Balance</p>
              <div className="bg-[url('/balance-bg.svg')] bg-cover bg-no-repeat h-[120px] rounded-2xl p-6 flex items-center">
                <div className="text-white">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-medium">Wallet Balance</h3>
                    <button onClick={() => setShowBalance(!showBalance)}>
                      {showBalance ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                  <h1 className="text-3xl font-bold font-clash">
                    {showBalance
                      ? "****"
                      : `₦${(getBalance() ?? 0).toLocaleString()}`}{" "}
                    {/* ← only change */}
                  </h1>
                </div>
              </div>
            </div>
          )}

          <div className="text-[#2F2F2F] font-dm-sans flex justify-between mb-6">
            <div>
              <p className="font-bold text-[16px]">Plan</p>
              <p className="font-regular text-[16px]">{plan.name}</p>
            </div>
            <div>
              <p className="font-bold text-[16px]">Amount</p>
              <p className="font-regular text-[16px]">
                ₦{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <p className="font-dm-sans text-[16px] mb-6">
            {paymentMethod === "WALLET"
              ? "This amount will be deducted from your wallet."
              : "Please transfer the exact amount to the account details we will provide."}
          </p>

          <Button
            onClick={() => {
              if (paymentMethod === "WALLET") {
                setShowPinModal(true);
              } else {
                handlePay();
              }
            }}
            disabled={paying}
            className="bg-[#0A6DC0] hover:bg-[#09599a] md:py-5 py-6 w-full"
          >
            {paying ? "Processing..." : "Proceed with Payment"}
          </Button>
        </div>
      </div>

      {/* PIN Modal for Wallet */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-md rounded-[13px] bg-white">
          <DialogHeader>
            <DialogTitle className="font-clash text-[20px]">
              Enter Transaction PIN
            </DialogTitle>
            <DialogDescription className="text-[#9E9A9A] font-dm-sans text-[14px] md:text-[16px]">
              Provide your PIN to complete the subscription payment.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-4 mb-6 mt-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative">
                <div
                  className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-medium transition-all ${
                    transactionPin?.[index]
                      ? "border-[#0A6DC0] bg-[#0A6DC01A]"
                      : "border-[#D8D8D866] bg-[#F9F9F9]"
                  } ${
                    transactionPin?.length === index
                      ? "!border-[#0A6DC0] !bg-white"
                      : ""
                  }`}
                >
                  {transactionPin?.[index] || ""}
                  {transactionPin?.length === index &&
                    !transactionPin?.[index] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[2px] h-4 bg-[#0A6DC0] animate-blink" />
                      </div>
                    )}
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={transactionPin?.[index] || ""}
                  onChange={(e) => {
                    const digit = e.target.value.replace(/\D/g, "");
                    if (digit || e.target.value === "") {
                      const newPin = transactionPin.split("");
                      newPin[index] = digit;
                      setTransactionPin(newPin.join("").slice(0, 4));

                      if (digit && index < 3) {
                        pinRefs.current[index + 1]?.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Backspace" &&
                      !transactionPin[index] &&
                      index > 0
                    ) {
                      pinRefs.current[index - 1]?.focus();
                    }
                  }}
                  ref={(el) => {
                    pinRefs.current[index] = el;
                  }}
                  id={`pin-${index}`}
                  className="absolute inset-0 opacity-0"
                />
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
            disabled={paying || transactionPin.length !== 4}
            onClick={handlePay}
          >
            {paying ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Transfer Details Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-clash">
              Bank Transfer Details
            </DialogTitle>
            <DialogDescription>
              Please transfer the exact amount below to the account provided.
            </DialogDescription>
          </DialogHeader>

          {transferDetails && (
            <div className="space-y-4 mt-4">
              {/* Show the correct total amount */}
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Amount to Transfer</p>
                <p className="font-bold text-xl text-[#0A6DC0]">
                  ₦{totalAmount.toLocaleString()}
                </p>
              </div>

              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2 flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-medium">{transferDetails.accountNumber}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(transferDetails.accountNumber, "account")
                  }
                >
                  {copiedField === "account" ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>

              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2 flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Account Name</p>
                  <p className="font-medium">{transferDetails.accountName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(transferDetails.accountName, "name")
                  }
                >
                  {copiedField === "name" ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>

              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2">
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-medium">{transferDetails.bankName}</p>
              </div>

              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2 flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Payment Reference</p>
                  <p className="font-mono text-sm break-all">
                    {transferDetails.reference}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(transferDetails.reference, "ref")
                  }
                >
                  {copiedField === "ref" ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>

              {transferDetails.expiresAt && (
                <p className="text-sm text-amber-600">
                  Please complete before:{" "}
                  {new Date(transferDetails.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <Button variant="outline" onClick={handleTransferNotYet}>
              I haven&apos;t sent it yet
            </Button>
            <Button
              onClick={handleTransferConfirmed}
              className="bg-[#0A6DC0] hover:bg-[#085a9e]"
            >
              I have sent the money
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentInfo;
