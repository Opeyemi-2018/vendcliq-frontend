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
import { usePaymentSocket } from "@/hooks/invoiceSocket";

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
  items_per_pack: number;
  empties: number;
  emptiesMode: "SELL" | "CREDIT" | null;
  empties_price: number;
}

interface InvoicePreview {
  invoiceId: string;
  items_count: number;
  code: string;
  total: number;
  empties_value?: number;
  status: string;
  storeAddress: string;
  storeName: string;
  storePhone: string;
  items: InvoicePreviewItem[];
  totalQuantity: number;
  totalDiscountAmount: number;
  subTotal: number;
  emptiesValue: number;
  emptiesOwed: number;
  customerName: string | null;
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

  // Initialize payment socket
  const { subscribeToInvoice, isConnected } = usePaymentSocket();

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

  const formatItemQuantity = (item: InvoicePreviewItem) => {
    if (item.mode === "PACKS") {
      return `${item.quantity} packs`;
    } else {
      // PIECES mode - show the exact pieces quantity, not converted to packs
      return `${item.quantity} pieces`;
    }
  };

  const formatItemPrice = (item: InvoicePreviewItem) => {
    const unitPrice = item.cost;
    const discountedPrice = unitPrice - item.discounted_amount;
    if (item.discounted_amount > 0) {
      return (
        <div className="text-right">
          <span className="line-through text-gray-400 text-xs block">
            ₦{(unitPrice * item.quantity).toLocaleString()}
          </span>
          <span className="font-medium text-[#2F2F2F]">
            ₦{(discountedPrice * item.quantity).toLocaleString()}
          </span>
        </div>
      );
    }
    return (
      <span className="font-medium text-[#2F2F2F]">
        ₦{(unitPrice * item.quantity).toLocaleString()}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="mb-6">
        <h1 className="font-semibold font-clash text-[20px] md:text-[28px]">
          Mode of Payment
        </h1>
        <p className="font-dm-sans text-[#9E9A9A] font-medium">
          How would you like to get paid for this product?
        </p>
        {isConnected && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live payment updates active
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Payment Methods */}
        <div className="lg:w-[35%] space-y-6">
          <Card className="p-6 bg-white">
            <h2 className="font-semibold font-clash text-lg mb-4">
              Mode of Payment
            </h2>
            <Separator className="mb-6" />

            <div className="space-y-3">
              <div
                onClick={() => setPaymentType("CASH")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentType === "CASH"
                    ? "border-[#0A6DC0] bg-[#0A6DC008] shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="font-medium font-dm-sans">Cash</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Receive cash payment
                </p>
              </div>

              <div
                onClick={() => setPaymentType("TRANSFER")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentType === "TRANSFER"
                    ? "border-[#0A6DC0] bg-[#0A6DC008] shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="font-medium font-dm-sans">Transfer</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Bank transfer payment
                </p>
              </div>

              <div
                onClick={() => setPaymentType("POS")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentType === "POS"
                    ? "border-[#0A6DC0] bg-[#0A6DC008] shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="font-medium font-dm-sans">POS</h3>
                <p className="text-xs text-gray-500 mt-1">Card payment</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Invoice Summary */}
        <div className="lg:w-[65%]">
          <Card className="p-6 bg-white">
            <h2 className="font-semibold font-clash text-lg mb-2">Summary</h2>
            <p className="text-[#9E9A9A] font-medium font-dm-sans text-sm mb-4">
              Here is all about the products you want to sell
            </p>
            <Separator className="mb-4" />

            {/* Customer Name */}
            <div className="mb-4">
              <Label className="font-bold font-dm-sans text-[#2F2F2F]">
                Customer Name
              </Label>
              <p className="font-regular font-dm-sans">
                {invoicePreview.customerName || "Walk-in Customer"}
              </p>
            </div>

            {/* Supplier Info */}
            <div className="mb-6">
              <Label className="font-bold font-dm-sans text-[#2F2F2F]">
                Supplier Info
              </Label>
              <div className="mt-1">
                <p className="font-medium">{invoicePreview.storeName}</p>
                <p className="text-sm text-gray-600">
                  {invoicePreview.storeAddress}
                </p>
                <p className="text-sm text-gray-600">
                  {invoicePreview.storePhone}
                </p>
              </div>
            </div>

            {/* Products Table */}
            <div className="mb-6">
              <h3 className="font-bold font-dm-sans mb-3">Products</h3>
              <div className="space-y-3">
                {invoicePreview.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex justify-between items-start py-2 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {item.product_image ? (
                          <div className="w-12 h-12 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product_image}
                              alt={item.sku}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs border border-gray-200">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#2F2F2F]">
                            {item.product_name}
                          </p>
                          {/* <p className="text-xs text-gray-500">
                            SKU: {item.sku}
                          </p> */}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatItemQuantity(item)}
                          </p>
                          {item.discounted_amount > 0 && (
                            <p className="text-xs text-green-600 mt-1">
                              Discount: ₦
                              {item.discounted_amount.toLocaleString()}/unit
                            </p>
                          )}
                          {item.empties > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              Empties: {item.empties} (
                              {item.emptiesMode === "SELL"
                                ? "Sold"
                                : "On Credit"}
                              )
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₦{(item.cost * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        @ ₦{item.cost.toLocaleString()}/
                        {item.mode === "PACKS" ? "pack" : "piece"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Section */}
            <div className="space-y-3 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="font-dm-sans text-gray-600">
                  Total Quantity
                </span>
                <span className="font-medium">
                  {invoicePreview.totalQuantity.toFixed(1)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-dm-sans text-gray-600">
                  Total Discount
                </span>
                <span className="font-medium text-green-600">
                  ₦{invoicePreview.totalDiscountAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-dm-sans text-gray-600">Sub Total</span>
                <span className="font-medium">
                  ₦{invoicePreview.subTotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-dm-sans text-gray-600">
                  Empties Value
                </span>
                <span className="font-medium">
                  ₦{invoicePreview.emptiesValue.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-dm-sans text-gray-600">Empties Owed</span>
                <span className="font-medium">
                  {invoicePreview.emptiesOwed} units
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between font-bold text-base">
                <span className="font-dm-sans">Amount Payable</span>
                <span className="text-[#0A6DC0]">
                  ₦{invoicePreview.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* POS Terminal ID Input */}
            {paymentType === "POS" && (
              <div className="mt-6">
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

            {/* Payment Button */}
            <Button
              onClick={async () => {
                setLoading(true);
                try {
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

                  const response = await handlePayInvoice(invoiceId, payload);

                  if (
                    response.statusCode === 200 ||
                    response.statusCode === 201
                  ) {
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
                        subscribeToInvoice(invoiceId);
                      } else {
                        toast.info("Transfer initialized!");
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
              }}
              disabled={loading}
              className="w-full mt-6 py-3 bg-[#0A6DC0] hover:bg-[#085a9e] text-white rounded-xl font-semibold"
            >
              {loading ? (
                <>
                  Processing...{" "}
                  <ClipLoader size={20} color="white" className="ml-2" />
                </>
              ) : (
                `Pay with ${paymentType === "TRANSFER" ? "Transfer" : paymentType === "CASH" ? "Cash" : "POS"}`
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Please make sure to receive the amount above from the customer
              before giving out product
            </p>
          </Card>
        </div>
      </div>

      {/* Transfer Details Modal */}
      <AlertDialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <AlertDialogContent className="bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-clash">
              Bank Transfer Details
            </AlertDialogTitle>
            <AlertDialogDescription className="font-dm-sans">
              Please transfer the exact amount to the account below
            </AlertDialogDescription>
          </AlertDialogHeader>

          {transferDetails && (
            <div className="space-y-3 mt-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600 text-sm">Amount to Pay</p>
                <p className="font-bold text-2xl text-[#0A6DC0]">
                  ₦{transferDetails.expectedAmount?.toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
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
                  className="text-[#0A6DC0]"
                >
                  {copiedField === "accountNumber" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
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
                  className="text-[#0A6DC0]"
                >
                  {copiedField === "accountName" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600 text-sm">Bank</p>
                <p className="font-medium">
                  {transferDetails.bankName || "N/A"}
                </p>
              </div>

              {transferDetails.paymentReference && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm">Reference</p>
                  <p className="font-mono text-xs break-all">
                    {transferDetails.paymentReference}
                  </p>
                </div>
              )}

              {transferDetails.expiresAt && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-700 text-sm">
                    Expires:{" "}
                    {new Date(transferDetails.expiresAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel onClick={() => setShowTransferModal(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                cleanupPreview();
                setShowTransferModal(false);
                toast.success("Payment recorded! We'll confirm shortly.");
                router.push("/inventory/overview");
              }}
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
              onClick={() => {
                cleanupPreview();
                setShowSuccessModal(false);
                router.push("/inventory/overview");
              }}
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
