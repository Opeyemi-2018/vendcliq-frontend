import { Button } from "@/components/ui/button";
import { TiArrowRight } from "react-icons/ti";
import React from "react";
import Link from "next/link";

interface DashboardCardProps {
  title: string;
  amount: string;
  nextPaymentDate?: string;
  showButtons?: boolean;
  onSendMoney?: () => void;
  onFundWallet?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  amount,
  nextPaymentDate,
  showButtons,
}) => (
  <div
    className={`${
      title === "Active loan" ? "bg-[#69A7F4]" : "bg-[#D6EBC3]"
    } p-5 md:p-6 lg:p-8 rounded-lg w-full h-fit md:h-full`}
  >
    <div className="text-[#565656] text-lg md:text-xl font-sans font-medium">
      {title}
    </div>
    <p className="font-semibold text-2xl md:text-3xl text-black mt-3">
      {amount}
    </p>
    {nextPaymentDate && (
      <div className="flex flex-wrap items-center gap-1 mt-4 md:mt-3">
        <p className="font-sans text-sm md:text-md text-[#292826]">
          Next Payment:
        </p>
        <p className="text-black font-medium">{nextPaymentDate}</p>
      </div>
    )}
    {showButtons && (
      <div className="flex flex-col md:flex-row sm:flex-row sm:items-center gap-3 mt-5 md:mt-3">
        <Link href={"/transfer"}>
          <Button className="w-fit sm:w-fit h-9 text-xs md:text-sm flex justify-center items-center bg-[#39498C] text-white rounded-md px-4">
            Send Money
            <TiArrowRight size="20" className="text-white ml-2" />
          </Button>
        </Link>
        <Link href={"/transfer"}>
          <Button className="w-fit sm:w-fit h-9 text-xs md:text-sm flex justify-center items-center text-black bg-transparent border border-gray-400 rounded-md px-4">
            Fund Wallet
            <TiArrowRight size="20" className="text-black ml-2" />
          </Button>
        </Link>
      </div>
    )}
  </div>
);
