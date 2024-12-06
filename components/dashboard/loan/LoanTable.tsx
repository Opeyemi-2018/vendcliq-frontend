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

interface LoanTableProps {
  searchQuery: string;
  data: Array<{
    id: number;
    amount: string;
    status: string;
    createdAt: string;
    interestAmount: string;
    expiringDate: string;
  }>;
}

const LoanTable = ({ searchQuery, data }: LoanTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  // Filter data based on the search query
  const filteredData = data.filter(
    (loan) =>
      loan.id.toString().includes(searchQuery) ||
      loan.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          {filteredData.length > 0 ? (
            filteredData.map((loan, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{loan.id}</TableCell>
                <TableCell>{formatCurrency(Number(loan.amount))}</TableCell>
                <TableCell>
                  {formatCurrency(Number(loan.interestAmount))}
                </TableCell>
                <TableCell>
                  {new Date(loan.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(loan.expiringDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-2.5 w-2.5 rounded-full ${
                        loan.status === "active"
                          ? "bg-green-500"
                          : loan.status === "rejected"
                          ? "bg-red-500"
                          : loan.status === "approved"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <span
                      className={`font-medium px-3 py-1 rounded-full text-sm ${
                        loan.status === "active"
                          ? "text-green-700 bg-green-50"
                          : loan.status === "rejected"
                          ? "text-red-700 bg-red-50"
                          : loan.status === "approved"
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-700 bg-gray-50"
                      }`}
                    >
                      {loan.status.charAt(0).toUpperCase() +
                        loan.status.slice(1)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`loans/${loan.id}`}>
                    <MoveRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No loans found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LoanTable;
