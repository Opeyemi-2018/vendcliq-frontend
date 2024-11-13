import React from "react";
import { RouteSquare } from "iconsax-react";

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
  <div className="flex flex-col gap-4 font-medium mt-6 py-4 px-4 sm:px-6 border-b border-border text-sm sm:text-base">
    {/* Date */}
    <p className="text-[#797979] text-xs sm:text-sm md:text-base">{date}</p>

    {/* Transaction Details */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex flex-col md:flex-row gap-3 sm:gap-6 items-start">
        {/* Icon */}
        {isOutgoing ? (
          <RouteSquare size="44" color="#E33629" />
        ) : (
          <RouteSquare
            size="44"
            color="#00C53A"
            style={{ transform: "rotate(90deg)" }}
          />
        )}

        {/* Description and Details */}
        <div className="flex flex-col">
          <p className="text-[#797979] text-xs sm:text-sm md:text-base">
            {description}
          </p>
          <p className="text-[#797979] text-xs sm:text-sm md:text-base">
            {recipientInfo}
          </p>
          <p className="text-xs sm:text-sm md:text-base">{transactionId}</p>
        </div>
      </div>

      {/* Amount */}
      <p
        className={`text-xs sm:text-sm md:text-base ${
          isOutgoing ? "text-destructive" : "text-[#00C53A]"
        }`}
      >
        {amount}
      </p>
    </div>
  </div>
);
