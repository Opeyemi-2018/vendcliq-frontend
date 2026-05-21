/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ClipLoader } from "react-spinners";
import { Check, Copy, Search, Download, Plus, ChevronDown, ChevronUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getCreditLedger, recordCreditPayment } from "@/lib/utils/api/apiHelper";

// ── Types ──────────────────────────────────────────────────────────────────
interface PaymentHistory {
  amount: number;
  paid_at: string;
  narration: string | null;
  recorded_by: number;
  payment_type?: string;   // Made optional
  paymentType?: string;    // Support both possible keys
}

interface LedgerItem {
  uuid: string;
  invoice: { uuid: string; code: string; total: number };
  customer: { uuid: string; name: string; email: string; phone: string };
  store: { uuid: string; name: string };
  total_amount: number;
  amount_paid: number;
  outstanding: number;
  due_date: string;
  status: string;
  payment_history: PaymentHistory[];
  created_at: string;
  updated_at: string;
}

interface TransferDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  paymentReference: string;
  expiresAt: string;
  expectedAmount: number;
}

type PaymentModalStep = "select" | "transfer-details";
type FilterTab = "All" | "Overdue" | "Due Soon" | "Paid";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₦${n.toLocaleString()}`;

const getStatusStyle = (status: string, dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (status === "PAID") return { label: "Paid", bg: "bg-green-100 text-green-700", dot: "bg-green-500" };
  if (diffDays < 0) return { label: "Overdue", bg: "bg-red-100 text-red-700", dot: "bg-red-500" };
  if (diffDays <= 7) return { label: "Due Soon", bg: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" };
  return { label: "Pending", bg: "bg-blue-100 text-blue-700", dot: "bg-blue-500" };
};

const getDueLabel = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = due.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  if (diffDays < 0) return { date: formatted, sub: `Overdue by ${Math.abs(diffDays)}d` };
  if (diffDays === 0) return { date: formatted, sub: "Due today" };
  return { date: formatted, sub: `Due in ${diffDays}d` };
};

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const avatarColor = (name: string) => {
  const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"];
  return colors[name.charCodeAt(0) % colors.length];
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function CreditLedger() {
  const [ledgers, setLedgers] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Log Payment modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<LedgerItem | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentModalStep>("select");
  const [payAmount, setPayAmount] = useState("");
  const [payLoadingType, setPayLoadingType] = useState<"CASH" | "TRANSFER" | null>(null);
  const [transferDetails, setTransferDetails] = useState<TransferDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    setLoading(true);
    try {
      const res = await getCreditLedger();
      if (res.statusCode === 200) {
        setLedgers(res.data);
      } else {
        toast.error("Failed to load credit ledger");
      }
    } catch {
      toast.error("Error loading credit ledger");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openPayModal = (ledger: LedgerItem) => {
    setSelectedLedger(ledger);
    setPayAmount(ledger.outstanding.toString());
    setPaymentStep("select");
    setTransferDetails(null);
    setShowPayModal(true);
  };

  const handleRecordPayment = async (type: "CASH" | "TRANSFER") => {
    if (!selectedLedger) return;
    const amount = Number(payAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setPayLoadingType(type);
    try {
      const res = await recordCreditPayment(selectedLedger.uuid, {
        amount,
        paymentType: type,        // Correct key as per your Postman
      });

      if (res.statusCode === 200 || res.statusCode === 201) {
        if (type === "TRANSFER" && res.data?.paymentPayload) {
          setTransferDetails(res.data.paymentPayload);
          setPaymentStep("transfer-details");
        } else {
          toast.success(res.data?.message || "Payment recorded successfully!");
          setShowPayModal(false);
          fetchLedgers();
        }
      } else {
        toast.error(res.error || "Payment failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error recording payment");
    } finally {
      setPayLoadingType(null);
    }
  };

  // ── Filter logic ──
  const filtered = ledgers.filter((l) => {
    const due = new Date(l.due_date);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const matchSearch =
      l.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.invoice.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (filterTab === "All") return true;
    if (filterTab === "Overdue") return diffDays < 0 && l.status !== "PAID";
    if (filterTab === "Due Soon") return diffDays >= 0 && diffDays <= 7 && l.status !== "PAID";
    if (filterTab === "Paid") return l.status === "PAID";
    return true;
  });

  const countByTab = (tab: FilterTab) => {
    if (tab === "All") return ledgers.length;
    return ledgers.filter((l) => {
      const diffDays = Math.ceil((new Date(l.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (tab === "Overdue") return diffDays < 0 && l.status !== "PAID";
      if (tab === "Due Soon") return diffDays >= 0 && diffDays <= 7 && l.status !== "PAID";
      if (tab === "Paid") return l.status === "PAID";
      return false;
    }).length;
  };

  const totalOutstanding = ledgers.reduce((s, l) => s + l.outstanding, 0);

  return (
    <div className="py-6 px-0">
      <div className="mb-6">
        <h1 className="font-clash font-semibold text-[28px] text-[#1A1A1A]">Credit Ledger</h1>
        <p className="text-sm text-[#9E9A9A] font-dm-sans mt-1">All authorized credit sales</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Outstanding" value={fmt(totalOutstanding)} sub={`${ledgers.length} active credits`} borderColor="border-t-blue-500" />
        <StatCard label="Overdue" value={fmt(ledgers.filter((l) => new Date(l.due_date) < new Date() && l.status !== "PAID").reduce((s, l) => s + l.outstanding, 0))} sub={`${countByTab("Overdue")} customers`} borderColor="border-t-red-500" />
        <StatCard label="Due This Week" value={fmt(ledgers.filter((l) => { const d = Math.ceil((new Date(l.due_date).getTime() - new Date().getTime()) / 86400000); return d >= 0 && d <= 7 && l.status !== "PAID"; }).reduce((s, l) => s + l.outstanding, 0))} sub={`${countByTab("Due Soon")} reminders sent`} borderColor="border-t-yellow-400" />
        <StatCard label="Recovered (Total)" value={fmt(ledgers.reduce((s, l) => s + l.amount_paid, 0))} sub={`${countByTab("Paid")} credits cleared`} borderColor="border-t-green-500" />
      </div>

      <div className="bg-white border border-[#E4E4E4] rounded-xl">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E4]">
          <div>
            <h2 className="font-clash font-semibold text-lg text-[#1A1A1A]">Credit Ledger</h2>
            <p className="text-xs text-[#9E9A9A] font-dm-sans mt-0.5">All credit sales authorized through Vendcliq</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search by customer or invoice"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A6DC0] w-64 font-dm-sans"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2 font-dm-sans">
              <Download size={15} /> Export
            </Button>
            <Button size="sm" className="gap-2 bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-dm-sans">
              <Plus size={15} /> Record Payment
            </Button>
          </div>
        </div>

        <div className="px-5 pt-4 pb-0 flex gap-2 flex-wrap">
          {(["All", "Overdue", "Due Soon", "Paid"] as FilterTab[]).map((tab) => {
            const count = countByTab(tab);
            const dotColor = tab === "Overdue" ? "bg-red-500" : tab === "Due Soon" ? "bg-yellow-400" : tab === "Paid" ? "bg-green-500" : "";
            const active = filterTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-dm-sans font-medium border transition-all ${
                  active ? "border-[#0A6DC0] text-[#0A6DC0] bg-[#0A6DC008]" : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
                {tab} <span className={`text-xs ${active ? "text-[#0A6DC0]" : "text-gray-400"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] px-5 py-2 bg-gray-50 border-y border-[#E4E4E4]">
            {["CUSTOMER", "INVOICE", "TOTAL", "PAID", "OUTSTANDING", "DUE DATE", "STATUS"].map((h) => (
              <span key={h} className="text-[11px] font-semibold text-gray-500 tracking-wide font-dm-sans">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <ClipLoader color="#0A6DC0" size={32} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-dm-sans">No credit records found.</div>
          ) : (
            filtered.map((item) => {
              const status = getStatusStyle(item.status, item.due_date);
              const dueLabel = getDueLabel(item.due_date);
              const isExpanded = expandedRow === item.uuid;
              const initials = getInitials(item.customer.name);
              const avatarBg = avatarColor(item.customer.name);

              return (
                <div key={item.uuid} className="border-b border-[#F0F0F0] last:border-b-0">
                  <div
                    className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] px-5 py-4 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedRow(isExpanded ? null : item.uuid)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A] font-dm-sans">{item.customer.name}</p>
                        <p className="text-xs text-gray-400 font-dm-sans">{item.customer.phone}</p>
                      </div>
                    </div>

                    <span className="text-sm text-gray-600 font-dm-sans">{item.invoice.code}</span>
                    <span className="text-sm font-medium font-dm-sans">{fmt(item.total_amount)}</span>

                    <div>
                      {item.amount_paid > 0 ? (
                        <span className="text-sm font-medium text-green-600 font-dm-sans">{fmt(item.amount_paid)}</span>
                      ) : (
                        <span className="text-sm text-gray-400 font-dm-sans">NO</span>
                      )}
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-[#1A1A1A] font-dm-sans">{fmt(item.outstanding)}</span>
                      {item.amount_paid > 0 && (
                        <div className="w-20 h-1 bg-gray-200 rounded-full mt-1">
                          <div className="h-1 bg-yellow-400 rounded-full" style={{ width: `${Math.min(100, (item.amount_paid / item.total_amount) * 100)}%` }} />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium font-dm-sans">{dueLabel.date}</p>
                      <p className="text-xs text-gray-400 font-dm-sans">{dueLabel.sub}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 bg-gray-50 border-t border-[#F0F0F0]">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        <div>
                          <h4 className="text-sm font-semibold font-dm-sans text-[#1A1A1A] mb-3">Invoice items ({item.invoice.code})</h4>
                          <div className="space-y-2 text-sm font-dm-sans text-gray-600">
                            <div className="flex justify-between py-1 border-b border-gray-200">
                              <span className="text-gray-400">Invoice Total</span>
                              <span className="font-medium text-[#1A1A1A]">{fmt(item.total_amount)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200">
                              <span className="text-gray-400">Amount Paid</span>
                              <span className="font-medium text-green-600">{fmt(item.amount_paid)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-400">Outstanding</span>
                              <span className="font-semibold text-[#0A6DC0]">{fmt(item.outstanding)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold font-dm-sans text-[#1A1A1A] mb-3">Payment activity</h4>
                          {item.payment_history.length === 0 ? (
                            <p className="text-sm text-gray-400 font-dm-sans">No payments logged yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {item.payment_history.map((ph, idx) => {
                                const paymentType = ph.paymentType || ph.payment_type || "Unknown";
                                const formattedType = paymentType.charAt(0).toUpperCase() + paymentType.slice(1).toLowerCase().replace("_", " ");

                                return (
                                  <div key={idx} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                      <Check size={11} className="text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-[#1A1A1A] font-dm-sans">{fmt(ph.amount)}</p>
                                      <p className="text-xs text-gray-400 font-dm-sans">
                                        {new Date(ph.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {formattedType}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex gap-3 mt-4">
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); openPayModal(item); }}
                              className="bg-[#0A6DC0] hover:bg-[#085a9e] text-white gap-2 font-dm-sans"
                            >
                              <Plus size={14} /> Log Payment
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2 font-dm-sans text-gray-600">
                              Send Reminder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Log Payment Modal */}
      <AlertDialog open={showPayModal} onOpenChange={(open) => { if (payLoadingType) return; setShowPayModal(open); }}>
        <AlertDialogContent className="bg-white max-w-md">
          {paymentStep === "select" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-clash">Log Payment</AlertDialogTitle>
                <AlertDialogDescription className="font-dm-sans">
                  Record a payment for{" "}
                  <span className="font-semibold text-[#1A1A1A]">{selectedLedger?.customer.name}</span>
                  {" "}— outstanding:{" "}
                  <span className="font-semibold text-[#0A6DC0]">{fmt(selectedLedger?.outstanding ?? 0)}</span>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="mt-2">
                <Label className="font-medium text-[#2F2F2F] mb-2 block font-dm-sans">
                  Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="border border-gray-300 focus:border-[#0A6DC0]"
                />
              </div>

              <Separator className="my-4" />
              <p className="text-sm font-medium font-dm-sans text-[#2F2F2F] mb-3">Select payment method</p>

              <AlertDialogFooter className="flex-col gap-3 sm:flex-col">
                <Button onClick={() => handleRecordPayment("CASH")} disabled={payLoadingType !== null} className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-dm-sans">
                  {payLoadingType === "CASH" ? <><ClipLoader size={16} color="white" className="mr-2" /> Processing...</> : "💵 Pay with Cash"}
                </Button>
                <Button onClick={() => handleRecordPayment("TRANSFER")} disabled={payLoadingType !== null} variant="outline" className="w-full font-dm-sans">
                  {payLoadingType === "TRANSFER" ? <><ClipLoader size={16} color="#0A6DC0" className="mr-2" /> Processing...</> : "🏦 Pay with Transfer"}
                </Button>
                <Button variant="ghost" disabled={payLoadingType !== null} onClick={() => setShowPayModal(false)} className="w-full text-gray-500 font-dm-sans">
                  Cancel
                </Button>
              </AlertDialogFooter>
            </>
          )}

          {paymentStep === "transfer-details" && transferDetails && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-clash">Bank Transfer Details</AlertDialogTitle>
                <AlertDialogDescription className="font-dm-sans">
                  Please transfer the exact amount to the account below
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-3 mt-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm font-dm-sans">Amount to Pay</p>
                  <p className="font-bold text-2xl text-[#0A6DC0] font-clash">{fmt(transferDetails.expectedAmount)}</p>
                </div>

                {[
                  { label: "Account Number", key: "accountNumber" as const },
                  { label: "Account Name", key: "accountName" as const },
                ].map(({ label, key }) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="text-gray-600 text-sm font-dm-sans">{label}</p>
                      <p className="font-medium font-dm-sans">{transferDetails[key] || "N/A"}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(transferDetails[key] || "", key)} className="text-[#0A6DC0]">
                      {copiedField === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm font-dm-sans">Bank</p>
                  <p className="font-medium font-dm-sans">{transferDetails.bankName || "N/A"}</p>
                </div>

                {transferDetails.paymentReference && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm font-dm-sans">Reference</p>
                    <p className="font-mono text-xs break-all">{transferDetails.paymentReference}</p>
                  </div>
                )}

                {transferDetails.expiresAt && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-700 text-sm font-dm-sans">
                      Expires: {new Date(transferDetails.expiresAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button variant="outline" onClick={() => setPaymentStep("select")} className="font-dm-sans">
                  Back
                </Button>
                <Button onClick={() => { setShowPayModal(false); toast.success("Payment recorded! We'll confirm shortly."); fetchLedgers(); }} className="bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-dm-sans">
                  I have sent the money
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value, sub, borderColor }: { label: string; value: string; sub: string; borderColor: string }) {
  return (
    <div className={`bg-white border border-[#E4E4E4] rounded-xl p-4 border-t-4 ${borderColor}`}>
      <p className="text-sm text-[#9E9A9A] font-dm-sans">{label}</p>
      <p className="text-2xl font-bold font-clash text-[#1A1A1A] mt-1">{value}</p>
      <p className="text-xs text-[#9E9A9A] font-dm-sans mt-1">{sub}</p>
    </div>
  );
}