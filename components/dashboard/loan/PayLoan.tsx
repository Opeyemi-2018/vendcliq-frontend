import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import Link from "next/link";
import React from "react";

export const PayLoan = () => {
  return (
    <div className="flex justify-center h-screen">
      <div className="bg-white w-[600px] h-fit mt-20 p-20">
        <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
          Pay Loan
        </h2>

        <div className="mt-5">
          <Field label="Amount" />
          <Field label="Select Amount" />
        </div>

        <Button className="mt-6 text-white w-full rounded-none">
          Continue
        </Button>
      </div>
    </div>
  );
};
