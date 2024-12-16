"use client";
import LoanTable from "@/components/dashboard/loan/LoanTable";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard } from "@/components/ui/StatCard";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { handleGetLoan } from "@/lib/utils/api/apiHelper";
import { LoanResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { TableDocument, Wallet3 } from "iconsax-react";
import Link from "next/link";
import React, { useState } from "react";
import { CgNotes } from "react-icons/cg";
import { FaArrowRightLong } from "react-icons/fa6";
import { RiBankLine } from "react-icons/ri";

const Page = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: loan } = useQuery<LoanResponse>({
    queryKey: ["loan"],
    queryFn: () => handleGetLoan(),
  });

  const loans = loan?.data?.data || [];

  const activeLoan = loans.find((loan) => loan.status === "active");
  const totalAmount = loans.reduce((sum, loan) => sum + Number(loan.amount), 0);
  const totalApproved = loans.filter(
    (loan) => loan.status === "approved"
  ).length;
  const totalRejected = loans.filter(
    (loan) => loan.status === "rejected"
  ).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="h-screen">
      <div className="py-10 px-5 md:px-10 space-y-5 h-full">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-10">
          {/* Loan Details Section */}
          <div className="w-full lg:w-[35%]">
            <div className="bg-white border border-[#DBDBDB] h-auto w-full rounded-3xl p-5 md:p-10 font-sans space-y-5 md:space-y-7">
              <p className="bg-muted-gray w-fit rounded-3xl py-2 px-5 text-center md:text-left">
                {activeLoan ? "Active Loan" : "No Active Loan"}
              </p>
              <hr className="border-muted-gray" />
              <div>
                <p>Loan Amount</p>
                <p className="font-semibold text-3xl md:text-5xl">
                  {activeLoan
                    ? `NGN ${Number(activeLoan.amount).toFixed(2)}`
                    : "NGN 0.00"}
                </p>
              </div>
              <hr className="border-muted-gray" />
              <div className="border border-muted-gray rounded-xl p-5 text-left md:text-left">
                <p className="text-dark-gray">
                  Your loan should be processed between
                  <br /> 24-48 hours of a working day
                </p>
              </div>
              <Link href={"/dashboard/request"}>
                <Button className="bg-inherit hover:bg-inherit text-primary border border-primary flex items-center justify-center gap-2 mt-4">
                  <CgNotes />
                  Request Loan
                  <FaArrowRightLong />
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary and Stats Section */}
          <div className="flex-1 flex flex-col justify-between space-y-5 lg:space-y-0">
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5">
              <SummaryCard
                title="Active Loan"
                amount={
                  activeLoan
                    ? `NGN ${Number(activeLoan.amount).toFixed(2)}`
                    : "NGN 0.00"
                }
                icon={<TableDocument color="#39498C" size={24} />}
              />
              <SummaryCard
                title="Total Amount"
                amount={`NGN ${totalAmount.toFixed(2)}`}
                icon={<TableDocument color="#39498C" size={24} />}
              />
              <SummaryCard
                title="Total Outstanding"
                amount="NGN 0.00"
                icon={<Wallet3 color="#39498C" size={24} />}
              />
              <SummaryCard
                title="Loan Limit"
                amount="NGN 0.00"
                icon={<RiBankLine className="text-[#39498C] text-2xl" />}
              />
            </div>
            <hr className="border-muted-gray my-5 lg:my-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 xl:gap-10">
              <StatCard
                color="black"
                title="Total Applications"
                count={loans.length}
              />
              <StatCard
                color="#00C53A"
                title="Total Approved"
                count={totalApproved}
              />
              <StatCard
                color="#FF6242"
                title="Total Rejected"
                count={totalRejected}
              />
            </div>
          </div>
        </div>

        {/* Loan Transaction Table */}
        <div className="bg-white overflow-x-auto mt-5 rounded-xl font-sans">
          <div className="flex justify-between md:flex-row flex-col md:items-center items-start gap-2 py-5 px-5">
            <div className="flex gap-5 md:flex-row flex-col">
              <p>Loan Transactions</p>
            </div>
            <div className="flex gap-5 flex-col md:flex-row">
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full md:w-64 lg:w-80 rounded-sm"
              />
            </div>
          </div>
          <LoanTable searchQuery={searchQuery} data={loans} />
        </div>
      </div>
    </div>
  );
};

export default Page;
