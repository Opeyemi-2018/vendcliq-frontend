import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import React from "react";

export const ItemDetails = ({
  onNext,
  onPrevious,
}: {
  onNext: () => void;
  onPrevious: () => void;
}) => {
  const Detail: React.FC<{ label: string; value: string }> = ({
    label,
    value,
  }) => (
    <div className="flex justify-between">
      <span className="text-[#39498C] font-semibold">{label}:</span>
      <span className="font-medium ">{value}</span>
    </div>
  );

  const SelectField: React.FC<{
    label: string;
    placeholder: string;
    options: string[];
  }> = ({ label, placeholder, options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select className="w-full text-sm h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="" disabled selected hidden>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="w-full min-h-screen">
      <div className=" rounded-lg w-full max-w-5xl mx-auto p-0 md:p-8">
        <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
          Loan Application
        </h3>

        {/* Form Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="Amount (NGN)" placeholder="Enter amount" />
          <SelectField
            label="Tenure"
            placeholder="Enter amount"
            options={["1 month", "3 months", "6 months"]}
          />
        </div>

        {/* Loan Details */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Loan Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border p-5">
            <Detail label="Principal" value="NGN 5,000,000.00" />
            <Detail label="Interest" value="NGN 740,000.00" />
            <Detail label="Tenure" value="1 month" />
            <Detail label="Mgt fee" value="NGN 50,000.00" />
            <Detail label="Credit Insurance" value="NGN 30,000.00" />
          </div>
        </div>

        {/* Repayment Schedule */}
        <h3 className="text-sm font-semibold mb-2">
          Your Potential Loan Repayment Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-gray-700 mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Principal</th>
                <th className="p-2 border">Interest</th>
                <th className="p-2 border">Total Repayment</th>
              </tr>
            </thead>
            <tbody>
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <tr key={i}>
                    <td className="p-2 border">June 14th, 2024</td>
                    <td className="p-2 border font-clash">1,000,000</td>
                    <td className="p-2 border font-clash">66,000</td>
                    <td className="p-2 border font-clash">400,000</td>
                  </tr>
                ))}
              <tr className="bg-[#39498C] font-semibold text-white">
                <td className="p-2 border">Total</td>
                <td className="p-2 border">5,000,000.00</td>
                <td className="p-2 border">1,000,587.85</td>
                <td className="p-2 border">6,000,587.85</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms & Save */}
        <div className="flex items-center mb-4">
          <input type="checkbox" id="terms" className="mr-2" />
          <label htmlFor="terms" className="text-sm">
            Accept loan{" "}
            <a href="#" className="text-indigo-600 underline">
              Terms & Conditions
            </a>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            onClick={onNext}
            className="w-full sm:w-fit py-2 px-8 bg-yellow-500 text-white rounded-sm hover:bg-yellow-600"
          >
            Save
          </Button>
          <Button
            onClick={onPrevious}
            className="w-full sm:w-fit py-2 px-8 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400"
          >
            Previous
          </Button>
        </div>
      </div>
    </div>
  );
};
