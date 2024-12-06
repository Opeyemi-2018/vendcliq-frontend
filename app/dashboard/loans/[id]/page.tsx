"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { handleGetLoanDetails } from "@/lib/utils/api/apiHelper";
import { useParams } from "next/navigation";

const LoanDetailsScreen = () => {
  const { id } = useParams() as { id: string };
  const loanId = Array.isArray(id) ? id[0] : id;

  const { data: loanDetails, isLoading } = useQuery({
    queryKey: ["loanDetails", loanId],
    queryFn: () => handleGetLoanDetails(loanId as string),
    enabled: !!loanId,
  });

  if (isLoading || !loanId) {
    return <div>Loading...</div>;
  }

  const loan = loanDetails?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 md:p-8">
      <div className="rounded-lg w-full font-sans mx-auto p-4 sm:p-6 md:p-8">
        {/* Loan Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 font-clash">
            Loan Details
          </h3>
          <div className="text-right mb-4">
            <Link href={"/payloan"}>
              <Button className="px-4 py-1 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-600">
                + Pay Loan
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <Detail
              label="Status"
              value={
                <span className="flex items-center bg-[#D8DFFF] w-fit px-3 rounded-2xl font-medium text-sm text-[#39498C] gap-2">
                  <span className="w-2 h-2 bg-[#39498C] rounded-full"></span>{" "}
                  {loan?.status || "Active"}
                </span>
              }
            />
            <Detail
              label="Loan Amount"
              value={formatCurrency(Number(loan?.amount) || 0)}
            />
            <Detail label="Reference" value={loan?.reference || "-"} />
            <Detail
              label="Interest"
              value={`${loan?.interestRate || 0}% (${formatCurrency(
                Number(loan?.interestAmount) || 0
              )})`}
            />
            <Detail
              label="Interest Frequency"
              value={loan?.interestFrequency || "-"}
            />
            <Detail label="Duration" value={`${loan?.duration || 0} Days`} />
            <Detail
              label="Interest Due Today"
              value={formatCurrency(Number(loan?.interestDueToday) || 0)}
            />
            <Detail
              label="Amount Due Today"
              value={formatCurrency(Number(loan?.amountDueToday) || 0)}
            />
            <Detail
              label="RepaymentType"
              value={loan?.repaymentPattern || "-"}
            />
            <Detail label="Purpose" value={loan?.purpose || "-"} />
          </div>
        </div>

        {/* Loan Schedules */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold font-clash mb-4">
            Loan Schedules
          </h3>
          <div className="bg-white overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-200 min-w-[600px]">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Reference ID</th>
                  <th className="p-2 border">Total Repayment</th>
                  <th className="p-2 border">Payment Date</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {loan?.repayments?.map((repayment) => (
                  <tr key={repayment.id} className="border-t">
                    <td className="p-2 border">{repayment.reference}</td>
                    <td className="p-2 border">
                      {formatCurrency(Number(repayment.amount))}
                    </td>
                    <td className="p-2 border">
                      {new Date(repayment.due_date).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      <StatusBadge status={repayment.status} />
                    </td>
                    <td className="p-2 border">
                      <Link href={"/payloan"}>
                        <Button className="px-3 h-fit bg-yellow-500 text-black rounded-md hover:bg-yellow-600">
                          + Pay Loan
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dates Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold font-clash mb-4">Dates</h3>
          <div className="space-y-2 bg-white p-5">
            <div className="flex justify-between text-sm">
              <span className="text-[#39498C] font-semibold">
                Loan Review Date
              </span>
              <span className="font-medium">
                {loan?.reviewDate
                  ? new Date(loan.reviewDate).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#39498C] font-semibold">
                Loan Disburse Date
              </span>
              <span className="font-medium">
                {loan?.disburseDate
                  ? new Date(loan.disburseDate).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detail Component
const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col justify-between">
    <span className="text-[#39498C] font-semibold">{label}</span>
    <span className="text-[#585D5C] text-sm">{value}</span>
  </div>
);

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let color = "bg-green-200 text-green-800"; // Default to "Paid"
  if (status === "upcoming") color = "bg-gray-200 text-gray-800";
  else if (status === "overdue") color = "bg-red-200 text-red-800";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default LoanDetailsScreen;
