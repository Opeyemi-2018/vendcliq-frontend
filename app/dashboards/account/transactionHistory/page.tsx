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
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import html2canvas from "html2canvas";
import { toast } from "sonner";

const TransactionSkeleton = () => (
  <tr className="animate-pulse">
    <td className="p-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="p-4 hidden md:table-cell">
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </td>
    <td className="p-4 hidden md:table-cell">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="p-4 hidden md:table-cell">
      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
    </td>
    <td className="p-4">
      <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
    </td>
  </tr>
);

const Table = () => {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );
  const receiptRef = useRef<HTMLDivElement>(null);

  const openReceipt = (tx: any) => {
    setSelectedTransaction(tx);
  };

  const closeReceipt = () => {
    setSelectedTransaction(null);
  };

  const formatReceiptDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Filter & Search states
  const [typeFilter, setTypeFilter] = useState<"ALL" | "CREDIT" | "DEBIT">(
    "ALL",
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        let page = 1;
        let fetched: any[] = [];
        let hasMore = true;

        while (hasMore) {
          const response = await handleGetTransactions(page);
          if (response?.data?.data?.length > 0) {
            fetched = [...fetched, ...response.data.data];
            page++;
          } else {
            hasMore = false;
          }
        }

        setAllTransactions(fetched);
      } catch (err: any) {
        if (
          err?.response?.status === 404 ||
          err?.message?.includes("No transactions")
        ) {
          setAllTransactions([]);
          setError(null);
        } else {
          setError("Failed to load transactions. Please try again.");
          console.error("Error fetching transactions:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, []);

  const retryFetch = () => {
    window.location.reload();
  };

  // Download Receipt Function
  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const buttonsContainer = receiptRef.current.querySelector(
        ".receipt-buttons",
      ) as HTMLElement;
      if (buttonsContainer) {
        buttonsContainer.style.display = "none";
      }

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      if (buttonsContainer) {
        buttonsContainer.style.display = "flex";
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `receipt-${selectedTransaction?.transactionReference || Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success("Receipt downloaded successfully!");
        }
      });
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast.error("Failed to download receipt. Please try again.");
    }
  };

  // Share Receipt Function
  const handleShareReceipt = async () => {
    if (!receiptRef.current) return;

    try {
      const buttonsContainer = receiptRef.current.querySelector(
        ".receipt-buttons",
      ) as HTMLElement;
      if (buttonsContainer) {
        buttonsContainer.style.display = "none";
      }

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      if (buttonsContainer) {
        buttonsContainer.style.display = "flex";
      }

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File(
          [blob],
          `receipt-${selectedTransaction?.transactionReference || Date.now()}.png`,
          { type: "image/png" },
        );

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Transaction Receipt",
              text: `Receipt for transaction ${selectedTransaction?.transactionReference}`,
            });
            toast.success("Receipt shared successfully!");
          } catch (err: any) {
            if (err.name !== "AbortError") {
              console.error("Error sharing:", err);
              toast.error("Failed to share receipt");
            }
          }
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `receipt-${selectedTransaction?.transactionReference || Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.info(
            "Sharing not supported on this device. Receipt downloaded instead.",
          );
        }
      });
    } catch (error) {
      console.error("Error sharing receipt:", error);
      toast.error("Failed to share receipt. Please try again.");
    }
  };

  // Filter & search logic
  const filteredTransactions = allTransactions.filter((tx) => {
    const matchesType =
      typeFilter === "ALL" ||
      (typeFilter === "CREDIT" && tx.transactionType === "CREDIT") ||
      (typeFilter === "DEBIT" && tx.transactionType !== "CREDIT");

    const matchesSearch = searchQuery
      ? tx.beneficiaryAccount?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        tx.senderAccount?.Name?.toLowerCase().includes(
          searchQuery.toLowerCase(),
        )
      : true;

    return matchesType && matchesSearch;
  });

  // Paginate the filtered results
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, searchQuery]);

  // Get current page slice
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
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
        </Button>,
      );
    }

    return pages;
  };

  // Helper function to get safe values from transaction data
  const getTransactionValue = (value: any, fallback: string = "N/A") => {
    return value || fallback;
  };

  return (
    <div>
      <div>
        <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
          Transaction History{" "}
        </h1>
        <p className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans">
          A summary of all your transactions. Easily track and reconcile all
          your financial activities.{" "}
        </p>
      </div>
      <div className="mt-4 flex justify-between flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Input
          placeholder="Search by beneficiary..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full  bg-transparent border-2 bg-[#F2F2F7] py-5 md:py-6"
        />

        <Select
          value={typeFilter}
          onValueChange={(val: "ALL" | "CREDIT" | "DEBIT") =>
            setTypeFilter(val)
          }
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

      <Card className="md:p-5">
        <h1 className="text-[#2F2F2F] font-dm-sans text-[16px] font-bold">
          Transaction History
        </h1>
        <div className=" mt-3 lg:border border-[#E4E4E4] rounded-lg bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#E6E6E6]">
                <tr>
                  <th className="text-left md:py-3 pl-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Description
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Amount
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Date
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Type
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    More
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E4]">
                {loading ? (
                  <>
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                  </>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 px-4">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="text-red-600 font-medium text-lg">
                          {error}
                        </div>
                        <Button
                          onClick={retryFetch}
                          className="bg-[#0A6DC0] hover:bg-[#085a9e]"
                        >
                          Retry
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/ts.svg"
                          alt="no transactions"
                          height={60}
                          width={60}
                        />
                        <p className="font-bold font-dm-sans text-[18px] mt-6">
                          No transactions found
                        </p>
                        <p className="text-[#9E9A9A] mt-2">
                          {searchQuery || typeFilter !== "ALL"
                            ? "Try changing filter or search term"
                            : "Your recent transactions will appear here"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => {
                    const date = new Date(transaction.createdAt);
                    const formattedDate = date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = date.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const isCredit = transaction.transactionType === "CREDIT";
                    const amountValue = Math.abs(
                      parseFloat(transaction.amount),
                    );
                    const formattedAmount = isCredit
                      ? `+₦${amountValue.toLocaleString("en-NG")}`
                      : `-₦${amountValue.toLocaleString("en-NG")}`;

                    let counterparty = "Unknown";
                    if (isCredit) {
                      counterparty =
                        transaction.senderAccount?.Name || "Unknown Sender";
                    } else {
                      counterparty =
                        transaction.beneficiaryAccount?.name ||
                        "Unknown Beneficiary";
                    }

                    return (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                      >
                        <td
                          onClick={(e) => {
                            e.stopPropagation();
                            openReceipt(transaction);
                          }}
                          className="md:py-4 pl-4"
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              src={isCredit ? "/in.svg" : "/out.svg"}
                              width={32}
                              height={32}
                              alt="icon"
                              className="w-8 h-8 hidden md:inline"
                            />
                            <div>
                              <p className="font-medium text-[#2F2F2F]">
                                {counterparty}
                              </p>
                              <p className="text-sm text-[#6F6F6F] mt-1 hidden md:inline">
                                Ref: {transaction.transactionReference}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell py-4 font-dm-sans font-medium">
                          <span
                            className={
                              isCredit ? "text-[#31A078]" : "text-[#EA4334]"
                            }
                          >
                            {formattedAmount}
                          </span>
                        </td>
                        <td className="hidden md:table-cell py-4 text-[#2F2F2F]">
                          {formattedDate} {formattedTime}
                        </td>
                        <td className="hidden md:table-cell py-4">
                          <span
                            className={`inline-flex px-4 py-1 rounded-full text-[12px] font-dm-sans font-bold ${
                              isCredit
                                ? "bg-[#E7F4EB] text-[#003909]"
                                : "bg-[#FFD0CC] text-[#EA4334]"
                            }`}
                          >
                            {isCredit ? "Credit" : "Debit"}
                          </span>
                        </td>
                        <td className="py-4">
                          <Button variant="ghost" size="icon">
                            <MoveRight size={20} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && !error && filteredTransactions.length > 0 && (
          <div className="flex flex-row justify-between items-center mt-6 gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24"
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
                className="flex items-center gap-1 text-[12px] font-medium text-[#565656] w-24"
              >
                Next <MoveRightIcon />
              </button>

              <div className="hidden lg:block text-sm text-gray-600">
                Showing {startIndex + 1} -{" "}
                {Math.min(
                  startIndex + itemsPerPage,
                  filteredTransactions.length,
                )}{" "}
                of {filteredTransactions.length}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Receipt Modal with Real Transaction Data */}
      <Dialog open={!!selectedTransaction} onOpenChange={closeReceipt}>
        <DialogContent className="max-w-md md:max-w-lg py-4 md:py-6 bg-white text-[#474747] font-dm-sans md:rounded-lg overflow-hidden max-h-[100vh] md:max-h-[90vh]">
          <div ref={receiptRef}>
            <div className=" text-center">
              <div className="flex justify-center ">
                <Image
                  src={"/v-b.svg"}
                  alt="logo"
                  width={20}
                  height={30}
                  className="w-10 "
                />
              </div>
              <h2 className="text-[16px] font-medium text-[#2F2F2F] ">
                Payment Success!
              </h2>
              <p className="t font-medium text-[13px]">
                Your payment was successful
              </p>
            </div>

            {selectedTransaction && (
              <div className="bg-[#F7F9FA] rounded-lg p-3 md:p-4">
                <div className="space-y-2">
                  <div className="flex justify-between ">
                    <span className="text-[#4B4E52] text-[13px] font-regular">
                      Amount
                    </span>
                    <span className="font-medium text-[#2F2F2F]">
                      ₦
                      {Math.abs(
                        parseFloat(selectedTransaction.amount),
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-[#4B4E52] text-[13px] font-regular">
                      Payment Status
                    </span>
                    <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-medium bg-[#23A26D1F] text-[#23A26D]">
                      {getTransactionValue(
                        selectedTransaction.status,
                        "Successful",
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <div className="">
                    <p className="text-[#4B4E52] text-[13px] font-regular">
                      Payment Description
                    </p>
                    <p className="text-[13px] font-medium ">
                      {getTransactionValue(
                        selectedTransaction.description ||
                          selectedTransaction.transactionReference ||
                          selectedTransaction.reference,
                        "N/A",
                      )}
                    </p>
                  </div>

                  <div className="">
                    <p className="text-[#4B4E52] text-[13px] font-regular">
                      Receiver&apos;s Name
                    </p>
                    <p className="text-[13px] font-medium ">
                      {getTransactionValue(
                        selectedTransaction.beneficiaryAccount?.name,
                        selectedTransaction.senderAccount?.Name || "N/A",
                      )}
                    </p>
                  </div>

                  <div className="">
                    <p className="text-[#4B4E52] text-[13px] font-regular">
                      Receiver&apos;s Account No
                    </p>
                    <p className="text-[13px] font-medium ">
                      {getTransactionValue(
                        selectedTransaction.beneficiaryAccount?.accountNumber,
                        selectedTransaction.senderAccount?.accountNumber ||
                          "N/A",
                      )}
                    </p>
                  </div>

                  <div className="">
                    <p className="text-[#4B4E52] text-[13px] font-regular">
                      Receiver&apos;s Bank
                    </p>
                    <p className="text-[13px] font-medium ">
                      {getTransactionValue(
                        selectedTransaction.beneficiaryAccount?.provider ||
                          selectedTransaction.beneficiaryAccount?.bankName,
                        selectedTransaction.senderAccount?.provider ||
                          selectedTransaction.senderAccount?.bankName ||
                          "N/A",
                      )}
                    </p>
                  </div>

                  <div className="">
                    <p className="text-[#4B4E52] text-[13px] font-regular">
                      Sender&apos;s Account
                    </p>
                    <p className="text-[13px] font-medium ">
                      {getTransactionValue(
                        selectedTransaction.senderAccount?.accountNumber,
                        selectedTransaction.beneficiaryAccount?.accountNumber ||
                          "N/A",
                      )}
                    </p>
                  </div>

                  <div className="">
                    <p className="text-[#4B4E52] text-[13px] font-regular">
                      Transaction Type
                    </p>
                    <p className="text-[13px] font-medium ">
                      {getTransactionValue(
                        selectedTransaction.transactionType,
                        "N/A",
                      )}
                    </p>
                  </div>

                  <div className="">
                    <p className="text-[#4B4E52] text-[13px] font-regular">
                      Session ID
                    </p>
                    <p className="text-[13px] font-medium ">
                      {getTransactionValue(
                        selectedTransaction.sessionId ||
                          selectedTransaction.id ||
                          selectedTransaction.transactionReference,
                        "N/A",
                      )}
                    </p>
                  </div>

                  <div className="">
                    <p className="text-[13px] font-medium ">Date</p>
                    <p className="text-[13px] font-medium ">
                      {formatReceiptDate(selectedTransaction.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 receipt-buttons">
            <Button
              onClick={handleShareReceipt}
              className="flex-1  bg-[#0A6DC0] hover:bg-[#085a9e] text-white"
            >
              Share Receipt
            </Button>
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="flex-1"
            >
              Download Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Table;
