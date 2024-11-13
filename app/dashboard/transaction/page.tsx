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
import React from "react";
import { RiFileDownloadFill } from "react-icons/ri";

const page = () => {
  const transactions = [
    {
      id: "#0056757",
      amount: 500000000,
      narration: "4 Cretes of Cocacola",
      paymentType: "Transfer",
      Date: "02/June/2024",
      Details: 500000000,
    },
    {
      id: "#0056757",
      amount: 500000000,
      narration: "4 Cretes of Cocacola",
      paymentType: "Transfer",
      Date: "02/June/2024",
      Details: 500000000,
    },
    {
      id: "#0056757",
      amount: 500000000,
      narration: "4 Cretes of Cocacola",
      paymentType: "Transfer",
      Date: "02/June/2024",
      Details: 500000000,
    },
  ];

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
    >
      {children}
    </TabsTrigger>
  );

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
                <SearchInput className="rounded-lg py-2 w-full sm:w-auto" />
                <Button className="bg-black text-white flex items-center gap-2 w-full md:mt-0 mt-3 sm:w-auto">
                  <RiFileDownloadFill />
                  Export
                </Button>
              </div>
            </TabsList>
            <TabsContent value="all">
              {transactions.length > 0 ? (
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
                      {transactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {transaction.id}
                          </TableCell>
                          <TableCell>
                            <FormatCurrency amount={transaction.amount} />
                          </TableCell>
                          <TableCell>{transaction.narration}</TableCell>
                          <TableCell>{transaction.paymentType}</TableCell>
                          <TableCell>{transaction.Date}</TableCell>
                          <TableCell>
                            <FormatCurrency amount={transaction.Details} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No transactions found
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Pagination Controls */}
        <Pagination className="font-sans">
          <PaginationContent className="flex flex-wrap justify-center gap-2">
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default page;
