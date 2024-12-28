import React, { useState } from "react";
import Link from "next/link";
import TransactionCard from "@/components/ui/TransactionCard";
import { Bank, Calendar } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { handleGetTransactionHistory } from "@/lib/utils/api/apiHelper";

const TransactionSummary: React.FC = () => {
  const [currentPage] = useState(1);

  const { data } = useQuery({
    queryKey: ["transactionHistory", currentPage],
    queryFn: () => handleGetTransactionHistory(currentPage),
  });

  const transactions = data?.data?.data || [];

  // Calculate total transaction value
  const totalValue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate collections (credits)
  const collectionsValue = transactions
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate transfers (debits)
  const transferValue = transactions
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

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
        value={formatCurrency(totalValue)}
        icon={<Bank size="24" color="#39498C" />}
      />
      <TransactionCard
        title="Collections Value"
        value={formatCurrency(collectionsValue)}
        icon={<Bank size="24" color="#39498C" />}
      />
      <TransactionCard
        title="Transfer Value"
        value={formatCurrency(transferValue)}
        icon={<Bank size="24" color="#39498C" />}
      />

      <div className="mt-4 text-center sm:text-left">
        <Link href="/dashboard/transaction">
          <p className="text-blue-600 font-medium hover:underline flex items-center justify-center sm:justify-start">
            See More <span className="ml-1">→</span>
          </p>
        </Link>
      </div>
    </div>
  );
};

export default TransactionSummary;
