import React from "react";

import Link from "next/link";
import { RiBankLine } from "react-icons/ri";
import TransactionCard from "@/components/ui/TransactionCard";

const TransactionSummary: React.FC = () => {
  return (
    <div className="p-5">
      <div className="mb-4">
        <button className="bg-white border px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-700">
          Last 7 days <span className="ml-1">▼</span>
        </button>
      </div>

      <TransactionCard
        title="Total Transaction Value"
        value="NGN300,000.00"
        icon={<RiBankLine className="text-[#39498C] text-2xl" />}
      />
      <TransactionCard
        title="Collections Value"
        value="NGN100,000,00.00"
        icon={<RiBankLine className="text-[#39498C] text-2xl" />}
      />
      <TransactionCard
        title="Transfer Value"
        value="NGN50,566,856.00"
        icon={<RiBankLine className="text-[#39498C] text-2xl" />}
      />

      <div className="mt-4">
        <Link href="/more-details">
          <div className="text-blue-600 font-medium hover:underline flex items-center">
            See More <span className="ml-1">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TransactionSummary;
