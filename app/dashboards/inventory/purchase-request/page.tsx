"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { getPurchaseRequest } from "@/lib/utils/api/apiHelper";
import { cn } from "@/lib/utils";
import { PurchaseRequest } from "@/types/purchaseRequest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoveRight, CalendarIcon } from "lucide-react";
import Image from "next/image";
import { ThreeDots } from "react-loader-spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

const PurchaseRequestListPage = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Single date filter – no default value
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Derived stats from filtered data
  const completedCount = filteredRequests.filter(
    (r) =>
      r.status?.toLowerCase() === "paid" ||
      r.status?.toLowerCase() === "completed",
  ).length;

  const pendingCount = filteredRequests.filter(
    (r) => r.status?.toLowerCase() === "pending",
  ).length;

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await getPurchaseRequest(page, 10);
        const allRequests = res.data || [];
        setRequests(allRequests);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.totalCount || allRequests.length || 0);
      } catch (err) {
        console.error("Failed to load purchase requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page]);

  // Filter requests when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      // No date selected → show all requests
      setFilteredRequests(requests);
      return;
    }

    // Filter by exact date match
    const filtered = requests.filter((req) => {
      try {
        const reqDate = new Date(req.created_at);
        return isSameDay(reqDate, selectedDate);
      } catch {
        return false;
      }
    });

    setFilteredRequests(filtered);
  }, [selectedDate, requests]);

  const formatDate = (iso: string) => {
    try {
      return format(new Date(iso), "dd/MM/yyyy");
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "paid" || s === "completed") {
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

  // Button display text
  const formattedDate = selectedDate
    ? format(selectedDate, "MMM dd, yyyy")
    : "Select date";

  return (
    <div className="">
      <div className="mb-4 md:mb-6">
        <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
          Purchase Requests
        </h1>
        <p className="font-medium font-dm-sans text-[#9E9A9A]">
          View and track all your purchase requests and stock order easily.
        </p>
      </div>

      <div className="mb-4 bg-[url('/purchase-bg.svg')] bg-no-repeat bg-cover bg-center p-3 md:p-6 overflow-hidden md:h-[150px] mt-3 flex flex-col md:flex-row justify-between rounded-2xl">
        <div className="flex w-full md:items-center justify-between flex-col md:flex-row h-full">
          <div>
            <p className="text-white font-dm-sans">Total Purchase Requests</p>
            <h1 className="text-white text-[20px] md:text-[25px] font-semibold font-clash">
              {loading ? (
                <ThreeDots height="20" width="20" color="#ffffff" visible />
              ) : (
                filteredRequests.length 
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

      {/* Two stat cards */}
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
            <Image src="/invoice-in.svg" height={40} width={40} alt="completed" />
          </div>
          <p className="font-regular text-[13px] font-dm-sans">
            Completed Requests
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
          <p className="font-regular text-[13px] font-dm-sans">
            Pending Requests
          </p>
        </div>
      </div>

      {/* Table section */}
      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white mb-3 md:mb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[16px] font-bold font-dm-sans">
            Purchase Requests
          </h1>
          <Select defaultValue="all">
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
                      Loading purchase requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      {selectedDate
                        ? `No requests found for ${format(selectedDate, "MMM dd, yyyy")}`
                        : "No purchase requests found"}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {req.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{req.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {req.total.toLocaleString("en-NG", {
                          style: "currency",
                          currency: "NGN",
                          minimumFractionDigits: 0,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/dashboards/inventory/purchase-request/${req.id}`}
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
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={cn(
              "px-4 py-2 border rounded-md text-sm",
              page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50",
            )}
          >
            Previous
          </button>

          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className={cn(
              "px-4 py-2 border rounded-md text-sm",
              page === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50",
            )}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestListPage;