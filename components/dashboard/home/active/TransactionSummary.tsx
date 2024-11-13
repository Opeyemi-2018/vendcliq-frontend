import React from "react";
import Link from "next/link";
import { RiBankLine } from "react-icons/ri";
import TransactionCard from "@/components/ui/TransactionCard";
import { Bank, Calendar } from "iconsax-react";
import { Button } from "@/components/ui/button";

const TransactionSummary: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 max-w-lg mx-auto">
      <div className="mb-4">
        <Button className="bg-white border border-gray-300 px-3 py-2 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 flex items-center hover:bg-gray-100 transition-colors duration-150">
          <Calendar size="24" color="#000000" />
          Last 7 days <span className="ml-1">▼</span>
        </Button>
      </div>

      <TransactionCard
        title="Total Transaction Value"
        value="NGN300,000.00"
        icon={<Bank size="24" color="#39498C" />}
      />
      <TransactionCard
        title="Collections Value"
        value="NGN100,000.00"
        icon={<Bank size="24" color="#39498C" />}
      />
      <TransactionCard
        title="Transfer Value"
        value="NGN50,566,856.00"
        icon={<Bank size="24" color="#39498C" />}
      />

      <div className="mt-4 text-center sm:text-left">
        <Link href="/more-details">
          <p className="text-blue-600 font-medium hover:underline flex items-center justify-center sm:justify-start">
            See More <span className="ml-1">→</span>
          </p>
        </Link>
      </div>
    </div>
  );
};

export default TransactionSummary;
