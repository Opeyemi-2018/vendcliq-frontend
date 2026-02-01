/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UserPen } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";

const dummyReport = [
  {
    id: 1,
    storeName: "ghe ghe",
    itemName: "Coca-Cola",
    OpeningQty: 10,
    ClosingQty: 10,
    OpeningEmptyQty: 20,
    ClosingEmptyQty: 15,
    totalQtyDiff: 15,
    openingStockValue: "500,000",
  },
];

const Expenses = () => {
  const [reports, setReport] = useState(dummyReport);

  return (
    <div>
      <div className="flex md:items-center justify-between gap-3 md:gap-0 flex-col md:flex-row mb-6">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
            Business Reports
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            View your business key performance reports and stock summaries
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Opening Stock Value
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            ₦300,500,750
          </h2>
        </div>
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Closing Stock Value
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            ₦300,500,750
          </h2>
        </div>
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Total Invoice Value - 30 Invoices
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            ₦300,500,750
          </h2>
        </div>
        <div className="bg-[url('/balance-bg.svg')] text-white bg-cover bg-no-repeat bg-center min-w-[260px] w-[280px] flex-shrink-0 h-[117px] rounded-2xl p-6">
          <p className="font-regular font-dm-sans text-[13px] md:text-[16px]">
            Profit Generated
          </p>
          <h2 className="font-semibold text-[16px] md:text-[20px] font-clash">
            ₦300,500,750
          </h2>
        </div>
      </div>

      <div className="md:p-6 lg:border bg-white border-[#E4E4E4] rounded-lg">
        <h1 className="font-dm-sans text-[#2F2F2F] dark:text-white font-bold">
          Stock Table Report ({reports.length})
        </h1>

        <Card className="mt-3 py-5 relative">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#E6E6E6]">
                <tr>
                  <th className="text-left pl-4 py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Store Name
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Item Name
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Qty
                  </th>
                  <th className="hidden md:table-cell text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Closing Qty
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Empty Qty
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Closing Empty Qty
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Total Qty Diff
                  </th>
                  <th className="text-left py-3 font-medium font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F]">
                    Opening Stock Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 px-4">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <UserPen size={40} className="text-gray-400" />
                        <p className="font-bold font-dm-sans text-[16px] text-[#2F2F2F] dark:text-white">
                          No report found
                        </p>
                        <p className="text-[#9E9A9A] dark:text-gray-400 font-dm-sans">
                          Your report will appear here
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors font-regular font-dm-sans text-[11px] md:text-[13px] lg:text-[16px] text-[#2F2F2F] dark:text-gray-200"
                    >
                      <td className="py-4 pl-4 font-medium">
                        {report.storeName}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.itemName}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.OpeningQty}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.ClosingQty}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.OpeningEmptyQty}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.ClosingEmptyQty}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.totalQtyDiff}
                      </td>
                      <td className="hidden md:table-cell py-4">
                        {report.openingStockValue}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Expenses;
