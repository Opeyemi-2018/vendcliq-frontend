/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ClipLoader } from "react-spinners";
import {
  Check,
  Copy,
  Search,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getCreditLedger,
  recordCreditPayment,
  getCreditLedgerSummary,
  getInvoiceById,
} from "@/lib/utils/api/apiHelper";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────
interface PaymentHistory {
  amount: number;
  paid_at: string;
  narration: string | null;
  recorded_by: number;
  payment_type?: string;
  paymentType?: string;
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

interface InvoiceItem {
  id: string;
  quantity: string;
  cost: number;
  sub_total: number;
  mode: string;
  product: { id: string; name: string; image: string } | null;
  stock: { id: string; sku: string; qty: string; price: number };
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
type FilterTab = "All" | "Overdue" | "Due Soon" | "Pending" | "Completed";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₦${n.toLocaleString()}`;

const getStatusStyle = (status: string, dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (status === "COMPLETED")
    return {
      label: "Completed",
      bg: "bg-green-100 text-green-700",
      dot: "bg-green-500",
    };
  if (diffDays < 0)
    return {
      label: "Overdue",
      bg: "bg-red-100 text-red-700",
      dot: "bg-red-500",
    };
  if (diffDays <= 7)
    return {
      label: "Due Soon",
      bg: "bg-yellow-100 text-yellow-700",
      dot: "bg-yellow-400",
    };
  return {
    label: "Pending",
    bg: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  };
};

const getDueLabel = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const formatted = due.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  if (diffDays < 0)
    return { date: formatted, sub: `Overdue by ${Math.abs(diffDays)}d` };
  if (diffDays === 0) return { date: formatted, sub: "Due today" };
  return { date: formatted, sub: `Due in ${diffDays}d` };
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const avatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function CreditLedger() {
  const [ledgers, setLedgers] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [invoiceItems, setInvoiceItems] = useState<
    Record<string, InvoiceItem[]>
  >({});
  const [invoiceItemsLoading, setInvoiceItemsLoading] = useState<
    Record<string, boolean>
  >({});

  // Summary
  const [summary, setSummary] = useState({
    total_outstanding: 0,
    active_credits: 0,
    overdue: 0,
    overdue_customers: 0,
    due_this_week: 0,
    due_this_week_reminders: 0,
    recovered_this_month: 0,
    recovered_this_month_count: 0,
  });

  // Log Payment modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState<LedgerItem | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentModalStep>("select");
  const [payAmount, setPayAmount] = useState("");
  const [payLoadingType, setPayLoadingType] = useState<
    "CASH" | "TRANSFER" | null
  >(null);
  const [transferDetails, setTransferDetails] =
    useState<TransferDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ledgerRes, summaryRes] = await Promise.all([
        getCreditLedger(),
        getCreditLedgerSummary(),
      ]);
      if (ledgerRes.statusCode === 200) setLedgers(ledgerRes.data);
      else toast.error("Failed to load credit ledger");
      if (summaryRes.statusCode === 200) setSummary(summaryRes.data);
    } catch {
      toast.error("Error loading credit ledger");
    } finally {
      setLoading(false);
    }
  };

  const handleRowExpand = async (item: LedgerItem) => {
    const isExpanded = expandedRow === item.uuid;
    setExpandedRow(isExpanded ? null : item.uuid);

    // Fetch invoice items if not already loaded
    if (!isExpanded && !invoiceItems[item.uuid]) {
      setInvoiceItemsLoading((prev) => ({ ...prev, [item.uuid]: true }));
      try {
        const res = await getInvoiceById(item.invoice.uuid);
        if (res.statusCode === 200) {
          setInvoiceItems((prev) => ({ ...prev, [item.uuid]: res.data.items }));
        }
      } catch {
        // silently fail — table will show empty state
      } finally {
        setInvoiceItemsLoading((prev) => ({ ...prev, [item.uuid]: false }));
      }
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
        paymentType: type,
      });
      if (res.statusCode === 200 || res.statusCode === 201) {
        if (type === "TRANSFER" && res.data?.paymentPayload) {
          setTransferDetails(res.data.paymentPayload);
          setPaymentStep("transfer-details");
        } else {
          toast.success(res.data?.message || "Payment recorded successfully!");
          setShowPayModal(false);
          fetchAll();
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
    const diffDays = Math.ceil(
      (new Date(l.due_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const matchSearch =
      l.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.invoice.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (filterTab === "All") return true;
    if (filterTab === "Overdue")
      return diffDays < 0 && l.status !== "COMPLETED";
    if (filterTab === "Due Soon")
      return diffDays >= 0 && diffDays <= 7 && l.status !== "COMPLETED";
    if (filterTab === "Pending") return l.status === "PENDING";
    if (filterTab === "Completed") return l.status === "COMPLETED";
    return true;
  });

  const countByTab = (tab: FilterTab) => {
    if (tab === "All") return ledgers.length;
    return ledgers.filter((l) => {
      const diffDays = Math.ceil(
        (new Date(l.due_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (tab === "Overdue") return diffDays < 0 && l.status !== "COMPLETED";
      if (tab === "Due Soon")
        return diffDays >= 0 && diffDays <= 7 && l.status !== "COMPLETED";
      if (tab === "Pending") return l.status === "PENDING";
      if (tab === "Completed") return l.status === "COMPLETED";
      return false;
    }).length;
  };

  return (
    <div className="py-6 px-0">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-clash font-semibold text-[28px] text-[#1A1A1A]">
          Credit Ledger
        </h1>
        <p className="text-sm text-[#9E9A9A] font-dm-sans mt-1">
          All authorized credit sales
        </p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Outstanding"
          value={fmt(summary.total_outstanding)}
          sub={`${summary.active_credits} active credits`}
          borderColor="border-t-blue-500"
        />
        <StatCard
          label="Overdue"
          value={fmt(summary.overdue)}
          sub={`${summary.overdue_customers} customers`}
          borderColor="border-t-red-500"
        />
        <StatCard
          label="Due This Week"
          value={fmt(summary.due_this_week)}
          sub={`${summary.due_this_week_reminders} reminders sent`}
          borderColor="border-t-yellow-400"
        />
        <StatCard
          label="Recovered (This Month)"
          value={fmt(summary.recovered_this_month)}
          sub={`${summary.recovered_this_month_count} credits cleared`}
          borderColor="border-t-green-500"
        />
      </div>

      {/* ── Table section ── */}
      <div className="bg-white border border-[#E4E4E4] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E4E4]">
          <div>
            <h2 className="font-clash font-semibold text-lg text-[#1A1A1A]">
              Credit Ledger
            </h2>
            <p className="text-xs text-[#9E9A9A] font-dm-sans mt-0.5">
              All credit sales authorized through Vendcliq
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="Search customer or invoice"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A6DC0] w-full sm:w-56 font-dm-sans"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-dm-sans text-xs"
            >
              <Download size={13} /> Export
            </Button>
            {/* <Button
              size="sm"
              className="gap-1.5 bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-dm-sans text-xs"
            >
              <Plus size={13} /> Record Payment
            </Button> */}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 md:px-5 pt-3 pb-0 flex gap-2 flex-wrap border-b border-[#F0F0F0] pb-3">
          {(
            [
              "All",
              "Overdue",
              "Due Soon",
              "Pending",
              "Completed",
            ] as FilterTab[]
          ).map((tab) => {
            const count = countByTab(tab);
            const dotColor =
              tab === "Overdue"
                ? "bg-red-500"
                : tab === "Due Soon"
                  ? "bg-yellow-400"
                  : tab === "Completed"
                    ? "bg-green-500"
                    : tab === "Pending"
                      ? "bg-blue-500"
                      : "";
            const active = filterTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-dm-sans font-medium border transition-all ${
                  active
                    ? "border-[#0A6DC0] text-[#0A6DC0] bg-[#0A6DC008]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {dotColor && (
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                )}
                {tab}{" "}
                <span
                  className={`${active ? "text-[#0A6DC0]" : "text-gray-400"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] px-5 py-2.5 bg-gray-50 border-b border-[#E4E4E4]">
          {[
            "CUSTOMER",
            "INVOICE",
            "TOTAL",
            "PAID",
            "OUTSTANDING",
            "DUE DATE",
            "STATUS",
          ].map((h) => (
            <span
              key={h}
              className="text-[10px] font-semibold text-gray-500 tracking-wider font-dm-sans"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <ClipLoader color="#0A6DC0" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-dm-sans text-sm">
            No credit records found.
          </div>
        ) : (
          filtered.map((item) => {
            const status = getStatusStyle(item.status, item.due_date);
            const dueLabel = getDueLabel(item.due_date);
            const isExpanded = expandedRow === item.uuid;
            const initials = getInitials(item.customer.name);
            const avatarBg = avatarColor(item.customer.name);
            const items = invoiceItems[item.uuid] || [];
            const itemsLoading = invoiceItemsLoading[item.uuid] || false;

            return (
              <div
                key={item.uuid}
                className="border-b border-[#F0F0F0] last:border-b-0"
              >
                {/* ── Desktop row ── */}
                <div
                  className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_1fr] px-5 py-4 items-center cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={() => handleRowExpand(item)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A] font-dm-sans leading-tight">
                        {item.customer.name}
                      </p>
                      <p className="text-xs text-gray-400 font-dm-sans">
                        {item.customer.phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 font-dm-sans">
                    {item.invoice.code}
                  </span>
                  <span className="text-sm font-medium font-dm-sans">
                    {fmt(item.total_amount)}
                  </span>
                  <div>
                    {item.amount_paid > 0 ? (
                      <span className="text-sm font-medium text-green-600 font-dm-sans">
                        {fmt(item.amount_paid)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 font-dm-sans">
                        —
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#1A1A1A] font-dm-sans">
                      {fmt(item.outstanding)}
                    </span>
                    {item.amount_paid > 0 && (
                      <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-1 bg-yellow-400 rounded-full"
                          style={{
                            width: `${Math.min(100, (item.amount_paid / item.total_amount) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium font-dm-sans">
                      {dueLabel.date}
                    </p>
                    <p className="text-xs text-gray-400 font-dm-sans">
                      {dueLabel.sub}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={15} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={15} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* ── Mobile row ── */}
                <div
                  className="md:hidden px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleRowExpand(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A] font-dm-sans">
                          {item.customer.name}
                        </p>
                        <p className="text-xs text-gray-400 font-dm-sans">
                          {item.invoice.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-[10px] text-gray-400 font-dm-sans">
                        Total
                      </p>
                      <p className="text-sm font-semibold font-dm-sans">
                        {fmt(item.total_amount)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-[10px] text-gray-400 font-dm-sans">
                        Paid
                      </p>
                      <p className="text-sm font-semibold text-green-600 font-dm-sans">
                        {item.amount_paid > 0 ? fmt(item.amount_paid) : "—"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-[10px] text-gray-400 font-dm-sans">
                        Outstanding
                      </p>
                      <p className="text-sm font-semibold text-[#0A6DC0] font-dm-sans">
                        {fmt(item.outstanding)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-dm-sans">
                      {dueLabel.date} · {dueLabel.sub}
                    </p>
                  </div>
                </div>

                {/* ── Expanded panel ── */}
                {isExpanded && (
                  <div className="bg-gray-50/60 border-t border-[#F0F0F0] px-4 md:px-5 pb-5 pt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 items-start">
                      {/* LEFT: Invoice Items */}
                      <div className="bg-white rounded-xl border border-[#E4E4E4] p-4 ">
                        <h4 className="text-sm font-semibold font-dm-sans text-[#1A1A1A] mb-3 flex items-center gap-2">
                          <Package size={14} className="text-[#0A6DC0]" />
                          Invoice Items
                          <span className="text-xs font-normal text-gray-400">
                            ({item.invoice.code})
                          </span>
                        </h4>

                        {itemsLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <ClipLoader color="#0A6DC0" size={20} />
                          </div>
                        ) : items.length === 0 ? (
                          <p className="text-sm text-gray-400 font-dm-sans py-4 text-center">
                            No items found.
                          </p>
                        ) : (
                          <>
                            {/* Header */}
                            <div className="grid grid-cols-[minmax(0,1fr)_48px_72px_72px] gap-2 px-2 py-1.5 bg-gray-50 rounded-lg mb-2">
                              <span className="text-[10px] font-semibold text-gray-500 tracking-wide font-dm-sans">
                                PRODUCT / SKU
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500 tracking-wide font-dm-sans text-center">
                                QTY
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500 tracking-wide font-dm-sans text-right">
                                PRICE
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500 tracking-wide font-dm-sans text-right">
                                TOTAL
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {items.map((inv, idx) => (
                                <div
                                  key={idx}
                                  className="grid grid-cols-[minmax(0,1fr)_48px_72px_72px] gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors items-center"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {inv.product?.image ? (
                                      <Image height={32} width={32}
                                        src={inv.product.image}
                                        alt={inv.stock.sku}
                                        className="w-8 h-8 rounded-md object-contain border border-gray-100 flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Package
                                          size={12}
                                          className="text-gray-400"
                                        />
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-[#1A1A1A] font-dm-sans truncate">
                                        {inv.product?.name || inv.stock.sku}
                                      </p>
                                      <p className="text-[10px] text-gray-400 font-dm-sans truncate">
                                        {inv.stock.sku}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-medium font-dm-sans text-center w-10">
                                    {parseFloat(inv.quantity).toFixed(0)}{" "}
                                    {inv.mode === "PACKS" ? "pk" : "pc"}
                                  </span>
                                  <span className="text-xs text-gray-600 font-dm-sans text-right w-16">
                                    {fmt(inv.cost)}
                                  </span>
                                  <span className="text-xs font-semibold text-[#1A1A1A] font-dm-sans text-right w-16">
                                    {fmt(inv.sub_total)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                              <span className="text-xs text-gray-500 font-dm-sans">
                                Invoice Total
                              </span>
                              <span className="text-sm font-bold text-[#0A6DC0] font-dm-sans">
                                {fmt(item.total_amount)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* RIGHT: Payment Activity */}
                      <div className="bg-white rounded-xl border border-[#E4E4E4] p-4 flex flex-col">
                        <h4 className="text-sm font-semibold font-dm-sans text-[#1A1A1A] mb-3">
                          Payment activity
                        </h4>

                        {item.payment_history.length === 0 ? (
                          <p className="text-sm text-gray-400 font-dm-sans flex-1">
                            No payments logged yet.
                          </p>
                        ) : (
                          <div className="space-y-2 flex-1 overflow-y-auto max-h-48">
                            {item.payment_history.map((ph, idx) => {
                              const pType =
                                ph.paymentType || ph.payment_type || "Unknown";
                              const formatted =
                                pType.charAt(0).toUpperCase() +
                                pType.slice(1).toLowerCase().replace("_", " ");
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2.5 bg-[#0A6DC01A] rounded-lg px-3 py-2"
                                >
                                  <div className="w-5 h-5 rounded-full bg-[#0A6DC0] flex items-center justify-center flex-shrink-0">
                                    <Check
                                      size={10}
                                      className="text-white"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#1A1A1A] font-dm-sans">
                                      {fmt(ph.amount)}
                                    </p>
                                    <p className="text-xs  font-dm-sans">
                                      {new Date(ph.paid_at).toLocaleDateString(
                                        "en-GB",
                                        { day: "numeric", month: "short" },
                                      )}{" "}
                                      · {formatted}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Summary line */}
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                          <div className="flex justify-between text-xs font-dm-sans">
                            <span className="text-gray-400">Total Paid</span>
                            <span className="font-semibold text-green-600">
                              {fmt(item.amount_paid)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs font-dm-sans">
                            <span className="text-gray-400">Outstanding</span>
                            <span className="font-semibold text-[#0A6DC0]">
                              {fmt(item.outstanding)}
                            </span>
                          </div>
                        </div>

                        {/* Buttons */}
                        {item.status !== "COMPLETED" && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPayModal(item);
                              }}
                              className="flex-1 bg-[#0A6DC0] hover:bg-[#085a9e] text-white gap-1.5 font-dm-sans text-xs"
                            >
                              <Plus size={12} /> Log Payment
                            </Button>
                            {/* <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 font-dm-sans text-xs text-gray-600"
                            >
                              Remind
                            </Button> */}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Log Payment Modal ── */}
      <AlertDialog
        open={showPayModal}
        onOpenChange={(open) => {
          if (payLoadingType) return;
          setShowPayModal(open);
        }}
      >
        <AlertDialogContent className="bg-white max-w-md">
          {paymentStep === "select" && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-clash">
                  Log Payment
                </AlertDialogTitle>
                <AlertDialogDescription className="font-dm-sans">
                  Record a payment for{" "}
                  <span className="font-semibold text-[#1A1A1A]">
                    {selectedLedger?.customer.name}
                  </span>{" "}
                  — outstanding:{" "}
                  <span className="font-semibold text-[#0A6DC0]">
                    {fmt(selectedLedger?.outstanding ?? 0)}
                  </span>
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
              <p className="text-sm font-medium font-dm-sans text-[#2F2F2F] mb-3">
                Select payment method
              </p>

              <AlertDialogFooter className="flex-col gap-3 items-center sm:flex-col">
                <Button
                  onClick={() => handleRecordPayment("CASH")}
                  disabled={payLoadingType !== null}
                  className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-dm-sans"
                >
                  {payLoadingType === "CASH" ? (
                    <>
                      <ClipLoader size={16} color="white" className="mr-2" />{" "}
                      Processing...
                    </>
                  ) : (
                    "Pay with Cash"
                  )}
                </Button>
                <Button
                  onClick={() => handleRecordPayment("TRANSFER")}
                  disabled={payLoadingType !== null}
                  variant="outline"
                  className="w-full font-dm-sans bg-[#0A6DC01A]  hover:bg-[#0A2540] hover:text-white"
                >
                  {payLoadingType === "TRANSFER" ? (
                    <>
                      <ClipLoader size={16} color="#0A6DC0" className="mr-2" />{" "}
                      Processing...
                    </>
                  ) : (
                    "Pay with Transfer"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  disabled={payLoadingType !== null}
                  onClick={() => setShowPayModal(false)}
                  className="w-full text-gray-500 font-dm-sans"
                >
                  Cancel
                </Button>
              </AlertDialogFooter>
            </>
          )}

          {paymentStep === "transfer-details" && transferDetails && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-clash">
                  Bank Transfer Details
                </AlertDialogTitle>
                <AlertDialogDescription className="font-dm-sans">
                  Please transfer the exact amount to the account below
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-3 mt-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-600 text-sm font-dm-sans">
                    Amount to Pay
                  </p>
                  <p className="font-bold text-2xl text-[#0A6DC0] font-clash">
                    {fmt(transferDetails.expectedAmount)}
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
                      <p className="text-gray-600 text-sm font-dm-sans">
                        {label}
                      </p>
                      <p className="font-medium font-dm-sans">
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
                  <p className="text-gray-600 text-sm font-dm-sans">Bank</p>
                  <p className="font-medium font-dm-sans">
                    {transferDetails.bankName || "N/A"}
                  </p>
                </div>
                {transferDetails.paymentReference && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-600 text-sm font-dm-sans">
                      Reference
                    </p>
                    <p className="font-mono text-xs break-all">
                      {transferDetails.paymentReference}
                    </p>
                  </div>
                )}
                {transferDetails.expiresAt && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-700 text-sm font-dm-sans">
                      Expires:{" "}
                      {new Date(transferDetails.expiresAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPaymentStep("select")}
                  className="font-dm-sans"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    setShowPayModal(false);
                    toast.success("Payment recorded! We'll confirm shortly.");
                    fetchAll();
                  }}
                  className="bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-dm-sans"
                >
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

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  borderColor,
}: {
  label: string;
  value: string;
  sub: string;
  borderColor: string;
}) {
  return (
    <div
      className={`bg-white border border-[#E4E4E4] rounded-xl p-4 border-t-4 ${borderColor}`}
    >
      <p className="text-xs text-[#9E9A9A] font-dm-sans">{label}</p>
      <p className="text-xl md:text-2xl font-bold font-clash text-[#1A1A1A] mt-1">
        {value}
      </p>
      <p className="text-xs text-[#9E9A9A] font-dm-sans mt-1">{sub}</p>
    </div>
  );
}
