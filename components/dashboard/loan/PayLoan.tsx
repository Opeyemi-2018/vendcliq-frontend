import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { handlePayLoan } from "@/lib/utils/api/apiHelper";

import React, { useState } from "react";
import { toast } from "react-toastify";

export const PayLoan = ({ id }: { id: string }) => {
  const [amount, setAmount] = useState(0);
  const handlePayLoanData = async () => {
    const response = await handlePayLoan(id, amount);
    if (response.status === 200) {
      toast.success("Loan paid successfully");
    } else {
      toast.error("Loan payment failed");
    }
    console.log(response);
  };
  return (
    <div className="flex justify-center h-screen">
      <div className="bg-white w-[600px] h-fit mt-20 p-20">
        <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
          Pay Loan
        </h2>

        <div className="mt-5  flex flex-col gap-3 font-sans">
          <Field
            type="number"
            placeholder="Amount"
            name="amount"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <Button
          className="mt-6 text-white w-full rounded-none"
          onClick={handlePayLoanData}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
