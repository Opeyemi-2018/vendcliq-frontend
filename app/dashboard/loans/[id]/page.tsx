"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { handleGetLoanDetails } from "@/lib/utils/api/apiHelper";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IoArrowBack } from "react-icons/io5";
import { Loader } from "lucide-react";

const LoanDetailsScreen = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const loanId = Array.isArray(id) ? id[0] : id;

  const { data: loanDetails, isLoading } = useQuery({
    queryKey: ["loanDetails", loanId],
    queryFn: () => handleGetLoanDetails(loanId as string),
    enabled: !!loanId,
  });

  if (isLoading || !loanId) {
    return (
      <div className="w-full min-h-screen p-4 sm:p-6 md:p-8">
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </div>
    );
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
      <Button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        <IoArrowBack /> Back
      </Button>

      <div className="rounded-lg w-full font-sans mx-auto p-4 sm:p-6 md:p-8">
        {/* Loan Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 font-clash">
            Loan Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <Detail
              key="status"
              label="Status"
              value={
                <span className="flex items-center bg-[#D8DFFF] w-fit px-3 rounded-2xl font-medium text-sm text-[#39498C] gap-2">
                  <span className="w-2 h-2 bg-[#39498C] rounded-full"></span>{" "}
                  {loan?.status || "Active"}
                </span>
              }
            />
            <Detail
              key="loan-amount"
              label="Loan Amount"
              value={formatCurrency(Number(loan?.amount) || 0)}
            />
            <Detail
              key="reference"
              label="Reference"
              value={loan?.reference || "-"}
            />
            <Detail
              key="interest"
              label="Interest"
              value={`${loan?.interestRate || 0}% (${formatCurrency(
                Number(loan?.interestAmount) || 0
              )})`}
            />
            <Detail
              key="interest-frequency"
              label="Interest Frequency"
              value={formatCurrency(Number(loan?.interestRate) || 0)}
            />
            <Detail
              key="duration"
              label="Duration"
              value={`${loan?.duration || 0} Days`}
            />
            <Detail
              key="interest-due-today"
              label="Interest Due Today"
              value={formatCurrency(Number(loan?.interestDueToday) || 0)}
            />
            <Detail
              key="amount-due-today"
              label="Amount Due Today"
              value={formatCurrency(Number(loan?.amountDueToday) || 0)}
            />
            <Detail
              key="repayment-type"
              label="RepaymentType"
              value={loan?.repaymentPattern || "-"}
            />
            <Detail
              key="purpose"
              label="Purpose"
              value={loan?.purpose || "-"}
            />
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
                </tr>
              </thead>
              <tbody>
                {loan?.repayments?.map((repayment) => (
                  <tr key={repayment.id} className="border-t">
                    <td className="p-2 border">{loan.reference}</td>
                    <td className="p-2 border">
                      {formatCurrency(Number(repayment.amount))}
                    </td>
                    <td className="p-2 border">
                      {new Date(repayment.due_date).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      {loan.status === "ACTIVE" ? (
                        <Button
                          onClick={() => {
                            router.push(`/dashboard/payloan/${loan.id}`);
                          }}
                          disabled={loan.status !== "ACTIVE"}
                          className="px-3 h-fit bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
                        >
                          + Pay Loan
                        </Button>
                      ) : (
                        <StatusBadge status={loan.status} />
                      )}
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
                {loan?.loanReviewDate && loan.loanReviewDate !== "null"
                  ? new Date(loan.loanReviewDate).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#39498C] font-semibold">
                Loan Disburse Date
              </span>
              <span className="font-medium">
                {loan?.loanDisburseDate && loan.loanDisburseDate !== "null"
                  ? new Date(loan.loanDisburseDate).toLocaleDateString()
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
const StatusBadge: React.FC<{ status: string; className?: string }> = ({
  status,
  className,
}) => {
  let color = "bg-green-200 text-green-800"; // Default to "Paid"
  if (status === "upcoming") color = "bg-gray-200 text-gray-800";
  else if (status === "overdue") color = "bg-red-200 text-red-800";

  return (
    <span
      className={cn(
        `px-2 py-1 rounded-full text-xs font-semibold ${color}`,
        className
      )}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default LoanDetailsScreen;
