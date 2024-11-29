import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import React, { useState, useEffect } from "react";

interface VendorDetails {
  amount?: number;
  tenure?: string;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  invoiceNo?: string;
  narration?: string;
  repaymentPattern?: string;
  items?: {
    item: string;
    quantity: number;
    amount: number;
  }[];
  termsAccepted?: boolean;
}

interface ScheduleItem {
  date: string;
  principal: string;
  interest: string;
  totalRepayment: string;
}

interface RepaymentSchedule {
  schedule: ScheduleItem[];
  totalPrincipal: number;
  totalInterest: string;
  totalRepayment: string;
  managementFee: string;
  insurance: string;
}

export const ItemDetails: React.FC<{
  onNext: () => void;
  onPrevious: () => void;
  vendorDetails: VendorDetails;
  setVendorDetails: (vendorDetails: VendorDetails) => void;
}> = ({ onNext, onPrevious, vendorDetails, setVendorDetails }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [repaymentSchedule, setRepaymentSchedule] =
    useState<RepaymentSchedule | null>(null);

  const Detail: React.FC<{ label: string; value: string }> = ({
    label,
    value,
  }) => (
    <div className="flex justify-between">
      <span className="text-[#39498C] font-semibold">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  const SelectField: React.FC<{
    label: string;
    placeholder: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
  }> = ({ label, placeholder, options, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className="w-full text-sm h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled hidden>
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

  useEffect(() => {
    const calculateRepaymentSchedule = (amount: number, duration: number) => {
      console.log(amount?.toString());
      if (!amount || !duration) return null;

      const principal = amount;
      const interestRate = 0.15; // 15% interest rate
      const tenureInMonths = parseInt(duration.toString());

      const monthlyInterest = (principal * interestRate) / 12;
      const monthlyPayment =
        (principal + monthlyInterest * tenureInMonths) / tenureInMonths;

      const schedule = [];
      let remainingPrincipal = principal;

      for (let i = 1; i <= tenureInMonths; i++) {
        const interest = (remainingPrincipal * interestRate) / 12;
        const principalPayment = monthlyPayment - interest;
        remainingPrincipal -= principalPayment;

        schedule.push({
          date: new Date(
            Date.now() + i * 30 * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
          principal: principalPayment.toFixed(2),
          interest: interest.toFixed(2),
          totalRepayment: monthlyPayment.toFixed(2),
        });
      }

      return {
        schedule,
        totalPrincipal: principal,
        totalInterest: (monthlyPayment * tenureInMonths - principal).toFixed(2),
        totalRepayment: (monthlyPayment * tenureInMonths).toFixed(2),
        managementFee: (principal * 0.01).toFixed(2),
        insurance: (principal * 0.006).toFixed(2),
      };
    };

    const schedule = calculateRepaymentSchedule(
      vendorDetails.amount ?? 0,
      parseInt(vendorDetails.tenure ?? "0")
    );
    setRepaymentSchedule(schedule);
  }, [vendorDetails.amount, vendorDetails.tenure]);

  const isStepValid = () => {
    return (
      vendorDetails.amount &&
      vendorDetails.amount > 0 &&
      vendorDetails.tenure &&
      acceptedTerms
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(value);
  };

  return (
    <div className="w-full min-h-screen">
      <div className="rounded-lg w-full max-w-5xl mx-auto p-0 md:p-8">
        <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
          Loan Application
        </h3>

        {/* Form Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field
            label="Amount (NGN)"
            placeholder="Enter amount"
            value={vendorDetails.amount?.toString() || ""}
            onChange={(e) =>
              setVendorDetails({
                ...vendorDetails,
                amount: Number(e.target.value),
              })
            }
          />
          <SelectField
            label="Tenure (Months)"
            placeholder="Select tenure"
            options={["1", "3", "6", "9", "12"]}
            value={vendorDetails.tenure || ""}
            onChange={(value) =>
              setVendorDetails({ ...vendorDetails, tenure: value })
            }
          />
        </div>

        {/* Loan Details */}
        {repaymentSchedule && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Loan Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border p-5">
              <Detail
                label="Principal"
                value={formatCurrency(repaymentSchedule.totalPrincipal)}
              />
              <Detail
                label="Interest"
                value={formatCurrency(
                  parseFloat(repaymentSchedule.totalInterest)
                )}
              />
              <Detail
                label="Tenure"
                value={`${vendorDetails.tenure} month${
                  vendorDetails.tenure !== "1" ? "s" : ""
                }`}
              />
              <Detail
                label="Mgt fee"
                value={formatCurrency(
                  parseFloat(repaymentSchedule.managementFee)
                )}
              />
              <Detail
                label="Credit Insurance"
                value={formatCurrency(parseFloat(repaymentSchedule.insurance))}
              />
            </div>
          </div>
        )}

        {/* Repayment Schedule */}
        {repaymentSchedule && (
          <>
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
                  {repaymentSchedule.schedule.map(
                    (item: ScheduleItem, index: number) => (
                      <tr key={index}>
                        <td className="p-2 border">{item.date}</td>
                        <td className="p-2 border font-clash">
                          {formatCurrency(parseFloat(item.principal))}
                        </td>
                        <td className="p-2 border font-clash">
                          {formatCurrency(parseFloat(item.interest))}
                        </td>
                        <td className="p-2 border font-clash">
                          {formatCurrency(parseFloat(item.totalRepayment))}
                        </td>
                      </tr>
                    )
                  )}
                  <tr className="bg-[#39498C] font-semibold text-white">
                    <td className="p-2 border">Total</td>
                    <td className="p-2 border">
                      {formatCurrency(repaymentSchedule.totalPrincipal)}
                    </td>
                    <td className="p-2 border">
                      {formatCurrency(
                        parseFloat(repaymentSchedule.totalInterest)
                      )}
                    </td>
                    <td className="p-2 border">
                      {formatCurrency(
                        parseFloat(repaymentSchedule.totalRepayment)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Terms & Save */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="terms"
            className="mr-2"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
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
            disabled={!isStepValid()}
            className="w-full sm:w-fit py-2 px-8 bg-yellow-500 text-white rounded-sm hover:bg-yellow-600 disabled:bg-gray-300"
          >
            Submit Application
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
