/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { MoveLeft, MoveRight, MoveRightIcon } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { handleGetTransactions } from "@/lib/utils/api/apiHelper";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import type { Transaction } from "@/types/transactions";

const TransactionSkeleton = () => (
  <tr className="animate-pulse">
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
    <td className="p-4"><div className="h-6 w-6 bg-gray-200 rounded-full"></div></td>
  </tr>
);

const Table = () => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const { newTransactions, clearNewTransactions } = useWallet();

  const [typeFilter, setTypeFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Merge in real-time transactions from websocket
  useEffect(() => {
    if (newTransactions.length > 0) {
      setAllTransactions((prev) => {
        const existingIds = new Set(prev.map((tx) => tx.id));
        const uniqueNew = newTransactions.filter((tx: any) => !existingIds.has(tx.id));
        return uniqueNew.length > 0 ? [...uniqueNew, ...prev] : prev;
      });
      clearNewTransactions();
    }
  }, [newTransactions, clearNewTransactions]);

  // Fetch all pages
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        let page = 1;
        let fetched: Transaction[] = [];
        let hasMore = true;

        while (hasMore) {
          const response = await handleGetTransactions(page);
          const items = response?.data?.items ?? [];
          if (items.length > 0) {
            fetched = [...fetched, ...items];
            const { totalPages } = response.data.pagination;
            hasMore = page < totalPages;
            page++;
          } else {
            hasMore = false;
          }
        }

        setAllTransactions(fetched);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setAllTransactions([]);
        } else {
          setError("Failed to load transactions. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Receipt helpers ────────────────────────────────────────────────────
  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const btns = receiptRef.current.querySelector(".receipt-buttons") as HTMLElement;
      if (btns) btns.style.display = "none";
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff", scale: 2, logging: false, useCORS: true,
      });
      if (btns) btns.style.display = "flex";
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receipt-${selectedTransaction?.transactionReference || Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Receipt downloaded!");
      });
    } catch {
      toast.error("Failed to download receipt.");
    }
  };

  const handleShareReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const btns = receiptRef.current.querySelector(".receipt-buttons") as HTMLElement;
      if (btns) btns.style.display = "none";
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff", scale: 2, logging: false, useCORS: true,
      });
      if (btns) btns.style.display = "flex";
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `receipt-${selectedTransaction?.transactionReference || Date.now()}.png`, { type: "image/png" });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "Transaction Receipt" });
            toast.success("Receipt shared!");
          } catch (e: any) {
            if (e.name !== "AbortError") toast.error("Failed to share receipt.");
          }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `receipt-${selectedTransaction?.transactionReference || Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.info("Sharing not supported — receipt downloaded instead.");
        }
      });
    } catch {
      toast.error("Failed to share receipt.");
    }
  };

  const formatReceiptDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "long", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });

  // ── Filter & search ────────────────────────────────────────────────────
  const filteredTransactions = allTransactions.filter((tx) => {
    const matchesType =
      typeFilter === "ALL" ||
      (typeFilter === "CREDIT" && tx.direction === "CREDIT") ||
      (typeFilter === "DEBIT" && tx.direction === "DEBIT");

    const q = searchQuery.toLowerCase();
    const matchesSearch = q
      ? tx.sender?.name?.toLowerCase().includes(q) ||
        tx.receiver?.name?.toLowerCase().includes(q) ||
        tx.narration?.toLowerCase().includes(q)
      : true;

    return matchesType && matchesSearch;
  });

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => { setCurrentPage(1); }, [typeFilter, searchQuery]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPagination = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((i) => (
      <Button
        key={i}
        variant={currentPage === i ? "default" : "outline"}
        size="sm"
        className={`h-8 w-8 ${currentPage === i ? "bg-[#0A6DC0] text-white hover:bg-[#0A6DC0]" : ""}`}
        onClick={() => handlePageChange(i)}
      >
        {i}
      </Button>
    ));
  };

  const formatReference = (ref: string) => {
    if (!ref || ref.length <= 20) return ref || "";
    return `${ref.substring(0, 10)}...${ref.substring(ref.length - 6)}`;
  };

  return (
    <div>
      <div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Transaction History
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          A summary of all your transactions. Easily track and reconcile all your financial activities.
        </p>
      </div>

      <div className="mt-4 flex justify-between flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Input
          placeholder="Search by name or narration..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-2 bg-[#F2F2F7] py-5 md:py-6"
        />
        <Select
          value={typeFilter}
          onValueChange={(val: "ALL" | "CREDIT" | "DEBIT") => setTypeFilter(val)}
        >
          <SelectTrigger className="w-[180px] border-2 border-[#E7EBED] py-5 md:py-6">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Transactions</SelectItem>
            <SelectItem value="CREDIT">Credit Only</SelectItem>
            <SelectItem value="DEBIT">Debit Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white mb-3 md:mb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[#2F2F2F] font-dm-sans text-[16px] font-bold">Transaction History</h1>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto text-[#2F2F2F]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[35%]">Description</th>
                  <th className="px-6 py-3 text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[20%]">Amount</th>
                  <th className="px-6 py-3 text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[20%]">Date</th>
                  <th className="px-6 py-3 text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[15%]">Type</th>
                  <th className="px-6 py-3 text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] w-[10%]">More</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <>{[...Array(5)].map((_, i) => <TransactionSkeleton key={i} />)}</>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 px-4">
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-red-600 font-medium text-lg">{error}</p>
                        <Button onClick={() => window.location.reload()} className="bg-[#0A6DC0] hover:bg-[#085a9e]">
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center">
                        <Image src="/ts.svg" alt="no transactions" height={60} width={60} />
                        <p className="font-bold font-dm-sans text-[18px] mt-6">No transactions found</p>
                        <p className="text-[#9E9A9A] mt-2">
                          {searchQuery || typeFilter !== "ALL"
                            ? "Try changing filter or search term"
                            : "Your recent transactions will appear here"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((tx) => {
                    const isCredit = tx.direction === "CREDIT";
                    const date = new Date(tx.createdAt);
                    const formattedDate = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                    const formattedTime = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                    const formattedAmount = isCredit
                      ? `+₦${tx.amount.toLocaleString("en-NG")}`
                      : `-₦${tx.amount.toLocaleString("en-NG")}`;

                    // For credits: show who sent money (sender); for debits: show who received (receiver)
                    const counterparty = isCredit
                      ? (tx.sender?.name || "Unknown Sender")
                      : (tx.receiver?.name || "Unknown Beneficiary");

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]"
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        <td className="px-6 py-4 w-[35%]">
                          <div className="flex items-center gap-3">
                            <Image
                              src={isCredit ? "/in.svg" : "/out.svg"}
                              width={32} height={32} alt="icon"
                              className="w-8 h-8 hidden md:inline flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[#2F2F2F] truncate">{counterparty}</p>
                              <p className="text-sm text-[#6F6F6F] mt-1 hidden md:inline">
                                Ref: {formatReference(tx.transactionReference)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-dm-sans font-medium whitespace-nowrap w-[20%]">
                          <span className={isCredit ? "text-[#31A078]" : "text-[#EA4334]"}>
                            {formattedAmount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#2F2F2F] whitespace-nowrap w-[20%]">
                          {formattedDate} {formattedTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-[15%]">
                          <span className={`inline-flex px-4 py-1 rounded-full text-[12px] font-dm-sans font-bold ${
                            isCredit ? "bg-[#E7F4EB] text-[#003909]" : "bg-[#FFD0CC] text-[#EA4334]"
                          }`}>
                            {isCredit ? "Credit" : "Debit"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-[10%]">
                          <Button variant="ghost" size="icon"><MoveRight size={20} /></Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && !error && filteredTransactions.length > 0 && (
          <div className="flex flex-row justify-between items-center mt-6 gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={cn("flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24", currentPage === 1 && "opacity-50 cursor-not-allowed")}
            >
              <MoveLeft /> Previous
            </button>
            <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center">
              {renderPagination()}
            </div>
            <div className="flex items-center gap-10">
              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className={cn("flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24", currentPage >= totalPages && "opacity-50 cursor-not-allowed")}
              >
                Next <MoveRightIcon />
              </button>
              <div className="hidden lg:block text-sm text-gray-600">
                Showing {startIndex + 1} – {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Receipt modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md md:max-w-lg py-4 md:py-6 bg-white text-[#474747] font-dm-sans md:rounded-lg overflow-hidden max-h-[100vh]">
          <div ref={receiptRef}>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <Image src="/v-b.svg" alt="logo" width={20} height={30} className="w-10" />
              </div>
              <h2 className="text-[16px] font-medium text-[#2F2F2F]">Payment Success!</h2>
              <p className="font-medium text-[13px]">Your payment was successful</p>
            </div>

            {selectedTransaction && (
              <div className="bg-[#F7F9FA] rounded-lg p-3 md:p-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#4B4E52] text-[13px]">Amount</span>
                    <span className="font-medium text-[#2F2F2F]">
                      ₦{selectedTransaction.amount.toLocaleString("en-NG")}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b items-center">
                    <span className="text-[#4B4E52] text-[13px]">Payment Status</span>
                    <span className="inline-flex items-center px-3 rounded-full text-[10px] font-medium text-[#23A26D]">
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3 mt-3">
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Narration</p>
                    <p className="text-[13px] font-medium">
                      {selectedTransaction.narration || selectedTransaction.transactionReference || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Sender</p>
                    <p className="text-[13px] font-medium">
                      {selectedTransaction.sender?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Sender Account</p>
                    <p className="text-[13px] font-medium">
                      {selectedTransaction.sender?.accountNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Sender Bank</p>
                    <p className="text-[13px] font-medium">
                      {selectedTransaction.sender?.bankName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Receiver</p>
                    <p className="text-[13px] font-medium">
                      {selectedTransaction.receiver?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Receiver Account</p>
                    <p className="text-[13px] font-medium">
                      {selectedTransaction.receiver?.accountNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Receiver Bank</p>
                    <p className="text-[13px] font-medium">
                      {selectedTransaction.receiver?.bankName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Category</p>
                    <p className="text-[13px] font-medium">
                      {selectedTransaction.category || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Direction</p>
                    <p className="text-[13px] font-medium">{selectedTransaction.direction}</p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Session ID</p>
                    <p className="text-[13px] font-medium break-all">
                      {selectedTransaction.sessionId || selectedTransaction.id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Transaction Reference</p>
                    <p className="text-[13px] font-medium break-all">
                      {selectedTransaction.transactionReference}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#4B4E52] text-[13px]">Date</p>
                    <p className="text-[13px] font-medium">
                      {formatReceiptDate(selectedTransaction.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 receipt-buttons mt-4">
            <Button onClick={handleShareReceipt} className="flex-1 bg-[#0A6DC0] hover:bg-[#085a9e] text-white">
              Share Receipt
            </Button>
            <Button onClick={handleDownloadReceipt} variant="outline" className="flex-1">
              Download Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Table;