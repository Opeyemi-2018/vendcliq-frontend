import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { SummaryCard } from "@/components/ui/SummaryCard";
import React from "react";
import { CgNotes } from "react-icons/cg";
import { FaArrowRightLong } from "react-icons/fa6";
import { RiBankLine } from "react-icons/ri";
import { SlWallet } from "react-icons/sl";

const page = () => {
  return (
    <div className="h-screen">
      <div className="py-10 px-10 space-y-5 h-full">
        <div className="flex gap-10 ">
          <div className=" w-[35%]">
            <div className="bg-white h-auto w-full rounded-3xl p-10 font-sans space-y-7">
              <p className="bg-muted-gray w-fit rounded-3xl py-2 px-5">
                No Active Loan
              </p>
              <hr className=" border-muted-gray" />
              <div>
                <p>Loan Amount</p>
                <p className="font-semibold text-5xl">0.00</p>
              </div>
              <hr className=" border-muted-gray" />
              <div className="border border-muted-gray rounded-xl p-5">
                <p className="text-dark-gray">
                  Your loan should be processed between
                  <br /> 24-48 hours of a working day
                </p>
              </div>
              <Button className="bg-inherit text-primary border border-primary flex">
                <CgNotes />
                Request Loan
                <FaArrowRightLong />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-10">
              <SummaryCard
                title="Active Loan"
                amount="NGN 20,000,000"
                icon={<CgNotes className="text-[#39498C] text-2xl" />}
              />
              <SummaryCard
                title="Total Repaid"
                amount="NGN50,566,856.00"
                icon={<CgNotes className="text-[#39498C] text-2xl" />}
              />
              <SummaryCard
                title="Total Outstanding"
                amount="NGN50,566,856.00"
                icon={<SlWallet className="text-[#39498C] text-2xl" />}
              />
              <SummaryCard
                title="Loan Limit"
                amount="NGN50,566,856.00"
                icon={<RiBankLine className="text-[#39498C] text-2xl" />}
              />
            </div>
            <hr className=" border-muted-gray" />
            <div className="grid grid-cols-4 gap-10">
              <StatCard title="Total Applications" count={20} />
              <StatCard title="Total Applications" count={20} />
              <StatCard title="Total Applications" count={20} />
              <StatCard title="Total Applications" count={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
