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
import Link from "next/link";
import React, { useState } from "react";
import { RiFileDownloadFill } from "react-icons/ri";

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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        Error loading transactions
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
                <TabTrigger value="transfer">Transfer</TabTrigger>
                <TabTrigger value="funding">Funding</TabTrigger>
                <TabTrigger value="sales">Sales</TabTrigger>
              </div>
              <div className="md:flex md:w-auto w-full md:flex-row flex-col items-center gap-5 sm:gap-5 md:mt-0 mt-4">
                <SearchInput
                  className="rounded-lg py-2 w-full sm:w-auto"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                />
                <Button className="bg-black text-white flex items-center gap-2 w-full md:mt-0 mt-3 sm:w-auto">
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
                          <TableCell>{transaction.type}</TableCell>
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
                            <Link
                              href={`/dashboard/transaction/${transaction.id}`}
                              className="text-black bg-[#E7F4EB] py-2 px-6 rounded-2xl hover:underline"
                            >
                              View
                            </Link>
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
