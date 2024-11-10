// components/ui/TransactionListItem.tsx
import { BsArrowDownRightSquare, BsArrowUpRightSquare } from "react-icons/bs";
import React from "react";

interface TransactionListItemProps {
  date: string;
  description: string;
  recipientInfo: string;
  transactionId: string;
  amount: string;
  isOutgoing: boolean;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  date,
  description,
  recipientInfo,
  transactionId,
  amount,
  isOutgoing,
}) => (
  <div className="flex flex-col gap-5 font-medium py-5 border-b pr-10 border-border text-md">
    <p className="text-[#797979]">{date}</p>
    <div className="flex items-center justify-between">
      <div className="flex gap-10">
        {isOutgoing ? (
          <BsArrowUpRightSquare size={32} className="text-destructive" />
        ) : (
          <BsArrowDownRightSquare size={32} className="text-[#00C53A]" />
        )}
        <div className="">
          <p className="text-[#797979]">{description}</p>
          <p className="text-[#797979]">{recipientInfo}</p>
          <p>{transactionId}</p>
        </div>
      </div>
      <p className={isOutgoing ? "text-destructive" : "text-[#00C53A]"}>
        {amount}
      </p>
    </div>
  </div>
);
