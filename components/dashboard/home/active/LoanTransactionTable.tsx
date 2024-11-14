import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoveRight } from "lucide-react";
import React, { useMemo } from "react";

type Transaction = {
  id: string;
  amount: number;
  maturityAmount: number;
  date: string;
  dueDate: string;
  status: string;
};

type LoanTransactionTableProps = {
  transactions: Transaction[];
  searchQuery: string;
  filter: string | null;
};

export default function LoanTransactionTable({
  transactions,
  searchQuery,
  filter,
}: LoanTransactionTableProps) {
  console.log("transactions:", transactions);
  console.log("searchQuery:", searchQuery);
  console.log("filter:", filter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    // Apply filter only if it's not null or undefined
    if (filter !== null && filter !== undefined) {
      data = data.filter((transaction) =>
        filter === "active"
          ? transaction.status === "Active"
          : transaction.status !== "Active"
      );
    }

    // Apply search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      data = data.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(lowerCaseQuery) ||
          transaction.status.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return data;
  }, [transactions, filter, searchQuery]);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Maturity Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell>
                {formatCurrency(transaction.maturityAmount)}
              </TableCell>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{transaction.dueDate}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
                    {transaction.status}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <MoveRight className="h-4 w-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
