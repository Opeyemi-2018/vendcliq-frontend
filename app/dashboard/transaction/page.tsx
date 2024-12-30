"use client";
import { Button } from "@/components/ui/button";
import FormatCurrency from "@/components/ui/FormatCurrency";
import { PageTitle } from "@/components/ui/pageTitle";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { handleGetTransactionHistory } from "@/lib/utils/api/apiHelper";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { RiFileDownloadFill } from "react-icons/ri";
import { ClipLoader } from "react-spinners";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Add an interface for the transaction type
interface Transaction {
  id: number;
  amount: number;
  narration: string;
  type: string;
  date: string;
}

const Page = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["transactionHistory", currentPage],
    queryFn: () => handleGetTransactionHistory(currentPage),
  });

  const transactions = data?.data?.data || [];
  const totalPages = Math.ceil((data?.data?.meta?.total || 0) / itemsPerPage);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction?.id.toString().includes(searchQuery) ||
      transaction?.narration
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction?.amount.toString().includes(searchQuery) ||
      transaction?.date.toString().includes(searchQuery) ||
      transaction?.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (currentTab === "all") return matchesSearch;
    return (
      matchesSearch &&
      transaction.type.toLowerCase() === currentTab.toLowerCase()
    );
  });

  const exportToExcel = () => {
    // Prepare the data
    const data = filteredTransactions.map((transaction) => ({
      ID: transaction.id,
      Amount: new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(transaction.amount),
      Narration: transaction.narration,
      "Payment Type": transaction.type,
      Date: new Date(transaction.date).toLocaleDateString(),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  const TabTrigger = ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => (
    <TabsTrigger
      className="border w-full sm:w-40 data-[state=active]:bg-primary text-black py-2 text-center"
      value={value}
      onClick={() => setCurrentTab(value)}
    >
      {children}
    </TabsTrigger>
  );

  const TransactionReceipt = ({
    transaction,
  }: {
    transaction: Transaction;
  }) => {
    return (
      <DialogContent className="max-w-2xl font-sans">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className="font-bold text-xl">Transaction Receipt</h3>
            <p className="text-gray-500">#{transaction.id}</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            {/* Amount */}
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <FormatCurrency amount={transaction.amount} />
            </div>

            {/* Date */}
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span>{new Date(transaction.date).toLocaleDateString()}</span>
            </div>

            {/* Type */}
            <div className="flex justify-between">
              <span className="text-gray-600">Type</span>
              <span>{transaction.type}</span>
            </div>

            {/* Narration */}
            <div className="flex justify-between">
              <span className="text-gray-600">Narration</span>
              <span className="text-right max-w-auto">
                {transaction.narration}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#000" size={50} />
      </div>
    );
  }

  return (
    <div className="h-screen">
      <div className="py-5 px-4 sm:px-10 space-y-5 h-full">
        <PageTitle title="Transaction" className="border-b border-border" />
        <div className="rounded-lg border font-sans h-full bg-white">
          <Tabs defaultValue="all" className="w-full h-full p-5">
            <TabsList className="bg-white border-b border-border h-fit w-full flex flex-col md:flex-row justify-between pb-5">
              <div className="flex md:flex-row w-full flex-col gap-2 sm:gap-5">
                <TabTrigger value="all">All Transactions</TabTrigger>
              </div>
              <div className="md:flex md:w-auto w-full md:flex-row flex-col items-center gap-5 sm:gap-5 md:mt-0 mt-4">
                <SearchInput
                  className="rounded-lg py-2 w-full sm:w-auto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                />
                <Button
                  className="bg-black text-white flex items-center gap-2 w-full md:mt-0 mt-3 sm:w-auto"
                  onClick={exportToExcel}
                >
                  <RiFileDownloadFill />
                  Export
                </Button>
              </div>
            </TabsList>
            <TabsContent value="all" className="min-h-[300px]">
              {filteredTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Narration</TableHead>
                        <TableHead>Payment Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.id}
                          </TableCell>
                          <TableCell>
                            <FormatCurrency amount={transaction.amount} />
                          </TableCell>
                          <TableCell>{transaction.narration}</TableCell>
                          <TableCell>
                            <div>
                              {transaction.type === "CREDIT" ? (
                                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm">
                                  {transaction.type}
                                </span>
                              ) : (
                                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm">
                                  {transaction.type}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          {/* <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-sm ${
                                transaction.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </TableCell> */}
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="text-black hover:underline">
                                  View Receipt
                                </button>
                              </DialogTrigger>
                              <TransactionReceipt transaction={transaction} />
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {data?.data?.meta && (
                    <div className="py-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>

                          {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;

                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= currentPage - 1 &&
                                pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(pageNumber)}
                                    isActive={currentPage === pageNumber}
                                  >
                                    {pageNumber}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }

                            if (
                              pageNumber === 2 ||
                              pageNumber === totalPages - 1
                            ) {
                              return (
                                <PaginationItem key={pageNumber}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
                              }
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                  <p>No transactions found</p>
                  {searchQuery && (
                    <button
                      className="text-primary mt-2"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Page;
