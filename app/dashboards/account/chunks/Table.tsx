"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpNarrowWide,
  Calculator,
  Calendar,
  ChevronDown,
  MoveRight,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const transactions = [
  {
    id: 1,
    date: "7 Mar 2024",
    time: " 17:38:00",
    description:
      "WEMA BANK | EBUBE DRINKS LIMITED /00003883383364YTHD647749904",
    amount: "-5,000,000 NGN",
    status: "paidOut",
  },
  {
    id: 2,
    date: "7 Mar 2024",
    time: " 17:38:00",
    description:
      "WEMA BANK | EBUBE DRINKS LIMITED /00003883383364YTHD647749904",
    amount: "+7,000,000 NGN",
    status: "paidIn",
  },
  {
    id: 3,
    date: "7 Mar 2024",
    time: " 17:38:00",
    description:
      "WEMA BANK | EBUBE DRINKS LIMITED /00003883383364YTHD647749904",
    amount: "-3,000,000 NGN",
    status: "paidOut",
  },
  {
    id: 4,
    date: "7 Mar 2024",
    time: " 17:38:00",
    description:
      "WEMA BANK | EBUBE DRINKS LIMITED /00003883383364YTHD647749904",
    amount: "2,000,000 NGN",
    status: "paidIn",
  },
];

const Loans = [
  {
    id: "#005676",
    amount: "5,000,000.00",
    MaturityAmount: "6,500,000.00",
    date: "02/May/2024",
    dueDate: "02/May/2024",
    status: "active",
  },
  {
    id: "#003746",
    amount: "5,000,000.00",
    MaturityAmount: "6,500,000.00",
    date: "02/May/2024",
    dueDate: "02/May/2024",
    status: "active",
  },
  {
    id: "#008394",
    amount: "5,000,000.00",
    MaturityAmount: "6,500,000.00",
    date: "02/May/2024",
    dueDate: "02/May/2024",
    status: "active",
  },
  {
    id: "#003748",
    amount: "5,000,000.00",
    MaturityAmount: "6,500,000.00",
    date: "02/May/2024",
    dueDate: "02/May/2024",
    status: "active",
  },
];
const Table = () => {
  const tabs = ["Payment Transaction", "Loan Transactions"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  console.log(activeTab);
  return (
    <div>
      <div className="flex justify-between flex-col items-start gap-2 lg:gap-0 lg:flex-row ">
        <div className="flex gap-4 lg:gap-10">
          <button
            onClick={() => setActiveTab(tabs[0])}
            className={`text-[13px] lg:text-[16px] font-dm-sans ${
              activeTab === "Payment Transaction"
                ? "text-[#0A6DC0] font-bold  border-b-2 border-[#0A6DC0]"
                : "text-[#2F2F2F] font-medium"
            }`}
          >
            Payment Transactions
          </button>
          <button
            onClick={() => setActiveTab(tabs[1])}
            className={`text-[13px] lg:text-[16px] ${
              activeTab === "Loan Transactions"
                ? "text-[#0A6DC0] font-bold font-dm-sans border-b-2 border-[#0A6DC0]"
                : "text-[#2F2F2F] font-medium"
            }`}
          >
            Loan Transactions{" "}
          </button>
        </div>

        {activeTab === "Loan Transactions" && (
          <>
            <Input
              placeholder="Type to search"
              className="lg:w-[329px] bg-transparent border-2 border-[#E7EBED]"
            />
            <div className="hidden lg:flex gap-4 border-2 border-[#E7EBED] p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={20} /> filter <ChevronDown />
              </div>
              <Separator orientation="vertical" className="h-4" />

              <div className="flex items-center gap-2">
                <ArrowUpNarrowWide size={20} /> sort <ChevronDown />
              </div>
            </div>
          </>
        )}
      </div>

      {activeTab === "Payment Transaction" && (
        <div className="flex flex-col xl:flex-row mt-6 lg:gap-10 gap-4 justify-between">
          <div className="w-[60] space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="space-y-1">
                <div className="flex items-center gap-2 text-[14px] font-regular text-[#6F6F6F]">
                  <p>{transaction.date}</p>
                  <Separator orientation="vertical" className="h-4" />
                  <p>{transaction.time}</p>
                </div>
                <div className="flex sm:gap-4 sm:items-center flex-col sm:flex-row ">
                  <div className="">
                    <Image
                      src={
                        transaction.status === "paidOut"
                          ? "/out.svg"
                          : "/in.svg"
                      }
                      width={30}
                      height={30}
                      alt="wallet"
                      className="flex-shrink-0  hidden lg:inline"
                    />
                  </div>

                  <h1 className="font-medium   lg:font-bold text-[10px] lg:text-[14px] font-dm-sans">
                    {transaction.description}
                  </h1>

                  <h1
                    className={`whitespace-nowrap text-[12px] lg:text-[16px] font-dm-sans font-medium ${
                      transaction.status === "paidIn"
                        ? "text-[#00C53A]"
                        : "text-[#FF6242]"
                    }`}
                  >
                    {transaction.amount}
                  </h1>
                </div>

                <Separator orientation="horizontal" />
              </div>
            ))}
          </div>
          <div className="xl:w-[45%] border border-[#E4E4E4] px-4 lg:px-7 py-5  bg-white rounded-2xl">
            <div className="flex items-center gap-2">
              {" "}
              <Calendar /> Last 7 days. <ChevronDown />{" "}
            </div>
            <Separator orientation="horizontal" className="mt-3" />
            <div className="space-y-4">
              <div className="mt-4 border border-[#E4E4E4] px-4 lg:px-7 py-5  bg-white rounded-2xl">
                <div className="flex items-center gap-1 ">
                  <Calculator className="text-[#39498C]" />
                  <p className="font-medium text-[#39498C] text-[14px] font-dm-sann">
                    Total Transaction Value
                  </p>
                </div>
                <p className="text-[16px] font-clash text-[#292826] font-semibold">
                  NGN 300,000.00
                </p>
              </div>
              <div className="mt-4 border border-[#E4E4E4] px-4 lg:px-7 py-5  bg-white rounded-2xl">
                <div className="flex items-center gap-1 ">
                  <Calculator className="text-[#39498C]" />
                  <p className="font-medium text-[#39498C] text-[14px] font-dm-sann">
                    Collections Value
                  </p>
                </div>
                <p className="text-[16px] font-clash text-[#292826] font-semibold">
                  NGN 300,000.00
                </p>
              </div>
              <div className="mt-4 border border-[#E4E4E4] px-4 lg:px-7 py-5  bg-white rounded-2xl">
                <div className="flex items-center gap-1 ">
                  <Calculator className="text-[#39498C]" />
                  <p className="font-medium text-[#39498C] text-[14px] font-dm-sann">
                    Transfer Value
                  </p>
                </div>
                <p className="text-[16px] font-clash text-[#292826] font-semibold">
                  NGN 300,000.00
                </p>
              </div>
            </div>
            <Link
              href={"#"}
              className="text-[#39498C] font-medium font-dm-sans text-[14px] pt-4"
            >
              See More
            </Link>
          </div>
        </div>
      )}

      {activeTab === "Loan Transactions" && (
        <div className="overflow-x-auto mt-6  border-[#E4E4E4] border-2 bg-white  rounded-2xl">
          <table className="w-full my-6">
            <thead className="">
              <tr>
                <th className="text-left px-4 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  ID
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Amount
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Maturity Amount
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Date
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Due Date
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  Status
                </th>
                <th className="text-left font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                  More
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Loans.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-[#E4E4E4] border-b hover:bg-gray-200"
                >
                  <td className="text-left p-4 py-4 font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    {loan.id}
                  </td>
                  <td className="text-left py-4 font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    {loan.amount}
                  </td>
                  <td className="text-left py-4 font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    {loan.MaturityAmount}
                  </td>
                  <td className="text-left py-4 font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    {loan.date}
                  </td>
                  <td className="text-left py-4 font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    {loan.dueDate}
                  </td>
                  <td className="text-left  ">
                    <Button className="bg-[#E7F4EB] hover:bg-[#E7F4EB] md:font-bold py-0 text-[#003909] text-[12px] rounded-full">
                      <span className="bg-[#00C53A] h-2 w-2 rounded-full"></span>{" "}
                      {loan.status}
                    </Button>
                  </td>
                  <td className="py-4 font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] ">
                    <MoveRight />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Table;
