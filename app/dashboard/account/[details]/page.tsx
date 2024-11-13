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
import { CalendarDays } from "lucide-react";
import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { TbCopyCheck } from "react-icons/tb";

const Page = () => {
  const data = [
    {
      reference: "74645673887645637635",
      date: "June 4th 2023",
      amount: 1300000,
      type: "Credit",
      remarks: (
        <div>
          <p>
            INWARD RECEIVED PAYMENT (V) 2334647 From UNITED BANK FOR AFRICA |
            CHUKWU AND SONS LIMITED
            <strong> /00003883383364YTHD647749904</strong>
          </p>
        </div>
      ),
      balance: "5,000,000.00",
    },
    // Add more transactions as needed...
  ];

  const Calender = ({ date }: { date: string }) => {
    return (
      <div className="border border-[#A2A2A2] rounded-xl flex items-center gap-3 px-3 py-2 font-sans">
        <CalendarDays />
        <p className="text-sm">{date}</p>
        <IoCloseOutline size={20} className="text-destructive" />
      </div>
    );
  };

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
              <p className="text-xl md:text-3xl font-medium">0135678573</p>
              <TbCopyCheck size="20" className="text-gray-700" />
            </div>
          </div>
          <div>
            <p className="text-[#5D5D5D] text-sm">Account Name</p>
            <p className="text-xl md:text-3xl font-medium">
              Chukwudi and Sons LTD
            </p>
          </div>
          <div>
            <p className="text-[#5D5D5D] text-sm">Opening Balance (NGN)</p>
            <p className="text-xl md:text-3xl font-medium">5,000,000.88</p>
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
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {item.reference}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.date}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      <span className="font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
                        {item.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <FormatCurrency amount={item.amount} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.balance}
                  </TableCell>
                  <TableCell>{item.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;
