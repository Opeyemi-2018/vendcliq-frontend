/* eslint-disable @typescript-eslint/no-explicit-any */
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
import Image from "next/image";

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

interface InvoicePreviewItem {
  id: string;

  stock_id: string;
  product_id: number;
  quantity: number;
  cost: number;
  discounted_amount: number;
  sub_total: number;
  mode: "PACKS" | "PIECES";
  attributes?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  sku: string;
  product_name: string;
  product_image: string;
}

interface InvoicePreview {
  invoiceId: string;
  items_count: number;
  code: string;
  total: number;
  empties_value: number;
  status: string;
  storeAddress: string;
  items: InvoicePreviewItem[];
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

  const [invoicePreview, setInvoicePreview] = useState<InvoicePreview | null>(
    null,
  );

  useEffect(() => {
    if (invoiceId) {
      const saved = localStorage.getItem(`invoice-preview-${invoiceId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as InvoicePreview;
          setInvoicePreview(parsed);
        } catch (err) {
          console.error("Failed to parse invoice preview:", err);
          toast.error("Failed to load invoice details");
        }
      } else {
        toast.error("No invoice preview found");
      }
    }
  }, [invoiceId]);

  const cleanupPreview = () => {
    if (invoiceId) {
      localStorage.removeItem(`invoice-preview-${invoiceId}`);
    }
  };

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

  if (!invoicePreview) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <ClipLoader color="#0A6DC0" size={40} />
        <p className="text-gray-600">Loading invoice details...</p>
      </div>
    );
  }

  const totalQuantity = invoicePreview.items_count;

  // const totalQuantity = invoicePreview.items.reduce(
  //   (sum, item) => sum + item.quantity,
  //   0,
  // );
  // const totalDiscount = invoicePreview.items.reduce(
  //   (sum, item) => sum + item.discounted_amount,
  //   0,
  // );
  const grandTotal = invoicePreview.total;
  const empty = invoicePreview.empties_value;

  const handlePayment = async () => {
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
              "Transfer initialized! Check payment history for bank details.",
            );
            cleanupPreview();
            setShowSuccessModal(true);
          }
        } else {
          cleanupPreview();
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
    cleanupPreview();
    setShowSuccessModal(false);
    router.push("/dashboards/inventory/overview");
  };

  const handleTransferSent = () => {
    cleanupPreview();
    setShowTransferModal(false);
    toast.success("Thank you! We'll confirm your payment shortly.");
    router.push("/dashboards/inventory/overview");
  };

  const handleTransferNotSent = () => {
    setShowTransferModal(false);
    toast.info("You can come back anytime to complete the payment.");
    // Optional: keep preview if they didn't confirm payment yet
    // cleanupPreview(); // uncomment if you want to remove anyway
  };

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
      </button>

      <div>
        <h1 className="font-semibold font-clash text-[20px] md:text-[25px]">
          Mode of Payment
        </h1>
        <p className="font-dm-sans text-[#9E9A9A] font-medium">
          How would you like to pay for invoice {invoicePreview.code}?
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 mt-4 md:mt-8">
        <Card className="md:p-6 lg:w-[35%] bg-white">
          <h1 className="font-semibold font-clash mb-4">Mode of Payment</h1>
          <Separator className="mb-6 hidden md:block" />

          <div className="lg:hidden flex gap-2 bg-[#ECECF080] p-1 rounded-lg">
            <button
              onClick={() => setPaymentType("TRANSFER")}
              className={`flex-1 py-3 rounded-lg font-dm-sans font-medium text-[14px] transition-all ${
                paymentType === "TRANSFER"
                  ? "bg-[#0A6DC0] text-white"
                  : "text-[#9E9A9A]"
              }`}
            >
              Transfer
            </button>
            <button
              onClick={() => setPaymentType("CASH")}
              className={`flex-1 py-3 rounded-lg font-dm-sans font-medium text-[14px] transition-all ${
                paymentType === "CASH"
                  ? "bg-[#0A6DC0] text-white"
                  : "text-[#9E9A9A]"
              }`}
            >
              Cash
            </button>
            <button
              onClick={() => setPaymentType("POS")}
              className={`flex-1 py-3 rounded-lg font-dm-sans font-medium text-[14px] transition-all ${
                paymentType === "POS"
                  ? "bg-[#0A6DC0] text-white"
                  : "text-[#9E9A9A]"
              }`}
            >
              POS
            </button>
          </div>

          <div className="hidden lg:block space-y-4">
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
          </div>
        </Card>

        <Card className="p-3 md:p-6 lg:w-[65%] bg-white">
          <h1 className="font-semibold font-clash mb-2">Invoice Summary</h1>
          <Separator className="" />
          <p className="text-[#9E9A9A] font-medium font-dm-sans">
            Here is all about the products you want to sell
          </p>

          <div className="mt-3">
            <Label className="font-bold font-dm-sans text-[#2F2F2F]">
              Store Address
            </Label>
            <p className="font-regular font-dm-sans">
              {invoicePreview.storeAddress}
            </p>
          </div>

          {invoicePreview.items.length > 0 ? (
            <div className="space-y-4 mb-6 mt-4">
              <div>
                <h1 className="font-dm-sans font-bold text-[13px] mb-2 md:text-[16px]">
                  Product
                </h1>
                {invoicePreview.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex justify-between items-center border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-1">
                      {item.product_image ? (
                        <div className="w-16 h-16 rounded flex-shrink-0 ">
                          <Image
                            src={item.product_image}
                            alt={item.sku}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                          No Image
                        </div>
                      )}

                      <div className="flex-1 min-w-0 text-[#2F2F2F]">
                        <p className="font-medium text-[16px] font-dm-sans">
                          {item.sku}
                        </p>

                        <p className="font-medium text-[16px] font-dm-sans">
                          {item.quantity}{" "}
                          <span className="uppercase">
                            {item.mode.toLowerCase()}
                          </span>{" "}
                          X ₦{item.cost.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500"></p>
                      </div>
                    </div>

                    <p className="font-medium text-[16px] font-dm-sans">
                      ₦{(Number(item.cost) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-6">
              No items in this invoice
            </p>
          )}

          <div className="space-y-3 text-sm border-t pt-4 text-[#2F2F2F]">
            <div className="flex justify-between font-medium">
              <span className="font-dm-sans font-bold">Total Quantity:</span>
              <span className="font-regular">{totalQuantity} Qty</span>
            </div>

            <div className="flex justify-between ">
              <span className="font-dm-sans font-bold">Total Discount:</span>
              <span className="font-dm-sans font-bold">
                {invoicePreview.items.reduce(
                  (sum, item) => sum + Number(item.discounted_amount || 0),
                  0,
                ) > 0
                  ? `₦${invoicePreview.items
                      .reduce(
                        (sum, item) =>
                          sum + Number(item.discounted_amount || 0),
                        0,
                      )
                      .toLocaleString()}`
                  : "₦0"}
              </span>
            </div>

            <div className="flex justify-between font-medium">
              <span className="font-dm-sans font-bold">Empty Values:</span>
              <span className="font-regular">{empty}</span>
            </div>

            <div className="flex justify-between font-bold ">
              <span className="font-dm-sans font-bold">Total Amount:</span>
              <span className="font-dm-sans font-bold">
                ₦{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {paymentType === "POS" && (
            <div className="mb-2 mt-6">
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
            className="w-full mt-6 py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#085a9e] disabled:opacity-70"
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
                  <p className="font-medium">
                    {transferDetails.accountNumber || "N/A"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      transferDetails.accountNumber || "",
                      "accountNumber",
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
                      "accountName",
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
                <div className="bg-[#F7FAFF] border border-[#0A6DC0] rounded-lg p-2 text-center">
                  <p className="text-gray-600 text-sm">Amount</p>
                  <p className="font-bold text-[#0A6DC0]">
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
                        "paymentReference",
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
              I haven&apos;t sent it yet
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
