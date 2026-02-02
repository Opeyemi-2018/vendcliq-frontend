/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UserPen, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
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

const BusinessReports = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [selectedStore, setSelectedStore] = useState<string>("all");

  const [reports, setReports] = useState<TableReportItem[]>([]);
  const [filteredReports, setFilteredReports] = useState<TableReportItem[]>([]);
  const [summary, setSummary] = useState<
    BusinessReportResponse["data"]["summary"] | null
  >(null);
  const [loading, setLoading] = useState(false);

  const uniqueStores = useMemo(() => {
    const stores = new Set(reports.map((r) => r.storeName));
    return Array.from(stores).sort();
  }, [reports]);

  const fetchReport = async (range?: DateRange) => {
    setLoading(true);
    try {
      let start: string | undefined;
      let end: string | undefined;

      if (range?.from) {
        start = format(range.from, "yyyy-MM-dd");
        end = range.to ? format(range.to, "yyyy-MM-dd") : start;
      }

      const res = await handleGetBusinessReportComparison(start, end);

      if (res.statusCode === 200 && res.data) {
        const { summary, stock_comparison } = res.data;

        setSummary(summary);

        const mapped: TableReportItem[] = stock_comparison.map(
          (item: StockComparisonItem) => ({
            id: item.stock_id,
            storeName: item.store_name,
            itemName: item.product_name,
            openingQty: item.opening_qty,
            closingQty: item.closing_qty,
            openingEmptyQty: 0,
            closingEmptyQty: 0,
            totalQtyDiff: item.qty_change,
            openingStockValue: `₦${item.opening_value.toLocaleString()}`,
          }),
        );

        setReports(mapped);
        setFilteredReports(mapped);
        setSelectedStore("all");
      } else {
        toast.error("Failed to load business report");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    if (date?.from) {
      fetchReport(date);
    }
  }, [date]);

  // Client-side filtering by selected store
  useEffect(() => {
    if (selectedStore === "all") {
      setFilteredReports(reports);
    } else {
      const filtered = reports.filter((r) => r.storeName === selectedStore);
      setFilteredReports(filtered);
    }
  }, [reports, selectedStore]);

  const formatCurrency = (value: number) =>
    `₦${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

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
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal h-10 px-3 w-[260px] sm:w-auto",
                  !date?.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "MMM dd, yyyy")} –{" "}
                      {format(date.to, "MMM dd, yyyy")}
                    </>
                  ) : (
                    format(date.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Store Name Dropdown */}
          <Select
            value={selectedStore}
            onValueChange={setSelectedStore}
            disabled={loading || reports.length === 0}
          >
            <SelectTrigger className="w-[220px] h-10">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {uniqueStores.map((store) => (
                <SelectItem key={store} value={store}>
                  {store}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Opening Stock Value
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {summary ? formatCurrency(summary.opening_stock_value) : "—"}
          </h2>
        </div>

        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Closing Stock Value
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {summary ? formatCurrency(summary.closing_stock_value) : "—"}
          </h2>
        </div>

        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Total Invoice Value{" "}
            {summary ? `(${summary.invoice_count} invoices)` : ""}
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {summary ? formatCurrency(summary.total_invoice_value) : "—"}
          </h2>
        </div>

        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Profit Generated
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            {summary ? formatCurrency(summary.profit_generated) : "—"}
          </h2>
        </div>
      </div>

      <div className="md:p-6 lg:border bg-white border-[#E4E4E4] rounded-lg">
        <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold flex gap-2 items-center">
          Stock Table Report{" "}
          {loading ? (
            <div className="inline">
              <ThreeDots
                height="20"
                width="20"
                color="#0A6DC0"
                visible={true}
              />
            </div>
          ) : (
            `(${filteredReports.length})`
          )}
        </h1>

        <Card className="mt-3 py-5 relative">
          {/* {loading && (
            
          )} */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-[#E6E6E6]">
                <tr>
                  <th className="text-left pl-4 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Store Name
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Item Name
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Qty
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Closing Qty
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Empty Qty
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Closing Empty Qty
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Total Qty Diff
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Stock Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20 px-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                          {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <ThreeDots
                                height="80"
                                width="80"
                                color="#0A6DC0"
                                visible={true}
                              />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <UserPen size={40} className="text-gray-400 mr-4" />
                              No reports found
                            </div>
                          )}
                        </p>
                        <p className="absolute top-10 inset-0 flex items-center justify-center z-10 text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                          {loading
                            ? "Fetching business report..."
                            : selectedStore !== "all"
                              ? "Try selecting a different store or date range"
                              : "Select a date range or check your data"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                    >
                      <td className="py-4 pl-4 font-medium">
                        {report.storeName}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.itemName}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.openingQty}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.closingQty}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.openingEmptyQty}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.closingEmptyQty}
                      </td>
                      <td className="py-4">{report.totalQtyDiff}</td>
                      <td className="hidden md:table-cell py-4">
                        {report.openingStockValue}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BusinessReports;
