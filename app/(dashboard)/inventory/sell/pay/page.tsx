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
import {
  handlePayInvoice,
  handlePayInvoiceCreditOtp,
} from "@/lib/utils/api/apiHelper";
import { ArrowLeft, Check, Copy, ChevronRight } from "lucide-react";
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
import { useState } from "react";
import Image from "next/image";
import { usePaymentSocket } from "@/hooks/invoiceSocket";
import { useUser } from "@/context/userContext";
import { useSaleInvoice } from "@/hooks/useInventoryOverview"; // Add this import

type PaymentType = "TRANSFER" | "CASH" | "CREDIT";

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

// Update InvoicePreviewItem to match API response
interface InvoicePreviewItem {
  id: string;
  stock_id: string;
  product_id: number;
  quantity: number;
  cost: number;
  discounted_amount: number;
  sub_total: number;
  mode: "PACKS" | "PIECES";
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

const PAYMENT_OPTIONS: {
  type: PaymentType;
  title: string;
  description: string;
}[] = [
  { type: "CASH", title: "Cash", description: "Receive cash payment" },
  { type: "TRANSFER", title: "Transfer", description: "Bank transfer payment" },
  {
    type: "CREDIT",
    title: "Sell on Credit",
    description: "Authorized credit sale, payment due later",
  },
];

function PayInvoiceContent() {
  const { canSellOnCredit } = useUser();
  const filteredPaymentOptions = PAYMENT_OPTIONS.filter((option) => {
    if (option.type === "CREDIT") return canSellOnCredit();
    return true;
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCreditOtpModal, setShowCreditOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [otpDueDate, setOtpDueDate] = useState<string>("");
  const [otpLoading, setOtpLoading] = useState(false);
  const isEdit = searchParams.get("edit") === "true";

  // Mobile step: "select" | "details"
  const [mobileStep, setMobileStep] = useState<"select" | "details">("select");

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const invoiceId = searchParams.get("invoiceId");

  // Use the hook to fetch invoice data
  const { data: invoice, isLoading, error } = useSaleInvoice(invoiceId || "");

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
  const [dueDate, setDueDate] = useState<string>("");

  const { subscribeToInvoice, isConnected } = usePaymentSocket();

  // Transform API response to InvoicePreview format
  const invoicePreview: InvoicePreview | null = invoice
    ? {
        invoiceId: invoice.id,
        code: invoice.code,
        total: invoice.amount_payable,
        items_count: invoice.items_count,
        storeAddress: invoice.store?.address?.name || "",
        storeName: invoice.store?.name || "",
        storePhone: invoice.store?.phone || "",
        items: invoice.items.map((item) => ({
          id: item.id,
          stock_id: item.stock_id.toString(),
          product_id: item.product_id,
          quantity: parseFloat(item.quantity as any), // quantity is string "3.00" -> convert to number
          cost: item.stock.price, // Use stock.price instead of item.cost
          discounted_amount: item.discounted_amount,
          sub_total: item.sub_total,
          mode: item.mode as "PACKS" | "PIECES",
          sku: item.stock.sku,
          product_name: item.product.name,
          product_image: item.product.image || "",
          items_per_pack: 1,
          empties: item.empties || 0,
          emptiesMode: null,
          empties_price: 0,
        })),
        totalQuantity: invoice.total_quantity,
        totalDiscountAmount: invoice.total_discount,
        subTotal: invoice.sub_total,
        emptiesValue: invoice.empties_value,
        emptiesOwed: invoice.empties_owed,
        customerName: invoice.customer?.name || null,
      }
    : null;

  const handleSelectPaymentType = (type: PaymentType) => {
    setPaymentType(type);
    setMobileStep("details");
  };

  const handlePayment = async () => {
    if (paymentType === "CREDIT" && !dueDate) {
      toast.error("Please select a due date for credit sale");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        paymentType,
        narration: formData.narration.trim() || "Credit Sale",
      };

      if (paymentType === "CREDIT" && dueDate) {
        payload.due_date = dueDate;
      }

      const response = await handlePayInvoice(invoiceId!, payload);

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
            subscribeToInvoice(invoiceId!);
          } else {
            toast.info("Transfer initialized!");
            setShowSuccessModal(true);
          }
        } else {
          if (
            paymentType === "CREDIT" &&
            (response.data as any)?.otp_required
          ) {
            toast.info(response.data.message);
            setOtpDueDate(dueDate);
            setShowCreditOtpModal(true);
          } else {
            setShowSuccessModal(true);
            toast.success(
              response.data?.message || "Payment recorded successfully!",
            );
          }
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

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otpValues];
    updated[index] = value.slice(-1);
    setOtpValues(updated);
    if (value && index < 5) {
      const next = document.getElementById(`otp-box-${index + 1}`);
      (next as HTMLInputElement)?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prev = document.getElementById(`otp-box-${index - 1}`);
      (prev as HTMLInputElement)?.focus();
    }
  };

  const handleCreditOtpSubmit = async () => {
    const otp = otpValues.join("");
    if (otp.length !== 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }
    if (!otpDueDate) {
      toast.error("Please select a due date");
      return;
    }
    setOtpLoading(true);
    try {
      const response = await handlePayInvoiceCreditOtp(invoiceId!, {
        otp,
        due_date: new Date(otpDueDate).toISOString(),
      });
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.data?.message || "Credit sale completed!");
        setShowCreditOtpModal(false);
        router.push("/credit-ledger");
      } else {
        toast.error(response.error || "OTP verification failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error verifying OTP");
    } finally {
      setOtpLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <ClipLoader color="#0A6DC0" size={40} />
        <p className="text-gray-600">Loading invoice details...</p>
      </div>
    );
  }

  if (error || !invoicePreview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">
            {error?.message || "Invoice not found"}
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatItemQuantity = (item: InvoicePreviewItem) => {
    return item.mode === "PACKS"
      ? `${item.quantity} packs`
      : `${item.quantity} pieces`;
  };

  // ── Invoice summary panel (shared between mobile details & desktop right) ──
  const InvoiceSummary = () => (
    <div className="md:p-6 h-full lg:border border-[#E4E4E4] rounded-lg bg-white">
      <h2 className="font-semibold font-clash text-lg mb-2">Summary</h2>
      <p className="text-[#9E9A9A] font-medium font-dm-sans text-sm mb-4">
        Here is all about the products you want to sell
      </p>
      <Separator className="mb-4" />

      <div className="mb-4">
        <Label className="font-bold font-dm-sans text-[#2F2F2F]">
          Customer Name
        </Label>
        <p className="font-regular font-dm-sans">
          {invoicePreview.customerName || "Walk-in Customer"}
        </p>
      </div>

      <div className="mb-6">
        <Label className="font-bold font-dm-sans text-[#2F2F2F]">
          Supplier Info
        </Label>
        <div className="mt-1">
          <p className="font-medium">{invoicePreview.storeName}</p>
          <p className="text-sm text-gray-600">{invoicePreview.storeAddress}</p>
          <p className="text-sm text-gray-600">{invoicePreview.storePhone}</p>
        </div>
      </div>

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
                    <p className="text-xs text-gray-500 mt-1">
                      {formatItemQuantity(item)}
                    </p>
                    {item.discounted_amount > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Discount: ₦{item.discounted_amount.toLocaleString()}
                        /unit
                      </p>
                    )}
                    {item.empties > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Empties: {item.empties} (
                        {item.emptiesMode === "SELL" ? "Sold" : "On Credit"})
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ₦{item.sub_total.toLocaleString()}{" "}
                  {/* Use sub_total directly */}
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

      <div className="space-y-1 text-sm border-t pt-3">
        <div className="flex justify-between">
          <span className="font-dm-sans text-gray-600">Total Quantity</span>
          <span className="font-medium">
            {invoicePreview.totalQuantity.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-dm-sans text-gray-600">Total Discount</span>
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
          <span className="font-dm-sans text-gray-600">Empties Value</span>
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

      {/* Credit due date + pay button */}
      <div className="mt-6">
        {paymentType === "CREDIT" && (
          <div className="mb-6">
            <Label className="font-medium text-[#2F2F2F] mb-2 block">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-white border border-gray-300 focus:border-[#0A6DC0]"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500 mt-1">
              When should this credit be due?
            </p>
          </div>
        )}

        <Button
          onClick={handlePayment}
          disabled={loading || (paymentType === "CREDIT" && !dueDate)}
          className="w-full py-3 bg-[#0A6DC0] hover:bg-[#085a9e] text-white rounded-xl font-semibold"
        >
          {loading ? (
            <>
              Processing...{" "}
              <ClipLoader size={20} color="white" className="ml-2" />
            </>
          ) : paymentType === "CREDIT" ? (
            "Request Credit Authorization"
          ) : paymentType === "TRANSFER" ? (
            "Pay with Transfer"
          ) : (
            "Confirm Cash Payment"
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500 mt-4">
        Please make sure to receive the amount above from the customer before
        giving out product
      </p>
    </div>
  );

  return (
    <div className="py-6">
      {/* Header */}
      <button
        onClick={() => {
          if (mobileStep === "details") {
            setMobileStep("select");
          } else {
            router.back();
          }
        }}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>
          {mobileStep === "details" ? "Change Payment Method" : "Back"}
        </span>
      </button>

      <div className="mb-6">
        <h1 className="font-semibold font-clash text-[20px] md:text-[28px]">
          {mobileStep === "select" ? "Mode of Payment" : "Order Summary"}
        </h1>
        <p className="font-dm-sans text-[#9E9A9A] font-medium">
          {mobileStep === "select"
            ? "How would you like to get paid for this product?"
            : `Paying via ${PAYMENT_OPTIONS.find((o) => o.type === paymentType)?.title}`}
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

      {/* ── MOBILE: step-based ── */}
      <div className="lg:hidden">
        {mobileStep === "select" && (
          <div className="space-y-3">
            {filteredPaymentOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleSelectPaymentType(option.type)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#0A6DC0] hover:bg-[#0A6DC008] transition-all text-left"
              >
                <div>
                  <h3 className="font-medium font-dm-sans">{option.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </p>
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-400 flex-shrink-0"
                />
              </button>
            ))}
          </div>
        )}

        {mobileStep === "details" && <InvoiceSummary />}
      </div>

      {/* ── DESKTOP: side by side ── */}
      <div className="hidden lg:flex gap-6">
        {/* Left: payment selector */}
        <div className="w-[35%] space-y-6">
          <div className="p-6 border border-[#E4E4E4] rounded-lg">
            <h2 className="font-semibold font-clash text-lg mb-4">
              Mode of Payment
            </h2>
            <Separator className="mb-6" />
            <div className="space-y-3">
              {filteredPaymentOptions.map((option) => (
                <div
                  key={option.type}
                  onClick={() => setPaymentType(option.type)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentType === option.type
                      ? "border-[#0A6DC0] bg-[#0A6DC008] shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h3 className="font-medium font-dm-sans">{option.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: invoice summary */}
        <div className="w-[65%]">
          <InvoiceSummary />
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

              {[
                { label: "Account Number", key: "accountNumber" as const },
                { label: "Account Name", key: "accountName" as const },
              ].map(({ label, key }) => (
                <div
                  key={key}
                  className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-600 text-sm">{label}</p>
                    <p className="font-medium">
                      {transferDetails[key] || "N/A"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(transferDetails[key] || "", key)
                    }
                    className="text-[#0A6DC0]"
                  >
                    {copiedField === key ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}

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
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                if (isEdit) {
                  router.push(`/inventory/sales/${invoiceId}`);
                } else {
                  router.push("/inventory/sell");
                }
              }}
              className="bg-[#0A6DC0] hover:bg-[#085a9e] w-full"
            >
              {isEdit ? "View Updated Invoice" : "Continue Shopping"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credit OTP Modal */}
      <AlertDialog
        open={showCreditOtpModal}
        onOpenChange={setShowCreditOtpModal}
      >
        <AlertDialogContent className="bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-clash">
              Credit Sale Authorization
            </AlertDialogTitle>
            <AlertDialogDescription className="font-dm-sans">
              Enter the 6-digit OTP sent to the store authorizer and set a due
              date.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-5 mt-2">
            {/* OTP boxes */}
            <div>
              <Label className="font-medium text-[#2F2F2F] mb-3 block">
                OTP Code
              </Label>
              <div className="flex gap-2 justify-between">
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    id={`otp-box-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:border-[#0A6DC0] focus:outline-none focus:ring-2 focus:ring-[#0A6DC020]"
                  />
                ))}
              </div>
            </div>

            {/* Due date */}
            <div>
              <Label className="font-medium text-[#2F2F2F] mb-2 block">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={otpDueDate}
                onChange={(e) => setOtpDueDate(e.target.value)}
                className="bg-white border border-gray-300 focus:border-[#0A6DC0]"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-gray-500 mt-1">
                When should this credit be due?
              </p>
            </div>
          </div>

          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel
              onClick={() => {
                setShowCreditOtpModal(false);
                setOtpValues(["", "", "", "", "", ""]);
                setOtpDueDate("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleCreditOtpSubmit}
              disabled={
                otpLoading || otpValues.join("").length !== 6 || !otpDueDate
              }
              className="bg-[#0A6DC0] hover:bg-[#085a9e] text-white"
            >
              {otpLoading ? (
                <>
                  Verifying...{" "}
                  <ClipLoader size={16} color="white" className="ml-2" />
                </>
              ) : (
                "Confirm Credit Sale"
              )}
            </Button>
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
