import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoveRight } from "lucide-react";

const transactions = [
  {
    id: "#0056757",
    amount: 5000000.0,
    maturityAmount: 6500000.0,
    date: "02/May/2024",
    dueDate: "02/June/2024",
    status: "Active",
  },
  {
    id: "#0056757",
    amount: 5000000.0,
    maturityAmount: 6500000.0,
    date: "02/May/2024",
    dueDate: "02/June/2024",
    status: "Active",
  },
  {
    id: "#0056757",
    amount: 5000000.0,
    maturityAmount: 6500000.0,
    date: "02/May/2024",
    dueDate: "02/June/2024",
    status: "Active",
  },
  {
    id: "#0056757",
    amount: 5000000.0,
    maturityAmount: 6500000.0,
    date: "02/May/2024",
    dueDate: "02/June/2024",
    status: "Active",
  },
];

export default function LoanTransactionTable() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

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
          {transactions.map((transaction, index) => (
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
