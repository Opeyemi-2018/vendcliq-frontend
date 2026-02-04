/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UserPen, CalendarIcon, MoveLeft, MoveRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  BusinessReportResponse,
  StockComparisonItem,
} from "@/types/businessReport";
import { handleGetBusinessReportComparison } from "@/lib/utils/api/apiHelper";
import { ThreeDots } from "react-loader-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { format, parseISO, subDays } from "date-fns";

interface TableReportItem {
  id: string;
  storeName: string;
  itemName: string;
  openingQty: number;
  closingQty: number;
  openingEmptyQty: number;
  closingEmptyQty: number;
  totalQtyDiff: number;
  openingStockValue: string;
}

const ReportSkeleton = () => (
  <tr className="animate-pulse">
    <td className="py-4 pl-4">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-48"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-12"></div>
    </td>
    <td className="py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
  </tr>
);

const BusinessReports = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");
  const [dateModalOpen, setDateModalOpen] = useState(false);

  const [selectedStore, setSelectedStore] = useState<string>("all");

  const [reports, setReports] = useState<TableReportItem[]>([]);
  const [filteredReports, setFilteredReports] = useState<TableReportItem[]>([]);
  const [summary, setSummary] = useState<
    BusinessReportResponse["data"]["summary"] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Pagination states (same as Transaction History)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const uniqueStores = useMemo(() => {
    const stores = new Set(reports.map((r) => r.storeName));
    return ["all", ...Array.from(stores).sort()];
  }, [reports]);

  const fetchReport = async (sDate?: string, eDate?: string) => {
    setLoading(true);
    try {
      console.log(
        `[DEBUG] Fetching report → start=${sDate || "none"}, end=${eDate || "none"}`,
      );

      const res = await handleGetBusinessReportComparison(sDate, eDate);

      console.log("[DEBUG] API response status:", res.statusCode);
      console.log("[DEBUG] Has data?", !!res.data);

      if (res.statusCode === 200 && res.data) {
        const { summary, stock_comparison } = res.data;

        console.log("[DEBUG] Summary:", summary);
        console.log("[DEBUG] Stock comparison length:", stock_comparison?.length);

        setSummary(summary);

        const mapped: TableReportItem[] = stock_comparison.map(
          (item: StockComparisonItem) => ({
            id: String(item.stock_id),
            storeName: item.store_name,
            itemName: item.product_name,
            openingQty: item.opening_qty,
            closingQty: item.closing_qty,
            openingEmptyQty: 0,
            closingEmptyQty: 0,
            totalQtyDiff: item.qty_change,
            openingStockValue: `₦${Math.round(item.opening_value).toLocaleString()}`,
          }),
        );

        console.log("[DEBUG] Mapped reports count:", mapped.length);

        if (mapped.length === 0) {
          toast.info("No stock data found for this date range");
        }

        setReports(mapped);
        setFilteredReports(mapped);
        setSelectedStore("all");
        setCurrentPage(1); // Reset to page 1 on new data
        setHasFetched(true);
      } else {
        toast.error(res.error || "Failed to load business report");
      }
    } catch (err: any) {
      console.error("[DEBUG] Fetch error:", err);
      toast.error("Error fetching business report");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch: 3 days ago as single-day range
  useEffect(() => {
    if (hasFetched) return;

    const today = new Date();
    const threeDaysAgo = subDays(today, 3);
    const defaultDate = format(threeDaysAgo, "yyyy-MM-dd");

    console.log(
      "[DEBUG] Initial load → using 3 days ago as single-day range:",
      defaultDate,
    );

    setStartDate(defaultDate);
    setEndDate(defaultDate);
    setTempStartDate(defaultDate);
    setTempEndDate(defaultDate);

    fetchReport(defaultDate, defaultDate);
  }, [hasFetched]);

  // Store filter
  useEffect(() => {
    const filtered =
      selectedStore === "all"
        ? reports
        : reports.filter((r) => r.storeName === selectedStore);

    setFilteredReports(filtered);
    setCurrentPage(1); // Reset pagination when filter changes
  }, [reports, selectedStore]);

  const handleApplyDateFilter = () => {
    if (!tempStartDate || !tempEndDate) {
      toast.error("Please select both dates");
      return;
    }
    if (tempStartDate > tempEndDate) {
      toast.error("Start date cannot be after end date");
      return;
    }

    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    fetchReport(tempStartDate, tempEndDate);
    setDateModalOpen(false);
  };

  // Pagination logic (same as Transaction History)
  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (totalItems <= itemsPerPage) return null; // Hide pagination if ≤ 5 items

    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 ${
            currentPage === i
              ? "bg-[#0A6DC0] text-white hover:bg-[#0A6DC0]"
              : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  const formatCurrency = (value: number) =>
    `₦${Math.round(value).toLocaleString()}`;

  const displayDateRange = () => {
    if (!startDate || !endDate) return "Select date range";
    const s = parseISO(startDate);
    const e = parseISO(endDate);
    if (startDate === endDate) return format(s, "MMM dd, yyyy");
    return `${format(s, "MMM dd, yyyy")} – ${format(e, "MMM dd, yyyy")}`;
  };

  return (
    <div>
      <div className="flex md:items-center justify-between gap-3 md:gap-0 flex-col md:flex-row mb-6">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
            Business Reports
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            View your business key performance reports and stock summaries
          </p>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-3">
          <Dialog open={dateModalOpen} onOpenChange={setDateModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal h-10 px-3 w-[260px] sm:w-auto",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {displayDateRange()}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] mx-auto sm:max-w-[425px] rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-[#0E0E0F] text-[16px] md:text-[18px] font-bold font-dm-sans">
                  Filter by Date Range
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="">
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
                <div className="">
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

          <Select
            value={selectedStore}
            onValueChange={setSelectedStore}
            disabled={loading || reports.length === 0}
          >
            <SelectTrigger className="w-[220px] h-10">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              {uniqueStores.map((store) => (
                <SelectItem key={store} value={store}>
                  {store === "all" ? "All Stores" : store}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6 flex flex-col justify-center">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Opening Stock Value
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {loading ? (
              <div className="flex items-center justify-start">
                <ThreeDots height="30" width="30" color="#FFFFFF" visible={true} />
              </div>
            ) : summary ? (
              formatCurrency(summary.opening_stock_value)
            ) : (
              "—"
            )}
          </h2>
        </div>

        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6 flex flex-col justify-center">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Closing Stock Value
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {loading ? (
              <div className="flex items-center justify-start">
                <ThreeDots height="30" width="30" color="#FFFFFF" visible={true} />
              </div>
            ) : summary ? (
              formatCurrency(summary.closing_stock_value)
            ) : (
              "—"
            )}
          </h2>
        </div>

        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6 flex flex-col justify-center">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Total Invoice Value{" "}
            {loading ? "" : summary ? `(${summary.invoice_count} invoices)` : ""}
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {loading ? (
              <div className="flex items-center justify-start">
                <ThreeDots height="30" width="30" color="#FFFFFF" visible={true} />
              </div>
            ) : summary ? (
              formatCurrency(summary.total_invoice_value)
            ) : (
              "—"
            )}
          </h2>
        </div>

        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6 flex flex-col justify-center">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Profit Generated
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {loading ? (
              <div className="flex items-center justify-start">
                <ThreeDots height="30" width="30" color="#FFFFFF" visible={true} />
              </div>
            ) : summary ? (
              formatCurrency(summary.profit_generated)
            ) : (
              "—"
            )}
          </h2>
        </div>
      </div>

      {/* Table with Pagination */}
      <div className="md:p-6 lg:border bg-white border-[#E4E4E4] rounded-lg">
        <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold flex gap-2 items-center">
          Stock Table Report{" "}
          {loading ? (
            <ThreeDots height="20" width="20" color="#0A6DC0" visible={true} />
          ) : (
            `(${filteredReports.length})`
          )}
        </h1>

        <Card className="mt-3 py-5 relative">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-[#E6E6E6]">
                <tr>
                  <th className="text-left pl-4 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Store Name
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Item Name
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Qty
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Closing Qty
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Empty Qty
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Closing Empty Qty
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Total Qty Diff
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Stock Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <>
                    <ReportSkeleton />
                    <ReportSkeleton />
                    <ReportSkeleton />
                    <ReportSkeleton />
                    <ReportSkeleton />
                  </>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 px-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                          <UserPen size={40} className="text-gray-400 mx-auto" />
                          No reports found
                        </p>
                        <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                          No data for selected period/store – try different dates
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                    >
                      <td className="py-4 pl-4 font-medium">{report.storeName}</td>
                      <td className="py-4">
                        {report.itemName.slice(0, 30)}
                        {report.itemName.length > 30 ? "..." : ""}
                      </td>
                      <td className="py-4">{report.openingQty}</td>
                      <td className="py-4">{report.closingQty}</td>
                      <td className="py-4">{report.openingEmptyQty}</td>
                      <td className="py-4">{report.closingEmptyQty}</td>
                      <td className="py-4">{report.totalQtyDiff}</td>
                      <td className="py-4">{report.openingStockValue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination – only show if more than 5 items */}
        {!loading && filteredReports.length > itemsPerPage && (
          <div className="flex flex-row justify-between items-center mt-6 gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MoveLeft /> Previous
            </button>

            <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center">
              {renderPagination()}
            </div>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <MoveRight />
            </button>

            <div className="hidden lg:block text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredReports.length)}{" "}
              of {filteredReports.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessReports;