"use client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Copy,
  MoveRight,
  EyeOff,
  Eye,
  ChevronRight,
  ChevronDown,
  CalendarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";

import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ChartAreaAxes } from "@/components/InventoryChart";

type Trans = {
  id: string;
  name: string;
  date: string;
  time: string;
  amount: number;
  status: "completed" | "pending";
};

const transactions: Trans[] = [
  {
    id: "INV - 3456",
    name: "mich",
    date: "May 22nd",
    time: "15:12",
    amount: 300,
    status: "completed",
  },
  {
    id: "INV - 2323",
    name: "john doe",
    date: "May 22nd",
    time: "15:12",
    amount: 300,
    status: "pending",
  },
];

const Home = () => {
  const { user, isUserPending, wallet } = useUser();
  const [showBalance, setShowBallance] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const router = useRouter();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 2, 30), // Mar 30
    to: new Date(2024, 3, 6), // Apr 6
  });

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    console.log("Date range selected:", newDate); // ← Handle date change here
  };

  return (
    <div className="">
      <h1 className="text-[20px] md:text-[25px] font-bold font-dm-sans text-[#2F2F2F]">
        Inventory
      </h1>
      <div className="bg-[url('/blue.svg')] bg-no-repeat bg-cover bg-center p-6 overflow-hidden h-[218px] mt-3 flex flex-col md:flex-row justify-between rounded-2xl">
        <div className="max-w-[50rem] justify-between h-full flex flex-col ">
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3">
              <p className="text-white">Total Sales</p>
              <button
                className="text-white"
                type="button"
                onClick={() => setShowBallance(!showBalance)}
              >
                {showBalance ? <EyeOff size={21} /> : <Eye size={23} />}
              </button>
            </div>

            {showBalance ? (
              <h1 className="text-[28px] font-clash font-bold text-white">
                ****
              </h1>
            ) : (
              <div className="font-clash text-[#2F2F2F] text-[20px] lg:text-[25px] font-semibold">
                <h1 className="text-[16px] lg:text-[25px] xl:text-[31px] md:font-semibold font-clash text-white  md:leading-6 lg:leading-10">
                  ₦300,500,750
                </h1>
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center gap-14 ">
            <div className="flex items-center gap-1">
              <p className="text-white">Breakdown by Store</p>
              <ChevronRight color="white" />
            </div>
            <div className="flex items-center gap-1">
              <p className="text-white">Breakdown by Medium</p>
              <ChevronRight color="white" />
            </div>
          </div>
        </div>
        <div className="pt-6">
          <div className={cn("grid gap-2")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal h-10 px-3",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "MMM, dd")} -{" "}
                        {format(date.to, "MMM, dd")}
                      </>
                    ) : (
                      format(date.from, "MMM, dd")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h1 className="font-bold text-[16px] font-dm-sans text-[#2F2F2F]">
          Quick Actions
        </h1>
        <div className="mt-4 flex items-center gap-4">
          <Button
            onClick={() => router.push("/dashboards/inventory/sell")}
            className="bg-[#0A6DC0] hover:bg-[#09599a] w-full text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6  text-white"
          >
            <Image src={"/sell.svg"} width={20} height={20} alt="wallet" />
            Sell
          </Button>
          <Button
            onClick={() => router.push("/dashboards/inventory/buy")}
            className="bg-[#0A2540] hover:bg-[#304c6a] w-full text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6  text-white"
          >
            <Image src={"/iv-buy.svg"} width={20} height={20} alt="wallet" />
            Buy
          </Button>
          <Button
            onClick={() => router.push("/dashboards/inventory/my-store")}
            variant={"outline"}
            className="bg-white w-full text-[16px] flex gap-2 lg:gap-10 px-6 py-5 md:py-6  text-#2F2F2F"
          >
            <Image src={"/store.svg"} width={20} height={20} alt="wallet" />
            My Store
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-col lg:flex-row md:items-center gap-3">
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white font-dm-sans text-[#2F2F2F] w-full lg:w-[50%]">
          <div className="flex justify-between items-center font-dm-sans mb-3">
            <h2 className="font-bold ">Sales Transactions</h2>
            <button className="font-bold text-[13px] text-[#0A6DC0]">
              see all
            </button>
          </div>
          {transactions.map((items) => {
            const { id, name, amount, date, time, status } = items;
            return (
              <div
                key={id}
                className="p-3 rounded-xl border border-[#D8D8D866] mb-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Image src={"/in.svg"} alt="logo" height={30} width={30} />
                    <div className="-space-y-1">
                      <h1 className="text-[16px] font-medium">{id}</h1>
                      <p className="text-[16px] font-medium">{name}</p>
                      <div className="text-[#9E9A9A] text-[13px]">
                        {date}
                        {time}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[16px] text-[#464343]">
                      {amount.toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      })}
                    </p>
                    <p
                      className={` text-[12px] font-bold px-2 py-1 rounded-full ${status === "completed" ? "text-[#003909] bg-[#E7F4EB]" : "text-[#F5B102] bg-[#f6f6f5]"}`}
                    >
                      {status}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="md:p-6 lg:border border-[#E4E4E4] rounded-[20px] bg-white font-dm-sans text-[#2F2F2F] w-full lg:w-[50%]">
          <div className="flex justify-between items-center font-dm-sans mb-3">
            <h2 className="font-bold ">Purchase Requests</h2>
            <button className="font-bold text-[13px] text-[#0A6DC0]">
              see all
            </button>
          </div>
          {transactions.map((items) => {
            const { id, name, amount, date, time, status } = items;
            return (
              <div
                key={id}
                className="p-3 rounded-xl border border-[#D8D8D866] mb-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Image
                      src={status === "completed" ? "/in.svg" : "/out.svg"}
                      alt="logo"
                      height={30}
                      width={30}
                    />
                    <div className="-space-y-1">
                      <h1 className="text-[16px] font-medium">{id}</h1>
                      <p className="text-[16px] font-medium">{name}</p>
                      <div className="text-[#9E9A9A] text-[13px]">
                        {date}
                        {time}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[16px] text-[#464343]">
                      {amount.toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      })}
                    </p>
                    <p
                      className={` text-[12px] font-bold px-2 py-1 rounded-full ${status === "completed" ? "text-[#003909] bg-[#E7F4EB]" : "text-[#F5B102] bg-[#f6f6f5]"}`}
                    >
                      {status}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        <ChartAreaAxes />
      </div>
    </div>
  );
};

export default Home;
