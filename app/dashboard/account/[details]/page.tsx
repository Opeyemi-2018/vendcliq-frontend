"use client";
import BackButtonWithTooltip from "@/components/ui/BackButtonWithToolTips";
import { Button } from "@/components/ui/button";
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
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";

import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
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
      <div className="border border-[#A2A2A2] rounded-xl flex items-center gap-3 px-5 py-3 font-sans">
        <CalendarDays />
        <p>{date}</p>
        <IoCloseOutline size={"28"} className="text-destructive" />
      </div>
    );
  };

  const router = useRouter();

  return (
    <div className="h-screen">
      <div className="py-5 px-10 space-y-5 h-full">
        <div className="flex items-center mb-10 pb-2 gap-3 border-b border-border">
          <BackButtonWithTooltip
            tooltipText="Return"
            className="text-red-500"
          />
          <PageTitle title="Account" />
        </div>

        <div className="flex items-center gap-5">
          <Calender date="05-06-2024" />
          <p>to</p>
          <Calender date="05-06-2024" />
        </div>

        <div className="flex font-sans gap-8 pb-5 pt-14">
          <div>
            <p className="text-[#5D5D5D] text-sm">Account Number</p>
            <div className="flex items-center gap-1">
              <p className="text-3xl font-medium">0135678573</p>
              <TbCopyCheck size="24" />
            </div>
          </div>
          <div>
            <p className="text-[#5D5D5D] text-sm">Account Name</p>
            <div className="flex items-center gap-1">
              <p className="text-3xl font-medium">Chukwudi and Sons LTD</p>
            </div>
          </div>
          <div>
            <p className="text-[#5D5D5D] text-sm">Opening Balance (NGN)</p>
            <div className="flex items-center gap-1">
              <p className="text-3xl font-medium">5,000,000.88</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white font-sans">
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
                  <TableCell className="font-medium">
                    {item.reference}
                  </TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      <span className="font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
                        {item.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <FormatCurrency amount={item.amount} />
                  </TableCell>
                  <TableCell>{item.balance}</TableCell>
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
