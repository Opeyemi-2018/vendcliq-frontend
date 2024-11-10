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
import { MoveRight } from "lucide-react";
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
      className="border w-40 data-[state=active]:bg-primary text-black"
      value={value}
    >
      {children}
    </TabsTrigger>
  );
  return (
    <div className="h-screen">
      <div className="py-5 px-10 space-y-5 h-full">
        <PageTitle title="Transaction" className="border-b border-border" />
        <div className="rounded-lg border font-sans bg-white">
          <Tabs defaultValue="all" className="w-full p-5 ">
            <TabsList className="bg-white border-b border-border w-full flex justify-between  pb-5">
              <div className="flex gap-5">
                <TabTrigger value="all">All Transactions</TabTrigger>
                <TabTrigger value="transfer">Transfer</TabTrigger>
                <TabTrigger value="funding">Funding</TabTrigger>
                <TabTrigger value="sales">Sales</TabTrigger>
              </div>
              <div className="flex items-center gap-5">
                <SearchInput className=" rounded-lg py-2" />
                <Button className="bg-black text-white">
                  <RiFileDownloadFill />
                  Export
                </Button>
              </div>
            </TabsList>
            <TabsContent value="all">
              <Table>
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
                        {FormatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{transaction.narration}</TableCell>
                      <TableCell>{transaction.paymentType}</TableCell>
                      <TableCell>{transaction.Date}</TableCell>
                      <TableCell>
                        {FormatCurrency(transaction.Details)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
        <Pagination className="font-sans">
          <PaginationContent>
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
