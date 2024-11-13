import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const LoanDetailsScreen = () => {
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
                  Active
                </span>
              }
            />
            <Detail label="Loan Amount" value="10,000,000.00" />
            <Detail label="Reference" value="VERA-AF-74679" />
            <Detail label="Interest" value="10% (10,200,000.00)" />
            <Detail label="Interest Frequency" value="Weekly" />
            <Detail label="Duration" value="30 Days" />
            <Detail label="Interest Due Today" value="50,000.00" />
            <Detail label="Amount Due Today" value="10,050,000.00" />
            <Detail label="RepaymentType" value="Principal + Interest" />
            <Detail label="Purpose" value="50 Crates of Fanta" />
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
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 border">#0056757</td>
                      <td className="p-2 border">NGN400,000</td>
                      <td className="p-2 border">02/June/2024</td>
                      <td className="p-2 border">
                        <StatusBadge
                          status={
                            i === 3 ? "Upcoming" : i === 4 ? "Over Due" : "Paid"
                          }
                        />
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
              <span className="font-medium">20th May 2024</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#39498C] font-semibold">
                Loan Disburse Date
              </span>
              <span className="font-medium">24th May 2024</span>
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
  if (status === "Upcoming") color = "bg-gray-200 text-gray-800";
  else if (status === "Over Due") color = "bg-red-200 text-red-800";

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
};

export default LoanDetailsScreen;
