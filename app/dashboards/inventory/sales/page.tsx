"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { getSales } from "@/lib/utils/api/apiHelper";
import { cn } from "@/lib/utils";
import { SaleInvoice } from "@/types/sales";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoveRight, MoveLeft, MoveRightIcon, CalendarIcon } from "lucide-react";
import Image from "next/image";
import { ThreeDots } from "react-loader-spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { usePaymentSocket } from "@/hooks/invoiceSocket";

const SalesListPage = () => {
  const [invoices, setInvoices] = useState<SaleInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<SaleInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // WebSocket for real-time payment updates
  const { isConnected } = usePaymentSocket((paymentData) => {
    if (paymentData.type === "invoice") {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === paymentData.id
            ? {
                ...inv,
                status: paymentData.status === "success" ? "completed" : paymentData.status,
              }
            : inv,
        ),
      );

      if (paymentData.status === "success") {
        toast.success(`Invoice #${paymentData.id.slice(0, 8)} payment successful!`);
      } else if (paymentData.status === "failed") {
        toast.error(`Payment failed for invoice #${paymentData.id.slice(0, 8)}`);
      }
    }
  });

  // Safe stats
  const completedCount = Array.isArray(filteredInvoices)
    ? filteredInvoices.filter((inv) => inv.status?.toLowerCase() === "completed").length
    : 0;

  const pendingCount = Array.isArray(filteredInvoices)
    ? filteredInvoices.filter((inv) => inv.status?.toLowerCase() === "pending").length
    : 0;

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const allInvoices = await getSales(); // No pagination – full list
      setInvoices(Array.isArray(allInvoices) ? allInvoices : []);
    } catch (err) {
      console.error("Failed to load sales invoices:", err);
      setInvoices([]);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter by date + status
  useEffect(() => {
    let filtered = Array.isArray(invoices) ? [...invoices] : [];

    if (selectedDate) {
      filtered = filtered.filter((inv) => {
        try {
          const invDate = new Date(inv.created_at);
          return isSameDay(invDate, selectedDate);
        } catch {
          return false;
        }
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (inv) => inv.status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    setFilteredInvoices(filtered);
    setPage(1);
  }, [selectedDate, statusFilter, invoices]);

  const formatDate = (iso: string) => {
    try {
      return format(new Date(iso), "dd/MM/yyyy");
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "completed") {
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
        {status || "Unknown"}
      </span>
    );
  };

  const formattedDate = selectedDate
    ? format(selectedDate, "MMM dd, yyyy")
    : "Select date";

  // Client-side pagination
  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={page === i ? "default" : "outline"}
          size="sm"
          className={`h-8 w-8 ${
            page === i ? "bg-[#0A6DC0] text-white hover:bg-[#0A6DC0]" : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>,
      );
    }

    return pages;
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
            Sales Invoices
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A]">
            View and track all your sales invoices easily.
          </p>
        </div>

        {isConnected && (
          <span className="hidden md:flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live payment updates
          </span>
        )}
      </div>

      {/* Banner */}
      <div className="mb-4 bg-[url('/purchase-bg.svg')] bg-no-repeat bg-cover bg-center p-3 md:p-6 overflow-hidden md:h-[150px] mt-3 flex flex-col md:flex-row justify-between rounded-2xl">
        <div className="flex w-full md:items-center justify-between flex-col md:flex-row h-full">
          <div>
            <p className="text-white font-dm-sans">Total Sales Invoices</p>
            <h1 className="text-white text-[20px] md:text-[25px] font-semibold font-clash">
              {loading ? (
                <ThreeDots height="20" width="20" color="#ffffff" visible />
              ) : (
                filteredInvoices.length
              )}
            </h1>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal h-10 px-4 bg-white/90 text-gray-700 hover:bg-white/95",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formattedDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Stats cards */}
      <div className="flex mb-4 gap-3 overflow-x-auto">
        <div className="border border-[#EAECF0] w-full shadowX min-w-[258px] h-[80px] md:h-[112px] rounded-[12px] flex flex-col justify-center items-start px-6 gap-2">
          <div className="flex justify-between items-center w-full">
            <h1 className="font-clash font-semibold md:text-[20px]">
              {loading ? (
                <ThreeDots height="20" width="20" color="#000000" visible />
              ) : (
                completedCount
              )}
            </h1>
            <Image src="/in.svg" height={40} width={40} alt="completed" />
          </div>
          <p className="font-regular text-[13px] font-dm-sans">
            Completed Sales
          </p>
        </div>

        <div className="border border-[#EAECF0] w-full shadowX min-w-[258px] h-[80px] md:h-[112px] rounded-[12px] flex flex-col justify-center items-start px-6 gap-2">
          <div className="flex justify-between items-center w-full">
            <h1 className="font-clash font-semibold md:text-[20px]">
              {loading ? (
                <ThreeDots height="20" width="20" color="#000000" visible />
              ) : (
                pendingCount
              )}
            </h1>
            <Image src="/pending.svg" height={40} width={40} alt="pending" />
          </div>
          <p className="font-regular text-[13px] font-dm-sans">Pending Sales</p>
        </div>
      </div>

      {/* Table */}
      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white mb-3 md:mb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[16px] font-bold font-dm-sans">Sales Invoices</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] border border-gray-300 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto text-[#2F2F2F]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">ID</th>
                  <th className="px-6 py-3 text-left font-medium">Code</th>
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3 text-left font-medium">Amount</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">More</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex justify-center">
                        <ThreeDots height="30" width="30" color="#0A6DC0" visible />
                      </div>
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      {selectedDate
                        ? `No sales found for ${format(selectedDate, "MMM dd, yyyy")}`
                        : "No sales invoices found"}
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                        {inv.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{inv.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(inv.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        ₦{inv.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/dashboards/inventory/sales/${inv.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <MoveRight className="w-5 h-5 text-gray-500" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && filteredInvoices.length > 0 && (
          <div className="flex flex-row justify-between items-center mt-6 gap-4">
            <button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className={cn(
                "flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24",
                page === 1 && "opacity-50 cursor-not-allowed",
              )}
            >
              <MoveLeft /> Previous
            </button>

            <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center">
              {renderPagination()}
            </div>

            <div className="flex items-center gap-10">
              <button
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className={cn(
                  "flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24",
                  page >= totalPages && "opacity-50 cursor-not-allowed",
                )}
              >
                Next <MoveRightIcon />
              </button>

              <div className="hidden lg:block text-sm text-gray-600">
                Showing {startIndex + 1} -{" "}
                {Math.min(startIndex + itemsPerPage, filteredInvoices.length)}{" "}
                of {filteredInvoices.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile live indicator */}
      {isConnected && (
        <div className="fixed bottom-4 right-4 md:hidden bg-green-50 text-green-700 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live
        </div>
      )}
    </div>
  );
};

export default SalesListPage;