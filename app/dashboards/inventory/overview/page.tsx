"use client";

import { Button } from "@/components/ui/button";
import { EyeOff, Eye, CalendarIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getPurchaseRequest, getSales, getTotalSales } from "@/lib/utils/api/apiHelper";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useUser } from "@/context/userContext";
import { toast } from "sonner";

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
  const { user } = useUser();
  const router = useRouter();

  const [showBalance, setShowBalance] = useState(true);

  // Date filter modal
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Total sales state
  const [totalSales, setTotalSales] = useState<number>(0);
  const [salesLoading, setSalesLoading] = useState(true);

  // Recent sales & purchases
  const [sales, setSales] = useState<InvoiceItem[]>([]);
  const [purchases, setPurchases] = useState<InvoiceItem[]>([]);
  const [salesLoadingRecent, setSalesLoadingRecent] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(true);

  useEffect(() => {
    if (user?.createdAt) {
  const created = new Date(user.createdAt);
      const userCreatedDate = format(created, "yyyy-MM-dd");
      const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

      setStartDate(userCreatedDate);
      setEndDate(yesterday);
      setTempStartDate(userCreatedDate);
      setTempEndDate(yesterday);
    }
  }, [user]);

  // Fetch total sales when dates are set
  useEffect(() => {
    const fetchTotal = async () => {
      if (!startDate || !endDate) return;

      setSalesLoading(true);
      try {
        const total = await getTotalSales(startDate, endDate);
        setTotalSales(total);
      } catch (err) {
        console.error("Failed to fetch total sales:", err);
        toast.error("Could not load total sales");
      } finally {
        setSalesLoading(false);
      }
    };

    fetchTotal();
  }, [startDate, endDate]);

  // Fetch recent sales invoices
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setSalesLoadingRecent(true);
        const salesRes = await getSales(1, 10);
        setSales(salesRes.data || []);
      } catch (err) {
        console.error("Failed to load sales invoices:", err);
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
        const purchaseRes = await getPurchaseRequest(1, 10);
        setPurchases(purchaseRes.data || []);
      } catch (err) {
        console.error("Failed to load purchase invoices:", err);
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
      className="p-1 md:p-3 rounded-xl border border-[#D8D8D866] mb-4 bg-white"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {tx.status.toLowerCase() === "pending" ? (
            <Image src="/pending.svg" height={40} width={40} alt="pending" />
          ) : (
            <Image src="/invoice-in.svg" height={40} width={40} alt="completed" />
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
              getStatusStyle(tx.status)
            )}
          >
            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase()}
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

      {/* Total Sales Banner + Date Filter Modal */}
      <div className="bg-[url('/blue.svg')] bg-no-repeat bg-cover bg-center p-6 overflow-hidden h-[218px] mt-3 flex flex-col md:flex-row justify-between rounded-2xl">
        <div className="max-w-[50rem] justify-between h-full flex flex-col">
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3">
              <p className="text-white">Total Sales</p>
              <button
                className="text-white"
                type="button"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <EyeOff size={21} /> : <Eye size={23} />}
              </button>
            </div>

            {salesLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <h1 className="font-clash  text-white">Loading...</h1>
              </div>
            ) : showBalance ? (
              <h1 className="text-[28px] font-clash font-bold text-white">****</h1>
            ) : (
              <h1 className="text-[28px] font-clash font-bold text-white">
                ₦{totalSales.toLocaleString("en-NG")}
              </h1>
            )}
          </div>
        </div>

        <div className="pt-6">
          <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-10 px-3 bg-white/90 w-full sm:w-auto",
                !startDate && "text-muted-foreground"
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

      {/* Quick Actions */}
      <div className="mt-6">
        <h1 className="font-bold text-[16px] font-dm-sans text-[#2F2F2F]">
          Quick Actions
        </h1>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
          <Button
            onClick={() => router.push("/dashboards/inventory/sell")}
            className="bg-[#0A6DC0] hover:bg-[#09599a] w-full text-[16px] flex gap-2 px-6 py-5 md:py-6 text-white"
          >
            <Image src="/sell.svg" height={20} width={20} alt="sell" /> Sell
          </Button>
          <Button
            onClick={() => router.push("/dashboards/inventory/buy")}
            className="bg-[#0A2540] hover:bg-[#304c6a] w-full text-[16px] flex gap-2 px-6 py-5 md:py-6 text-white"
          >
            <Image src="/buy.svg" height={20} width={20} alt="buy" /> Buy
          </Button>
          <Button
            onClick={() => router.push("/dashboards/inventory/my-store")}
            variant="outline"
            className="bg-white w-full text-[16px] flex gap-2 px-6 py-5 md:py-6 text-[#2F2F2F]"
          >
            <Image src="/store.svg" height={20} width={20} alt="store" /> My Store
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
              href="/dashboards/inventory/sales"
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
              href="/dashboards/inventory/purchase-request"
              className="font-bold text-[13px] text-[#0A6DC0] hover:underline"
            >
              see all
            </Link>
          </div>

          {purchasesLoading ? (
            <p className="text-center text-gray-500 py-6">Loading purchases...</p>
          ) : displayedPurchases.length > 0 ? (
            displayedPurchases.map(renderTransaction)
          ) : (
            <p className="text-center text-gray-500 py-6">No recent purchases</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;