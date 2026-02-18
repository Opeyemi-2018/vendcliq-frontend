"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { getSales, getTotalSales, getPurchaseRequest } from "@/lib/utils/api/apiHelper";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  EyeOff,
  Eye,
  CalendarIcon,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { SupplierSalesMedium, SupplierSalesResponse } from "@/types/sales";
import { Button } from "@/components/ui/button";

type InvoiceItem = {
  id: string;
  code: string;
  total: number;
  status: string;
  created_at: string;
};

type DisplayTransaction = {
  id: string;
  code: string;
  date: string;
  amount: number;
  status: string;
};

const Home = () => {
  const router = useRouter();

  const [showBalance, setShowBalance] = useState(true);

  // Date filter modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Sales data
  const [totalSales, setTotalSales] = useState<number>(0);
  const [mediumBreakdown, setMediumBreakdown] = useState<SupplierSalesMedium>({});
  const [salesLoading, setSalesLoading] = useState(true);

  // Medium modal
  const [mediumModalOpen, setMediumModalOpen] = useState(false);

  // Recent sales & purchases
  const [sales, setSales] = useState<InvoiceItem[]>([]);
  const [purchases, setPurchases] = useState<InvoiceItem[]>([]);
  const [salesLoadingRecent, setSalesLoadingRecent] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(true);

  // Set default date range: last 30 days → today
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

    setStartDate(thirtyDaysAgo);
    setEndDate(today);
    setTempStartDate(thirtyDaysAgo);
    setTempEndDate(today);
  }, []);

  // Fetch total + medium breakdown
  useEffect(() => {
    const fetchSalesData = async () => {
      if (!startDate || !endDate) return;

      setSalesLoading(true);
      try {
        const salesData: SupplierSalesResponse = await getTotalSales(
          startDate,
          endDate,
        );

        setTotalSales(salesData.total_sales ?? 0);
        setMediumBreakdown(salesData.medium ?? {});
      } catch (err) {
        console.error("Failed to fetch sales data:", err);
        toast.error("Could not load sales data");
      } finally {
        setSalesLoading(false);
      }
    };

    fetchSalesData();
  }, [startDate, endDate]);

  // Fetch recent sales (latest 10, then show first 2)
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setSalesLoadingRecent(true);
        const salesRes = await getSales(); // No pagination
        const recent = Array.isArray(salesRes) ? salesRes.slice(0, 10) : [];
        setSales(recent);
      } catch (err) {
        console.error("Failed to load sales invoices:", err);
        setSales([]);
      } finally {
        setSalesLoadingRecent(false);
      }
    };

    fetchSales();
  }, []);

  // Fetch recent purchases
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setPurchasesLoading(true);
        const purchaseRes = await getPurchaseRequest(); 
        const recent = Array.isArray(purchaseRes) ? purchaseRes.slice(0, 10) : [];
        setPurchases(recent);
      } catch (err) {
        console.error("Failed to load purchase invoices:", err);
        setPurchases([]);
      } finally {
        setPurchasesLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const formatDate = (isoString: string): string => {
    try {
      return format(new Date(isoString), "MMM dd, yyyy");
    } catch {
      return "—";
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed" || s === "paid") return "text-[#003909] bg-[#E7F4EB]";
    if (s === "pending") return "text-[#F5B102] bg-[#f6f6f5]";
    return "text-gray-600 bg-gray-100";
  };

  const renderTransaction = (tx: DisplayTransaction, index: number) => (
    <div
      key={`${tx.id}-${index}`}
      onClick={() => router.push(`/inventory/sales/${tx.id}`)}
      className="p-1 md:p-3 rounded-xl border border-[#D8D8D866] mb-4 bg-white cursor-pointer hover:bg-gray-50 transition"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {tx.status.toLowerCase() === "pending" ? (
            <Image src="/pending.svg" height={40} width={40} alt="pending" />
          ) : (
            <Image
              src="/invoice-in.svg"
              height={40}
              width={40}
              alt="completed"
            />
          )}

          <div className="space-y-0.5">
            <h1 className="text-[13px] md:text-[15px] font-medium text-[#2F2F2F]">
              {tx.code}
            </h1>
            <p className="text-[13px] text-[#9E9A9A]">{tx.date}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[13px] md:text-[15px] font-medium text-[#464343]">
            {tx.amount.toLocaleString("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 0,
            })}
          </p>

          <p
            className={cn(
              "text-[12px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-1",
              getStatusStyle(tx.status),
            )}
          >
            {tx.status.charAt(0).toUpperCase() +
              tx.status.slice(1).toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );

  const displayedSales = sales.slice(0, 2).map((inv) => ({
    id: inv.id,
    code: inv.code,
    date: formatDate(inv.created_at),
    amount: inv.total,
    status: inv.status,
  }));

  const displayedPurchases = purchases.slice(0, 2).map((inv) => ({
    id: inv.id,
    code: inv.code,
    date: formatDate(inv.created_at),
    amount: inv.total,
    status: inv.status,
  }));

  const displayDateRange = () => {
    if (!startDate || !endDate) return "Select date range";
    return `${format(new Date(startDate), "MMM dd, yyyy")} - ${format(new Date(endDate), "MMM dd, yyyy")}`;
  };

  const handleApplyDateFilter = () => {
    if (tempStartDate && tempEndDate && tempStartDate <= tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      setDateModalOpen(false);
    } else {
      toast.error("Please select a valid date range");
    }
  };

  return (
    <div className="">
      <h1 className="text-[20px] md:text-[25px] font-bold font-dm-sans text-[#2F2F2F]">
        Inventory
      </h1>

      {/* Total Sales Banner */}
      <div className="bg-[url('/blue.svg')] bg-no-repeat bg-cover bg-center flex flex-col justify-between p-3 md:p-6 overflow-hidden h-[218px] mt-3 rounded-2xl">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="justify-between h-full flex flex-col">
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-3">
                <p className="text-[14px] md:text-[16px] text-white">
                  Total Sales
                </p>
                <button
                  className="text-white"
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff size={21} /> : <Eye size={23} />}
                </button>
              </div>

              <div className="min-h-[40px] md:min-h-[52px] flex items-center">
                {salesLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                    <h1 className="font-clash text-white">Loading...</h1>
                  </div>
                ) : showBalance ? (
                  <h1 className="text-[28px] font-clash font-bold text-white">
                    ****
                  </h1>
                ) : (
                  <h1 className="text-[18px] md:text-[28px] font-clash font-bold text-white">
                    ₦
                    {totalSales.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </h1>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 md:pt-6">
            <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal h-10 px-2 md:px-3 text-[13px] md:text-[16px] bg-white/90 w-full sm:w-auto",
                  !startDate && "text-muted-foreground",
                )}
                onClick={() => setDateModalOpen(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {displayDateRange()}
              </Button>

              <DialogContent className="max-w-[90vw] mx-auto sm:max-w-[425px] rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-[#0E0E0F] text-[16px] md:text-[18px] font-bold font-dm-sans">
                    Filter by Date Range
                  </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="start" className="text-right">
                      From
                    </Label>
                    <Input
                      id="start"
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="bg-[#FAFAFA]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end" className="text-right">
                      To
                    </Label>
                    <Input
                      id="end"
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="bg-[#FAFAFA]"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleApplyDateFilter}
                    className="bg-[#0A6DC0] hover:bg-[#085a9e] w-full"
                  >
                    Apply
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center gap-3 md:justify-start justify-between text-white text-[14px] md:text-[16px]">
          <button
            onClick={() => router.push("/inventory/sales-breakdown")}
            className="flex text-[13px] md:text-[16px] whitespace-nowrap md:gap-2 items-center hover:underline"
          >
            Breakdown by Store <ChevronRight className="size-4 md:size-6" />
          </button>
          <button
            className="flex text-[13px] md:text-[16px] whitespace-nowrap md:gap-2 items-center hover:underline"
            onClick={() => setMediumModalOpen(true)}
          >
            Breakdown by Medium <ChevronRight className="size-4 md:size-6" />
          </button>
        </div>
      </div>

      {/* Medium Breakdown Modal */}
      <Dialog open={mediumModalOpen} onOpenChange={setMediumModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] font-dm-sans text-[#2F2F2F] rounded-xl bg-white">
          <DialogHeader>
            <DialogTitle className="md:text-[21px] font-bold">
              Sales Breakdown by Medium
            </DialogTitle>
            <p className="text-sm text-gray-500">{displayDateRange()}</p>
          </DialogHeader>

          <div className="py-6">
            {salesLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#0A6DC0]" />
              </div>
            ) : Object.keys(mediumBreakdown).length > 0 ? (
              <div className="grid gap-4">
                {Object.entries(mediumBreakdown).map(([medium, amount]) => (
                  <div
                    key={medium}
                    className="flex justify-between text-[#2F2F2F] items-center p-4 rounded-lg border border-[#D8D8D866]"
                  >
                    <span className="text-[18px] font-medium capitalize">
                      {medium.toLowerCase()}
                    </span>
                    <span className="text-[14px] font-regular">
                      ₦{(amount ?? 0).toLocaleString("en-NG")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">
                No sales data available for this period
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="mt-6">
        <h1 className="font-bold text-[16px] font-dm-sans text-[#2F2F2F]">
          Quick Actions
        </h1>
        <div className="mt-4 flex items-center gap-4">
          <Button
            onClick={() => router.push("/inventory/sell")}
            className="bg-[#0A6DC0] hover:bg-[#09599a] w-full text-[16px] flex gap-2 px-6 py-5 md:py-6 text-white"
          >
            <Image src="/sell.svg" height={20} width={20} alt="sell" /> Sell
          </Button>
          <Button
            onClick={() => router.push("/inventory/buy")}
            className="bg-[#0A2540] hover:bg-[#304c6a] w-full text-[16px] flex gap-2 px-6 py-5 md:py-6 text-white"
          >
            <Image src="/buy.svg" height={20} width={20} alt="buy" /> Buy
          </Button>
          <Button
            onClick={() => router.push("/inventory/my-store")}
            variant="outline"
            className="bg-white w-full text-[16px] flex gap-2 px-6 py-5 md:py-6 text-[#2F2F2F]"
          >
            <Image src="/store.svg" height={20} width={20} alt="store" /> My
            Store
          </Button>
        </div>
      </div>

      {/* Sales & Purchases Sections */}
      <div className="mt-5 flex flex-col lg:flex-row gap-5">
        {/* Sales Transactions */}
        <div className="p-3 lg:p-6 border border-[#E4E4E4] rounded-[20px] bg-white w-full lg:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[16px]">Sales Transactions</h2>
            <Link
              href="/inventory/sales"
              className="font-bold text-[13px] text-[#0A6DC0] hover:underline"
            >
              see all
            </Link>
          </div>

          {salesLoadingRecent ? (
            <p className="text-center text-gray-500 py-6">Loading sales...</p>
          ) : displayedSales.length > 0 ? (
            displayedSales.map(renderTransaction)
          ) : (
            <p className="text-center text-gray-500 py-6">No recent sales</p>
          )}
        </div>

        {/* Purchase Requests */}
        <div className="p-3 lg:p-6 border border-[#E4E4E4] rounded-[20px] bg-white w-full lg:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[16px]">Purchase Requests</h2>
            <Link
              href="/inventory/purchase-request"
              className="font-bold text-[13px] text-[#0A6DC0] hover:underline"
            >
              see all
            </Link>
          </div>

          {purchasesLoading ? (
            <p className="text-center text-gray-500 py-6">
              Loading purchases...
            </p>
          ) : displayedPurchases.length > 0 ? (
            displayedPurchases.map(renderTransaction)
          ) : (
            <p className="text-center text-gray-500 py-6">
              No recent purchases
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;