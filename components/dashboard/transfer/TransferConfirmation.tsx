"use client";
import { Button } from "@/components/ui/button";
import React from "react";

interface TransferConfirmationProps {
  account: string;
  accountName: string;
  accountNumber: string;
  amount: string;
  date: string;
  charges: string;
  onPinSubmit: (pin: string) => void;
}

const DetailRow: React.FC<{
  label: string;
  value: string;
  isHighlight?: boolean;
}> = ({ label, value }) => (
  <div className="flex justify-between py-1 text-sm sm:text-base">
    <span>{label}:</span>
    <span className="text-[#39498C] font-semibold">{value}</span>
  </div>
);

const PinInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <input
    type="password"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full sm:w-fit px-3 py-2 border rounded-none focus:outline-none focus:border-yellow-500"
    placeholder="Enter PIN"
    aria-label="PIN input"
  />
);

const TransferConfirmation: React.FC<TransferConfirmationProps> = ({
  account,
  accountName,
  accountNumber,
  amount,
  date,
  charges,
  onPinSubmit,
}) => {
  const [pin, setPin] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPinSubmit(pin);
  };

  return (
    <div className="bg-white mt-10 rounded-none max-w-md sm:max-w-lg md:max-w-xl w-full h-fit px-4 sm:px-6 md:px-10 lg:px-20 py-8 mx-auto">
      <header className="w-full mb-4 flex items-center space-x-2">
        <h3 className="text-lg sm:text-xl font-medium border-b border-border pb-2 font-clash mb-6 w-full">
          Transfer
        </h3>
      </header>

      <h2 className="text-md sm:text-lg font-bold mb-4 font-sans">
        Please Confirm Transfer
      </h2>

      <div className="space-y-3 mb-6 font-sans">
        <DetailRow label="Account" value={account} isHighlight />
        <DetailRow label="Account Name" value={accountName} />
        <DetailRow label="Account Number" value={accountNumber} />
        <DetailRow label="Amount" value={amount} isHighlight />
        <DetailRow label="Date" value={date} />
        <DetailRow label="Charges" value={charges} />
      </div>

      <p className="text-xs sm:text-sm text-black mb-6 font-sans">
        * Please ensure the details entered are correct before proceeding with
        this transfer as the bank will not be responsible for recall of funds
        transferred in error. Thank you.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <label className="block mb-2 font-medium text-gray-700 text-center text-sm sm:text-base">
          Enter your PIN
        </label>
        <PinInput value={pin} onChange={setPin} />
        <div className="mt-6 w-full">
          <Button
            type="submit"
            className="w-full py-2 bg-yellow-500 text-black font-semibold rounded-none hover:bg-yellow-600 transition-colors"
          >
            Transfer Money
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TransferConfirmation;
