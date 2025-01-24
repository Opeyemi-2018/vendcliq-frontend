"use client";
import BackButtonWithTooltip from "@/components/ui/BackButtonWithToolTips";
import FormatCurrency from "@/components/ui/FormatCurrency";
import { PageTitle } from "@/components/ui/pageTitle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  handleGetAccountById,
  handleGetAccountDetailsById,
} from "@/lib/utils/api/apiHelper";
import { CalendarDays } from "lucide-react";
import * as React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { TbCopyCheck } from "react-icons/tb";
import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams() as { details: string };
  const { details } = params;
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const { data: accountData, isLoading: accountLoading } = useQuery({
    queryKey: ["account", details, currentPage],
    queryFn: () => handleGetAccountById(details as string),
  });

  const { data: accountDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["accountDetails", details],
    queryFn: () => handleGetAccountDetailsById(details as string),
  });

  const transactions = accountData?.data?.account_transactions?.data || [];
  const totalPages = Math.ceil(
    (accountData?.data?.account_transactions?.meta?.total || 0) / itemsPerPage
  );

  const Calender = ({ date }: { date: string }) => {
    return (
      <div className="border border-[#A2A2A2] rounded-xl flex items-center gap-3 px-3 py-2 font-sans">
        <CalendarDays />
        <p className="text-sm">{date}</p>
        <IoCloseOutline size={20} className="text-destructive" />
      </div>
    );
  };

  if (accountLoading || detailsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-10 py-5">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 pb-2 border-b border-border">
          <BackButtonWithTooltip
            tooltipText="Return"
            className="text-red-500"
          />
          <PageTitle title="Account" />
        </div>

        {/* Calendar Range Selection */}
        <div className="flex flex-wrap items-center gap-3 md:gap-5">
          <Calender date="05-06-2024" />
          <span className="text-gray-600">to</span>
          <Calender date="05-06-2024" />
        </div>

        {/* Account Info */}
        <div className="flex flex-wrap gap-5 md:gap-8 pt-10 pb-5">
          <div>
            <p className="text-[#5D5D5D] text-sm">Account Number</p>
            <div className="flex items-center gap-1">
              <p className="text-xl md:text-3xl font-medium">
                {accountDetails?.data?.accountNumber}
              </p>
              <TbCopyCheck size="20" className="text-gray-700" />
            </div>
          </div>
          <div>
            <p className="text-[#5D5D5D] text-sm">Account Name</p>
            <p className="text-xl md:text-3xl font-medium">
              {accountDetails?.data?.accountName}
            </p>
          </div>
          <div>
            <p className="text-[#5D5D5D] text-sm">Opening Balance (NGN)</p>
            <p className="text-xl md:text-3xl font-medium">
              <FormatCurrency
                amount={accountDetails?.data?.accountBalance ?? 0}
              />
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-lg border bg-white font-sans">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {transaction.reference}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-2.5 w-2.5 rounded-full ${
                          transaction.type === "credit" ||
                          transaction.type === "CREDIT"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          transaction.type === "credit" ||
                          transaction.type === "CREDIT"
                            ? "text-green-700 bg-green-50"
                            : "text-red-700 bg-red-50"
                        } px-3 py-1 rounded-full text-sm`}
                      >
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <FormatCurrency amount={transaction.amount} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <FormatCurrency amount={transaction.accountBalance || 0} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="max-w-80 text-wrap">
                        {transaction.narration}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="py-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;

                  // Show first page, current page, last page and one page before and after current
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

                  // Show ellipsis for gaps
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
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
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
        </div>
      </div>
    </div>
  );
};

export default Page;
