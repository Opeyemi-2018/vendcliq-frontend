import { Button } from "@/components/ui/button";
import React from "react";

const Loan = () => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] md:text-[25px] font-semibold font-clash">
            My Loans
          </h2>
          <p className="hidden md:inline font-medium font-dm-sans text-[#9E9A9A]">
            Here is all you need to know about your loan
          </p>
        </div>
        <Button className="bg-[#0A6DC0] hover:bg-[#09599a] py-0 md:py-6">
          view Metrics
        </Button>
      </div>

      <div className=" mt-4 flex  items-center justify-between gap-4  overflow-x-auto">
        <div className="w-full bg-[url('/loan-bg2.svg')] bg-no-repeat bg-cover bg-center text-white p-2 md:p-5  rounded-xl">
          <p className=" font-regular text-[13px] md:text-[16px] font-dm-sans">
            Credit Limit
          </p>
          <p className="text-[15px] md:text-[20px] font-semibold font-clash">
            ₦3,500,750
          </p>
        </div>
        <div className="w-full bg-[url('/loan-bg1.svg')] bg-no-repeat bg-cover bg-center text-white p-2 md:p-4 rounded-xl">
          <p className=" font-regular text-[13px] md:text-[16px] font-dm-sans">
            Credit Line Extended
          </p>
          <p className="text-[15px] md:text-[20px] font-semibold font-clash">
            ₦300,500,750
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loan;
