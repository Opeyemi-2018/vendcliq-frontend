"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ClipLoader } from "react-spinners";
import { handlePayInvoice } from "@/lib/utils/api/apiHelper";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
import { useEffect, useState } from "react";

type PaymentType = "TRANSFER" | "CASH" | "POS";

interface PayFormData {
  paymentType: PaymentType;
  narration: string;
  terminal_id: string;
}

interface TransferDetails {
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  bankCode?: string;
  paymentReference?: string;
  expiresAt?: string;
  expectedAmount?: number;
}

function PayInvoiceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const invoiceId = searchParams.get("invoiceId");

  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>("TRANSFER");
  const [formData, setFormData] = useState<PayFormData>({
    paymentType: "TRANSFER",
    narration: "",
    terminal_id: "",
  });

  const [transferDetails, setTransferDetails] =
    useState<TransferDetails | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Don't show toast immediately - return early if no invoiceId
  if (!invoiceId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">No invoice ID found</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!invoiceId) return;

    setLoading(true);

    const payload: any = {
      paymentType,
      narration: formData.narration.trim(),
    };

    if (paymentType === "POS") {
      if (!formData.terminal_id.trim()) {
        toast.error("Terminal ID is required for POS");
        setLoading(false);
        return;
      }
      payload.terminal_id = formData.terminal_id.trim();
    }

    try {
      const response = await handlePayInvoice(invoiceId, payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        if (paymentType === "TRANSFER") {
          const payLoad = response.data?.paymentPayload;
          if (payLoad) {
            setTransferDetails({
              accountNumber: payLoad.accountNumber,
              accountName: payLoad.accountName,
              bankName: payLoad.bankName,
              expectedAmount: payLoad.expectedAmount,
              paymentReference: payLoad.paymentReference,
              expiresAt: payLoad.expiresAt,
            });
            setShowTransferModal(true);
          } else {
            toast.info(
              "Transfer initialized! Check payment history for bank details."
            );
            setShowSuccessModal(true);
          }
        } else {
          setShowSuccessModal(true);
        }
      } else {
        toast.error(response.error || "Payment failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error processing payment");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/dashboards/market-place");
  };

  const handleTransferSent = () => {
    setShowTransferModal(false);
    toast.success("Thank you! We'll confirm your payment shortly.");
    router.push("/dashboard/sell");
  };

  const handleTransferNotSent = () => {
    setShowTransferModal(false);
    toast.info("You can come back anytime to complete the payment.");
  };

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Invoice</span>
      </button>

      <div>
        <h1 className="font-semibold font-clash text-[20px] md:text-[25px]">
          Mode of Payment
        </h1>
        <p className="font-dm-sans text-[#9E9A9A] font-medium">
          How would you like to pay for this invoice?
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <Card className="p-3 md:p-6 lg:w-[35%] bg-white">
          <h1 className="font-semibold font-clash mb-4">Mode of Payment</h1>
          <Separator className="mb-6" />

          <div
            onClick={() => setPaymentType("TRANSFER")}
            className={`p-4 rounded-lg border cursor-pointer transition mb-4 ${
              paymentType === "TRANSFER"
                ? "border-[#0A6DC0] bg-[#0A6DC012]"
                : "border-gray-200"
            }`}
          >
            <h3 className="font-medium font-dm-sans">Bank Transfer</h3>
          </div>

          <div
            onClick={() => setPaymentType("CASH")}
            className={`p-4 rounded-lg border cursor-pointer transition mb-4 ${
              paymentType === "CASH"
                ? "border-[#0A6DC0] bg-[#0A6DC012]"
                : "border-gray-200"
            }`}
          >
            <h3 className="font-medium font-dm-sans">Cash Payment</h3>
          </div>

          <div
            onClick={() => setPaymentType("POS")}
            className={`p-4 rounded-lg border cursor-pointer transition ${
              paymentType === "POS"
                ? "border-[#0A6DC0] bg-[#0A6DC012]"
                : "border-gray-200"
            }`}
          >
            <h3 className="font-medium font-dm-sans">POS</h3>
          </div>
        </Card>

        <Card className="p-3 md:p-6 lg:w-[65%] bg-white">
          <h1 className="font-semibold font-clash mb-2">Invoice Summary</h1>
          <Separator className="mb-4" />
          <p className="font-dm-sans text-[#9E9A9A] mb-6">
            Invoice ID: {invoiceId}
          </p>

          <div className="mb-6">
            <Label htmlFor="narration">Narration (optional)</Label>
            <Input
              id="narration"
              value={formData.narration}
              onChange={(e) =>
                setFormData({ ...formData, narration: e.target.value })
              }
              placeholder="e.g. Payment for invoice #INV-123"
              className="mt-2 py-6"
            />
          </div>

          {paymentType === "POS" && (
            <div className="mb-8">
              <Label>Terminal ID</Label>
              <Input
                placeholder="Enter POS terminal ID"
                value={formData.terminal_id}
                onChange={(e) =>
                  setFormData({ ...formData, terminal_id: e.target.value })
                }
                className="mt-2"
              />
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#085a9e] disabled:opacity-70"
          >
            {loading ? (
              <>
                Processing...{" "}
                <ClipLoader size={20} color="white" className="ml-3" />
              </>
            ) : (
              `Pay with ${
                paymentType === "TRANSFER"
                  ? "Transfer"
                  : paymentType === "CASH"
                  ? "Cash"
                  : "POS"
              }`
            )}
          </Button>
        </Card>
      </div>

      {/* Transfer Details Modal */}
      <AlertDialog open={showTransferModal} onOpenChange={setShowTransferModal}>
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

          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
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

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
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
              onClick={handleSuccessClose}
              className="bg-[#0A6DC0] hover:bg-[#085a9e] w-full"
            >
              Continue Shopping
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PayInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <ClipLoader color="#0A6DC0" size={40} />
        </div>
      }
    >
      <PayInvoiceContent />
    </Suspense>
  );
}
