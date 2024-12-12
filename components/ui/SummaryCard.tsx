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
    } py-5 sm:py-6 md:py-8 h-full px-4 sm:px-5 md:px-6 rounded-lg w-full  border border-[#DBDBDB]`}
  >
    <div className="text-[#565656] text-md sm:text-lg md:text-xl font-sans font-medium flex items-center gap-2">
      {icon}
      {title}
    </div>
    <p className="font-semibold text-xl md:text-2xl text-black mt-3">
      {amount}
    </p>
  </div>
);
