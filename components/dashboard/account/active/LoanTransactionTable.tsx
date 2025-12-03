import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";

type Transaction = {
  id: string;
  reference: string;
  amount: string;
  interestAmount: string;
  createdAt: string;
  expiringDate: string;
  status: string;
  loanDisburseDate?: string;
  repayments: Array<{
    id: number;
    loanId: number;
    status: string;
    repaymentAmount: number;
    repaymentAmountCollected: number;
  }>;
};

type LoanTransactionTableProps = {
  transactions: Transaction[];
  searchQuery: string;
  // filter: string | null;
  sortOrder: "asc" | "desc" | null;
};

export default function LoanTransactionTable({
  transactions,
  searchQuery,
}: // filter,
// sortOrder,
LoanTransactionTableProps) {
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(Number(amount));
  };

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    // Apply filter only if it's not null or undefined
    // if (filter !== null && filter !== undefined) {
    //   data = data.filter((transaction) =>
    //     filter === "active"
    //       ? transaction.status.toLowerCase() === "active"
    //       : transaction.status.toLowerCase() !== "active"
    //   );
    // }

    // Apply search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      data = data.filter(
        (transaction) =>
          transaction.reference.toLowerCase().includes(lowerCaseQuery) ||
          transaction.status.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return data;
  }, [transactions, searchQuery]);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Reference</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Maturity Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {transaction.reference}
                </TableCell>
                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell>
                  {formatCurrency(transaction.interestAmount)}
                </TableCell>
                <TableCell>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(transaction.expiringDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-2.5 w-2.5 rounded-full ${
                        transaction.status.toLowerCase() === "active"
                          ? "bg-green-500"
                          : transaction.status.toLowerCase() === "rejected"
                          ? "bg-red-500"
                          : transaction.status.toLowerCase() === "approved"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <span
                      className={`font-medium px-3 py-1 rounded-full text-sm ${
                        transaction.status.toLowerCase() === "active"
                          ? "text-green-700 bg-green-50"
                          : transaction.status.toLowerCase() === "rejected"
                          ? "text-red-700 bg-red-50"
                          : transaction.status.toLowerCase() === "approved"
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-700 bg-gray-50"
                      }`}
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`loans/${transaction.id}`}>
                    <MoveRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
