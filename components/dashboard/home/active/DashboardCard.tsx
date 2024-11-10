// components/ui/DashboardCard.tsx
import { Button } from "@/components/ui/button";
import { TiArrowRight } from "react-icons/ti";
import React from "react";

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
  onSendMoney,
  onFundWallet,
}) => (
  <div
    className={`${
      title === "Active loan" ? "bg-[#69A7F4]" : "bg-[#D6EBC3]"
    } py-5 h-full pl-5 rounded-lg w-full`}
  >
    <div className="text-[#565656] text-lg font-sans font-medium">{title}</div>
    <p className="font-semibold text-3xl text-black mt-3">{amount}</p>
    {nextPaymentDate && (
      <div className="flex items-center gap-1 mt-7 ">
        <p className="font-sans text-md text-[#292826]">Next Payment:</p>
        <p className="text-black font-medium">{nextPaymentDate}</p>
      </div>
    )}
    {showButtons && (
      <div className="flex items-center gap-3 mt-7">
        <Button
          className="w-fit h-8 text-sm flex bg-[#39498C] text-white rounded-md"
          onClick={onSendMoney}
        >
          Send Money
          <TiArrowRight size="20" className="text-white" />
        </Button>
        <Button
          className="w-fit h-8 text-sm text-black flex rounded-md"
          onClick={onFundWallet}
        >
          Fund Wallet
          <TiArrowRight size="20" className="text-black" />
        </Button>
      </div>
    )}
  </div>
);
