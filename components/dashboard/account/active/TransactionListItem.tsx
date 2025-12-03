import React from "react";
import { RouteSquare } from "iconsax-react";

interface TransactionListItemProps {
  date: string;
  description: string;
  recipientInfo: string;
  transactionId: string;
  amount: string;
  isOutgoing: boolean;
  isCredit: boolean;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  date,
  description,
  recipientInfo,
  transactionId,
  amount,

  isCredit,
}) => (
  <div className="flex flex-col gap-4 font-medium mt-6 py-4 px-4 sm:px-6 border-b border-border text-sm sm:text-base">
    {/* Date */}
    <p className="text-[#797979] text-xs sm:text-sm md:text-base">{date}</p>

    {/* Transaction Details */}
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex flex-col md:flex-row gap-3 sm:gap-6 items-start">
        {/* Icon */}
        {isCredit ? (
          <RouteSquare size="44" color="#00C53A" />
        ) : (
          <RouteSquare
            size="44"
            color="#E33629"
            style={{ transform: "rotate(90deg)" }}
          />
        )}

        {/* Description and Details */}
        <div className="flex flex-col w-full">
          <p className="text-[#797979] text-xs sm:text-sm md:text-base break-words text-wrap truncate md:truncate-none">
            {description.length > 20
              ? description.substring(0, 20) + "..."
              : description}
          </p>
          <p className="text-[#797979] text-xs sm:text-sm md:text-base break-words ">
            {recipientInfo}
          </p>
          <p className="text-xs sm:text-sm md:text-base break-words">
            {transactionId}
          </p>
        </div>
      </div>

      {/* Amount */}
      <p
        className={`text-nowrap text-xs sm:text-sm md:text-base ${
          isCredit ? "text-[#00C53A]" : "text-destructive"
        }`}
      >
        {amount}
      </p>
    </div>
  </div>
);
