import React from "react";

interface SummaryCardProps {
  title: string;
  amount: string;
  nextPaymentDate?: string;
  showButtons?: boolean;
  onSendMoney?: () => void;
  onFundWallet?: () => void;
  icon: React.ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  icon,
}) => (
  <div
    className={`${
      title === "Active loan"
        ? "bg-[#69A7F4]"
        : title === "Total Repaid"
        ? "bg-[#FFD539]"
        : title === "Total Outstanding"
        ? "bg-[#D6EBC3]"
        : "bg-[#F3F55C]"
    } py-5 h-full pl-5 rounded-lg w-full`}
  >
    <div className="text-[#565656] text-lg font-sans font-medium flex">
      {icon}
      {title}
    </div>
    <p className="font-semibold text-3xl text-black mt-3">{amount}</p>
  </div>
);
