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
import Image from "next/image";
import html2canvas from "html2canvas";
import Logo from "@/components/Logo";

// Add an interface for the transaction type
interface Transaction {
  id: number;
  amount: number;
  narration: string;
  type: string;
  date: string;
  status?: string;
  receiver_name?: string;
  receiver_account?: string;
  receiver_bank?: string;
  sender_name?: string;
  sender_account?: string;
  session_id?: string;
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

  console.log(transactions);
  // Sort transactions by date in descending order (most recent first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredTransactions = sortedTransactions.filter((transaction) => {
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
    const receiptRef = React.useRef<HTMLDivElement>(null);

    const downloadReceipt = async () => {
      if (receiptRef.current) {
        // Style logo before capturing
        const logoElement = receiptRef.current.querySelector("img");
        if (logoElement) {
          logoElement.style.width = "120px"; // Smaller width
          logoElement.style.height = "60px"; // Smaller height
          logoElement.style.objectFit = "contain";
          logoElement.style.objectPosition = "center";
        }

        const canvas = await html2canvas(receiptRef.current);

        // Reset logo styles after capturing
        if (logoElement) {
          logoElement.style.width = "";
          logoElement.style.height = "";
          logoElement.style.objectFit = "contain";
          logoElement.style.objectPosition = "center";
        }

        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `receipt-${transaction.id}.png`;
        link.click();
      }
    };

    return (
      <DialogContent className="max-w-xl">
        <div ref={receiptRef} className="p-6 font-sans">
          <div className="text-center">
            <div className="flex justify-center">
              <Image
                src={"/favicon.ico"}
                alt="Logo"
                width={24}
                height={16}
                className={`object-contain`}
              />
            </div>
            <h2 className="text-xl font-bold text-[#1a237e]">
              Transaction Details
            </h2>
          </div>

          <div className="space-y-4">
            <DetailRow
              label="Payment Description"
              value={transaction.narration}
            />
            <DetailRow
              label="Amount"
              value={<FormatCurrency amount={transaction.amount} />}
            />
            <DetailRow
              label="Receiver's Name"
              value={transaction.receiver_name || "N/A"}
            />
            <DetailRow
              label="Receiver's Account"
              value={transaction.receiver_account || "N/A"}
            />
            <DetailRow
              label="Receiver's Bank"
              value={transaction.receiver_bank || "N/A"}
            />
            <DetailRow
              label="Sender's Name"
              value={transaction.sender_name || "N/A"}
            />
            <DetailRow
              label="Sender's Account"
              value={
                transaction.sender_account
                  ? `******${transaction.sender_account.slice(-4)}`
                  : "N/A"
              }
            />
            <DetailRow
              label="Date"
              value={new Date(transaction.date).toLocaleString()}
            />
            <DetailRow
              label="Session ID"
              value={transaction.session_id || transaction.id}
            />
            <DetailRow
              label="Status"
              value={
                <span className="text-green-500 font-medium">
                  {transaction.status || "Success"}
                </span>
              }
            />
            <DetailRow label="Transaction Type" value={transaction.type} />
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={downloadReceipt}
            className="w-full bg-[#1a237e] text-white hover:bg-[#1a237e]/90"
          >
            Download Receipt
          </Button>
        </div>
      </DialogContent>
    );
  };

  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <ClipLoader color="#000" size={50} />
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
                      {filteredTransactions.map((transaction, index) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            {FormatCurrency({ amount: transaction.amount })}
                          </TableCell>
                          <TableCell>{transaction.narration}</TableCell>
                          <TableCell className="w-40">
                            <div className="w-full">
                              {transaction.type === "CREDIT" ? (
                                <p className="bg-green-500 text-white px-4 w-20 py-0.5 rounded-full text-center text-sm">
                                  {transaction.type}
                                </p>
                              ) : (
                                <p className="bg-primary text-white px-4 w-20 py-0.5 rounded-full text-center text-sm">
                                  {transaction.type}
                                </p>
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
