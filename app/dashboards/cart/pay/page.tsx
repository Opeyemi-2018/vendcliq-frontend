"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Copy, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
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
import { handlePayInvoice } from "@/lib/utils/api/apiHelper";
import { useUser } from "@/context/userContext";
import { toast } from "sonner";

interface CheckoutData {
  invoiceId: string;
  total: number;
  cost: number;
  quantity: number;
  itemsCount: number;
}

type PaymentMethod = "WALLET" | "TRANSFER";

interface TransferDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  expectedAmount: number;
  paymentReference: string;
  expiresAt: string;
}

const PayPage = () => {
  const router = useRouter();
  const { wallet } = useUser();

  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("WALLET");
  const [transactionPin, setTransactionPin] = useState("");
  const [narration, setNarration] = useState("");
  const [showBalance, setShowBalance] = useState(true);

  // Dialog states
  const [showWalletSuccess, setShowWalletSuccess] = useState(false);
  const [transferDetails, setTransferDetails] =
    useState<TransferDetails | null>(null);
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Refs for PIN inputs
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem("checkoutData");
    if (storedData) {
      try {
        const data = JSON.parse(storedData) as CheckoutData;
        setCheckoutData(data);
      } catch {
        toast.error("Invalid checkout data");
        router.back();
      }
    } else {
      toast.error("No checkout data found");
      router.back();
    }
    setLoading(false);
  }, [router]);

  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "");
    if (digit || value === "") {
      const newPin = transactionPin.split("");
      newPin[index] = digit;
      const updatedPin = newPin.join("").slice(0, 4);
      setTransactionPin(updatedPin);

      if (digit && index < 3) {
        pinRefs.current[index + 1]?.focus();
      } else if (value === "" && index > 0) {
        pinRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePinKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !transactionPin[index] && index > 0) {
      e.preventDefault();
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePay = async () => {
    if (!checkoutData) return;

    if (paymentMethod === "WALLET" && transactionPin.length !== 4) {
      toast.error("Please enter your 4-digit transaction PIN");
      return;
    }

    try {
      setPaying(true);

      const payload: any = {
        paymentType: paymentMethod,
        narration: narration || "",
      };

      if (paymentMethod === "WALLET") {
        payload.transactionPin = transactionPin;
      }

      const response = await handlePayInvoice(checkoutData.invoiceId, payload);

      if (response.statusCode === 200 && response.data) {
        if (paymentMethod === "WALLET") {
          setShowWalletSuccess(true);
          localStorage.removeItem("checkoutData");
        } else if (paymentMethod === "TRANSFER") {
          const payLoad = response.data.paymentPayload;
          if (payLoad) {
            setTransferDetails({
              accountNumber: payLoad.accountNumber,
              accountName: payLoad.accountName,
              bankName: payLoad.bankName,
              expectedAmount: payLoad.expectedAmount,
              paymentReference: payLoad.paymentReference,
              expiresAt: payLoad.expiresAt,
            });
            setShowTransferDialog(true);
          }
        }
      } else {
        toast.error(response.error || "Payment initialization failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const handleTransferSent = () => {
    setShowTransferDialog(false);
    toast.success("Thank you! We’ll confirm your payment shortly.");
    localStorage.removeItem("checkoutData");
    router.push("/dashboards/market-place");
  };

  const handleTransferNotSent = () => {
    setShowTransferDialog(false);
    toast.info("You can come back anytime to complete the payment.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading checkout...</div>
      </div>
    );
  }

  if (!checkoutData) return null;

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Cart</span>
      </button>

      <div>
        <h1 className="font-semibold font-clash text-[20px] md:text-[25px]">
          Mode of Payment
        </h1>
        <p className="font-dm-sans text-[#9E9A9A] font-medium">
          How would you like to pay for this order?
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Left: Payment Method */}
        <Card className="p-3 md:p-6 lg:w-[35%] bg-white">
          <h1 className="font-semibold font-clash mb-4">Mode of Payment</h1>
          <Separator className="mb-6" />

          <div
            onClick={() => setPaymentMethod("WALLET")}
            className={`p-4 rounded-lg border cursor-pointer transition mb-4 ${
              paymentMethod === "WALLET"
                ? "border-[#0A6DC0] bg-[#0A6DC012]"
                : "border-gray-200"
            }`}
          >
            <h3 className="font-medium font-dm-sans">Cliq Wallet</h3>
          </div>

          <div
            onClick={() => {
              setPaymentMethod("TRANSFER");
              // setTransferDetails(null);
            }}
            className={`p-4 rounded-lg border cursor-pointer transition ${
              paymentMethod === "TRANSFER"
                ? "border-[#0A6DC0] bg-[#0A6DC012]"
                : "border-gray-200"
            }`}
          >
            <h3 className="font-medium font-dm-sans">Bank Transfer</h3>
          </div>
        </Card>

        {/* Right: Summary & Form */}
        <Card className="p-3 md:p-6 lg:w-[65%] bg-white">
          <h1 className="font-semibold font-clash mb-2">Summary</h1>
          <Separator className="mb-4" />
          <p className="font-dm-sans text-[#9E9A9A] mb-6">
            Here is your order summary
          </p>

          {/* Wallet Balance */}
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
                      : `₦${wallet?.balance?.toLocaleString() || "0"}`}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-4 mb-2">
            <div className="flex justify-between">
              <span>Items</span>
              <span className="">{checkoutData.itemsCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Quantity</span>
              <span className="">{checkoutData.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost</span>
              <span className="">₦{checkoutData.cost.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between  font-bold">
              <span>Total Amount</span>
              <span>₦{checkoutData.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Narration */}
          <div className="mb-6">
            <Label htmlFor="narration">Narration (optional)</Label>
            <Input
              id="narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="e.g. Payment for inventory"
              className="mt-2 py-6"
            />
          </div>

          {/* Custom PIN Input for Wallet */}
          {paymentMethod === "WALLET" && (
            <div className="mb-8">
              <Label>Transaction PIN</Label>
              <div className="flex gap-4 mb-4 mt-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="relative">
                    <div
                      className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-[16px] font-medium transition-all relative ${
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
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(e, index)}
                      onFocus={(e) => e.target.select()}
                      ref={(el) => {
                        pinRefs.current[index] = el;
                      }}
                      id={`pin-${index}`}
                      className="absolute inset-0 opacity-0 cursor-default"
                      autoFocus={index === 0 && paymentMethod === "WALLET"}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pay Button */}
          <Button
            onClick={handlePay}
            disabled={
              paying ||
              (paymentMethod === "WALLET" && transactionPin.length !== 4)
            }
            className="w-full py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#085a9e] disabled:opacity-70"
          >
            {paying
              ? "Processing..."
              : paymentMethod === "WALLET"
              ? `Pay ₦${checkoutData.total.toLocaleString()} with Wallet`
              : "Get Transfer Details"}
          </Button>
        </Card>
      </div>

      {/* Wallet Success Dialog */}
      <AlertDialog open={showWalletSuccess} onOpenChange={setShowWalletSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-center font-clash">
              🎉 Payment Successful! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-dm-sans text-lg">
              Your order has been placed successfully.
              <br />
              Thank you for shopping with us!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction
              onClick={() => {
                setShowWalletSuccess(false);
                router.push("/dashboards/market-place");
              }}
              className="bg-[#0A6DC0] hover:bg-[#085a9e]"
            >
              Continue Shopping
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Details Dialog */}
      <AlertDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-clash">
              Bank Transfer Details
            </AlertDialogTitle>
            <AlertDialogDescription className="font-dm-sans text-base">
              Please transfer the exact amount to the account below
            </AlertDialogDescription>
          </AlertDialogHeader>

          {transferDetails && (
            <div className="space-y-3 mt-2">
              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2 flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">Account Number</p>
                  <p className=" font-medium">
                    {transferDetails.accountNumber || "N/A"}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      transferDetails.accountNumber || "",
                      "accountNumber"
                    )
                  }
                  className="text-[#0A6DC0] hover:text-blue-700 hover:bg-blue-50"
                >
                  {copiedField === "accountNumber" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2 flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm">Account Name</p>
                  <p className="font-medium">
                    {transferDetails.accountName || "N/A"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      transferDetails.accountName || "",
                      "accountName"
                    )
                  }
                  className="text-[#0A6DC0] hover:text-blue-700 hover:bg-blue-50"
                >
                  {copiedField === "accountName" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2">
                <p className="text-gray-600 text-sm">Bank</p>
                <p className="font-medium">
                  {transferDetails.bankName || "N/A"}
                </p>
              </div>
              {transferDetails.expectedAmount && (
                <div className="bg-[#F7FAFF] border border-[#0A6DC0] rounded-lg p-2  text-center">
                  <p className="text-gray-600 text-sm">Amount</p>
                  <p className=" font-bold text-[#0A6DC0]">
                    ₦{transferDetails.expectedAmount.toLocaleString()}
                  </p>
                </div>
              )}
              {transferDetails.expiresAt && (
                <div className="bg-[#FFF4E6] border-[#FFB020] border rounded-lg p-2 text-[#FFB020] text-sm pt-2">
                  Expires:{" "}
                  {new Date(transferDetails.expiresAt).toLocaleString()}
                </div>
              )}

              {transferDetails.paymentReference && (
                <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-[#6B7280] mb-1">
                      Payment Reference
                    </p>
                    <p className="text-[10px] font-mono text-[#191D23] break-all">
                      {transferDetails.paymentReference}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        transferDetails.paymentReference || "",
                        "paymentReference"
                      )
                    }
                    className="text-[#0A6DC0] hover:text-blue-700 hover:bg-blue-50"
                  >
                    {copiedField === "paymentReference" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel onClick={handleTransferNotSent}>
              I haven't sent it yet
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferSent}
              className="bg-[#0A6DC0] hover:bg-[#085a9e]"
            >
              I have sent the money
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PayPage;
