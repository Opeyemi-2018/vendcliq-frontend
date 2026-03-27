/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { ClipLoader } from "react-spinners";
import { handlePayInvoice } from "@/lib/utils/api/apiHelper";
import { ArrowLeft, Check, Copy, Eye, EyeOff, X } from "lucide-react";
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
import { useWallet } from "@/hooks/useWallet";

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentMethod = "WALLET" | "TRANSFER";

interface TransferDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  expectedAmount: number;
  paymentReference: string;
  expiresAt: string;
}

interface BuyInvoiceItem {
  id: string;
  stock_id: string;
  quantity: number;
  cost: number;
  sub_total: number;
  mode: "PACKS" | "PIECES";
  sku: string;
  product_name: string;
  product_image: string;
}

interface BuyInvoicePreview {
  invoiceId: string;
  code: string;
  total: number;
  items_count: number;
  items: BuyInvoiceItem[];
}

// ── Main content ──────────────────────────────────────────────────────────────

function BuyPayContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const {  getBalance } = useWallet();

  const invoiceId = searchParams.get("invoiceId");

  const [invoicePreview, setInvoicePreview] = useState<BuyInvoicePreview | null>(null);
  const [loading, setLoading]               = useState(true);
  const [paying, setPaying]                 = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("WALLET");
  const [narration, setNarration]         = useState("");
  const [showBalance, setShowBalance]     = useState(true);

  // PIN state
  const [transactionPin, setTransactionPin] = useState("");
  const [showPinAlert, setShowPinAlert]     = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Dialog state
  const [showWalletSuccess, setShowWalletSuccess]   = useState(false);
  const [transferDetails, setTransferDetails]       = useState<TransferDetails | null>(null);
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  // Copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── Load invoice preview from localStorage ────────────────────────────────

  useEffect(() => {
    if (!invoiceId) { toast.error("No invoice ID found"); router.back(); return; }
    const saved = localStorage.getItem(`buy-invoice-preview-${invoiceId}`);
    if (saved) {
      try { setInvoicePreview(JSON.parse(saved) as BuyInvoicePreview); }
      catch { toast.error("Failed to load invoice details"); router.back(); }
    } else {
      toast.error("No invoice preview found");
      router.back();
    }
    setLoading(false);
  }, [invoiceId, router]);

  const cleanupPreview = () => {
    if (invoiceId) { localStorage.removeItem(`buy-invoice-preview-${invoiceId}`); }
  };

  // ── PIN helpers ───────────────────────────────────────────────────────────

  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "");
    if (digit || value === "") {
      const newPin = transactionPin.split("");
      newPin[index] = digit;
      const updated = newPin.join("").slice(0, 4);
      setTransactionPin(updated);
      if (digit && index < 3) { pinRefs.current[index + 1]?.focus(); }
      else if (value === "" && index > 0) { pinRefs.current[index - 1]?.focus(); }
    }
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !transactionPin[index] && index > 0) {
      e.preventDefault(); pinRefs.current[index - 1]?.focus();
    }
  };

  // ── Payment ───────────────────────────────────────────────────────────────

  const handleProceedClick = () => {
    if (paymentMethod === "WALLET") {
      setShowPinAlert(true);
      setTimeout(() => { pinRefs.current[0]?.focus(); }, 100);
    } else {
      handlePay();
    }
  };

  const handleClosePinAlert = () => { setShowPinAlert(false); setTransactionPin(""); };

  const handlePay = async () => {
    if (!invoiceId) return;
    if (paymentMethod === "WALLET" && transactionPin.length !== 4) {
      toast.error("Please enter your 4-digit transaction PIN"); return;
    }

    setPaying(true);
    try {
      const payload: any = { paymentType: paymentMethod, narration: narration || "" };
      if (paymentMethod === "WALLET") { payload.transactionPin = transactionPin; }

      const response = await handlePayInvoice(invoiceId, payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        if (paymentMethod === "WALLET") {
          setShowPinAlert(false);
          cleanupPreview();
          setShowWalletSuccess(true);
        } else {
          const payLoad = response.data?.paymentPayload;
          if (payLoad) {
            setTransferDetails({
              accountNumber:    payLoad.accountNumber,
              accountName:      payLoad.accountName,
              bankName:         payLoad.bankName,
              expectedAmount:   payLoad.expectedAmount,
              paymentReference: payLoad.paymentReference,
              expiresAt:        payLoad.expiresAt,
            });
            setShowTransferDialog(true);
          } else {
            toast.info("Transfer initialized! Check payment history for bank details.");
            cleanupPreview();
            setShowWalletSuccess(true);
          }
        }
      } else {
        toast.error(response.error || "Payment failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error processing payment");
    } finally {
      setPaying(false);
    }
  };

  const handleTransferSent = () => {
    cleanupPreview();
    setShowTransferDialog(false);
    toast.success("Thank you! We'll confirm your payment shortly.");
    router.push("/my-purchase");
  };

  const handleTransferNotSent = () => {
    setShowTransferDialog(false);
    toast.info("You can come back anytime to complete the payment.");
  };

  const handleSuccessClose = () => {
    setShowWalletSuccess(false);
    router.push("/my-purchase");
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <ClipLoader color="#0A6DC0" size={40} />
        <p className="text-gray-600">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoicePreview) return null;

  const grandTotal = invoicePreview.total;


  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} />
      </button>

      <div>
        <h1 className="font-semibold font-clash text-[20px] md:text-[25px]">Mode of Payment</h1>
        <p className="font-dm-sans text-[#9E9A9A] font-medium">
          How would you like to pay for invoice {invoicePreview.code}?
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 mt-4 md:mt-8">

        {/* Mobile tabs */}
        <div className="lg:hidden flex gap-2 bg-[#ECECF080] p-1 rounded-lg">
          <button onClick={() => setPaymentMethod("WALLET")} className={`flex-1 py-3 rounded-lg font-dm-sans font-medium text-[14px] transition-all ${paymentMethod === "WALLET" ? "bg-[#0A6DC0] text-white" : "text-[#9E9A9A]"}`}>
            Cliq Wallet
          </button>
          <button onClick={() => setPaymentMethod("TRANSFER")} className={`flex-1 py-3 rounded-lg font-dm-sans font-medium text-[14px] transition-all ${paymentMethod === "TRANSFER" ? "bg-[#0A6DC0] text-white" : "text-[#9E9A9A]"}`}>
            Bank Transfer
          </button>
        </div>

        {/* Desktop left panel */}
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg h-full lg:w-[35%] bg-white hidden lg:block">
          <div className="space-y-4">
            <div onClick={() => setPaymentMethod("WALLET")} className={`p-4 rounded-lg border cursor-pointer transition mb-4 ${paymentMethod === "WALLET" ? "border-[#0A6DC0] bg-[#0A6DC012]" : "border-gray-200"}`}>
              <h3 className="font-medium font-dm-sans">Cliq Wallet</h3>
            </div>
            <div onClick={() => setPaymentMethod("TRANSFER")} className={`p-4 rounded-lg border cursor-pointer transition ${paymentMethod === "TRANSFER" ? "border-[#0A6DC0] bg-[#0A6DC012]" : "border-gray-200"}`}>
              <h3 className="font-medium font-dm-sans">Bank Transfer</h3>
            </div>
          </div>
        </div>

        {/* Right: summary */}
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-lg lg:w-[65%] bg-white">
          <h1 className="font-semibold font-clash mb-2">Invoice Summary</h1>
          <Separator className="mb-2" />
          <p className="font-dm-sans text-[#9E9A9A] mb-4">Here is all about the products you want to buy</p>

          {/* Wallet balance (when WALLET selected) */}
          {paymentMethod === "WALLET" && (
            <div className="mb-6">
              <p className="text-[#2F2F2F] font-dm-sans mb-3">Wallet Balance</p>
              <div className="bg-[url('/balance-bg.svg')] bg-cover bg-no-repeat h-[90px] md:h-[120px] rounded-2xl p-6 flex items-center">
                <div className="text-white">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-medium">Wallet Balance</h3>
                    <button onClick={() => setShowBalance(!showBalance)}>
                      {showBalance ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                  <h1 className="text-3xl font-bold font-clash">
                    {showBalance ? "****" : `₦${(getBalance() ?? 0).toLocaleString()}`}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          {invoicePreview.items.length > 0 && (
            <div className="space-y-3 mb-6">
              <h2 className="font-dm-sans font-bold text-[13px] md:text-[16px]">Products</h2>
              {invoicePreview.items.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    {item.product_image ? (
                      <div className="w-14 h-14 rounded flex-shrink-0">
                        <img src={item.product_image} alt={item.sku} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs border border-gray-200">No img</div>
                    )}
                    <div className="text-[#2F2F2F]">
                      <p className="font-medium text-[15px] font-dm-sans">{item.sku}</p>
                      <p className="text-[13px] text-gray-500">{item.product_name}</p>
                      <p className="text-[13px] font-dm-sans">{item.quantity} {item.mode.toLowerCase()} × ₦{item.cost?.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="font-medium text-[15px] font-dm-sans">₦{(Number(item.cost) * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div className="space-y-3 text-sm border-t pt-4 text-[#2F2F2F] mb-6">
            <div className="flex justify-between font-medium">
              <span className="font-dm-sans font-bold">Total Items:</span>
              <span>{invoicePreview.items_count}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="font-dm-sans font-bold">Total Amount:</span>
              <span className="font-dm-sans font-bold">₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Narration */}
          <div className="mb-6">
            <Label htmlFor="narration">Narration (optional)</Label>
            <Input id="narration" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="e.g. Payment for purchase" className="mt-2 py-6" />
          </div>

          <Button onClick={handleProceedClick} disabled={paying} className="w-full py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#085a9e] disabled:opacity-70">
            {paying ? "Processing..." : paymentMethod === "WALLET" ? "Proceed to Payment" : "Get Transfer Details"}
          </Button>
        </div>
      </div>

      {/* ── Wallet PIN Modal ──────────────────────────────────────────── */}
      <AlertDialog open={showPinAlert} onOpenChange={setShowPinAlert}>
        <AlertDialogContent className="sm:max-w-[480px] bg-white">
          <button onClick={handleClosePinAlert} className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-clash font-semibold text-[#2F2F2F] text-center">Enter Transaction PIN</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-[#9E9A9A] text-center">Please enter your 4-digit transaction PIN to complete the payment</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-6">
            <div className="flex gap-4 justify-center mb-6">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="relative">
                  <div className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-[16px] font-medium transition-all relative ${transactionPin?.[index] ? "border-[#0A6DC0] bg-[#0A6DC01A]" : "border-[#D8D8D866] bg-[#F9F9F9]"} ${transactionPin?.length === index ? "!border-[#0A6DC0] !bg-white" : ""}`}>
                    {transactionPin?.[index] || ""}
                    {transactionPin?.length === index && !transactionPin?.[index] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[2px] h-4 bg-[#0A6DC0] animate-pulse" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text" inputMode="numeric" maxLength={1}
                    value={transactionPin?.[index] || ""}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    ref={(el) => { pinRefs.current[index] = el; }}
                    className="absolute inset-0 opacity-0 cursor-default"
                  />
                </div>
              ))}
            </div>
            <Button onClick={handlePay} disabled={paying || transactionPin.length !== 4} className="w-full py-3 bg-[#0A6DC0] hover:bg-[#085a9e] disabled:opacity-70">
              {paying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : `Confirm Payment — ₦${grandTotal.toLocaleString()}`}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Transfer Details Modal ────────────────────────────────────── */}
      <AlertDialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-clash">Bank Transfer Details</AlertDialogTitle>
            <AlertDialogDescription className="font-dm-sans text-base">Please transfer the exact amount to the account below</AlertDialogDescription>
          </AlertDialogHeader>

          {transferDetails && (
            <div className="space-y-3 mt-2">
              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2 flex justify-between items-start">
                <div><p className="text-gray-600 text-sm">Account Number</p><p className="font-medium">{transferDetails.accountNumber || "N/A"}</p></div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transferDetails.accountNumber || "", "accountNumber")} className="text-[#0A6DC0] hover:bg-blue-50">
                  {copiedField === "accountNumber" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2 flex justify-between items-start">
                <div><p className="text-gray-600 text-sm">Account Name</p><p className="font-medium">{transferDetails.accountName || "N/A"}</p></div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transferDetails.accountName || "", "accountName")} className="text-[#0A6DC0] hover:bg-blue-50">
                  {copiedField === "accountName" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-2">
                <p className="text-gray-600 text-sm">Bank</p>
                <p className="font-medium">{transferDetails.bankName || "N/A"}</p>
              </div>

              {transferDetails.expectedAmount && (
                <div className="bg-[#F7FAFF] border border-[#0A6DC0] rounded-lg p-2 text-center">
                  <p className="text-gray-600 text-sm">Amount</p>
                  <p className="font-bold text-[#0A6DC0]">₦{transferDetails.expectedAmount.toLocaleString()}</p>
                </div>
              )}

              {transferDetails.expiresAt && (
                <div className="bg-[#FFF4E6] border-[#FFB020] border rounded-lg p-2 text-[#FFB020] text-sm">
                  Expires: {new Date(transferDetails.expiresAt).toLocaleString()}
                </div>
              )}

              {transferDetails.paymentReference && (
                <div className="bg-[#F9F9F9] border border-[#E0E0E0] rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-[#6B7280] mb-1">Payment Reference</p>
                    <p className="text-[10px] font-mono text-[#191D23] break-all">{transferDetails.paymentReference}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transferDetails.paymentReference || "", "paymentReference")} className="text-[#0A6DC0] hover:bg-blue-50">
                    {copiedField === "paymentReference" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <AlertDialogCancel onClick={handleTransferNotSent}>I haven&apos;t sent it yet</AlertDialogCancel>
            <AlertDialogAction onClick={handleTransferSent} className="bg-[#0A6DC0] hover:bg-[#085a9e]">I have sent the money</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Success Modal ─────────────────────────────────────────────── */}
      <AlertDialog open={showWalletSuccess} onOpenChange={setShowWalletSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-center font-clash">🎉 Payment Successful! 🎉</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-dm-sans text-lg">
              Your purchase has been completed successfully.<br />Thank you!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction onClick={handleSuccessClose} className="bg-[#0A6DC0] hover:bg-[#085a9e] w-full">View My Purchases</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Page wrapper with Suspense ────────────────────────────────────────────────

export default function BuyPayPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><ClipLoader color="#0A6DC0" size={40} /></div>}>
      <BuyPayContent />
    </Suspense>
  );
}