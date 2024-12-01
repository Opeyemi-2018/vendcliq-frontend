import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import React, { useState, useEffect, useContext } from "react";
import { RequestContext } from "./RequestContext";
import {
  handleCreateLoan,
  handleGetRepaymentPattern,
} from "@/lib/utils/api/apiHelper";
import { getTenures } from "@/services/Tenure";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Formik, Form } from "formik";

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

// interface ScheduleItem {
//   date: string;
//   principal: string;
//   interest: string;
//   totalRepayment: string;
// }

// interface RepaymentSchedule {
//   schedule: ScheduleItem[];
//   totalPrincipal: number;
//   totalInterest: string;
//   totalRepayment: string;
//   managementFee: string;
//   insurance: string;
// }

interface RepaymentPattern {
  value: string;
  key: string;
}

export const ItemDetails: React.FC<{
  onNext: () => void;
  onPrevious: () => void;
  vendorDetails: VendorDetails;
  setVendorDetails: (vendorDetails: VendorDetails) => void;
}> = ({ onNext, onPrevious }) => {
  const { items, vendorDetails, tenure, setTenure } =
    useContext(RequestContext);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [tenureOptions, setTenureOptions] = useState<string[]>([]);
  const [repaymentPatternOptions, setRepaymentPatternOptions] = useState<
    RepaymentPattern[]
  >([]);

  // const Detail: React.FC<{ label: string; value?: string }> = ({
  //   label,
  //   value,
  // }) => (
  //   <div className="flex justify-between">
  //     <span className="text-[#39498C] font-semibold">{label}:</span>
  //     <span className="font-medium">{value}</span>
  //   </div>
  // );

  useEffect(() => {
    // const calculateRepaymentSchedule = (amount: number, duration: number) => {
    //   console.log(amount?.toString());
    //   if (!amount || !duration) return null;
    //   const principal = amount;
    //   const interestRate = 0.15; // 15% interest rate
    //   const tenureInMonths = parseInt(duration.toString());
    //   const monthlyInterest = (principal * interestRate) / 12;
    //   const monthlyPayment =
    //     (principal + monthlyInterest * tenureInMonths) / tenureInMonths;
    //   const schedule = [];
    //   let remainingPrincipal = principal;
    //   for (let i = 1; i <= tenureInMonths; i++) {
    //     const interest = (remainingPrincipal * interestRate) / 12;
    //     const principalPayment = monthlyPayment - interest;
    //     remainingPrincipal -= principalPayment;
    //     schedule.push({
    //       date: new Date(
    //         Date.now() + i * 30 * 24 * 60 * 60 * 1000
    //       ).toLocaleDateString(),
    //       principal: principalPayment.toFixed(2),
    //       interest: interest.toFixed(2),
    //       totalRepayment: monthlyPayment.toFixed(2),
    //     });
    //   }
    //   return {
    //     schedule,
    //     totalPrincipal: principal,
    //     totalInterest: (monthlyPayment * tenureInMonths - principal).toFixed(2),
    //     totalRepayment: (monthlyPayment * tenureInMonths).toFixed(2),
    //     managementFee: (principal * 0.01).toFixed(2),
    //     insurance: (principal * 0.006).toFixed(2),
    //   };
    // };
    // console.log(totalAmount);
    // const schedule = calculateRepaymentSchedule(
    //   items?.amount ?? 0,
    //   parseInt(vendorDetails.tenure ?? "0")
    // );
    // setRepaymentSchedule(schedule);
  }, []);

  useEffect(() => {
    const fetchTenures = async () => {
      try {
        const tenures = await getTenures();
        setTenureOptions(tenures);
      } catch (error) {
        console.error("Error getting tenures:", error);
      }
    };

    fetchTenures();
  }, []);
  const [selectedTenure, setSelectedTenure] = useState<string>("");
  const [repaymentPattern, setRepaymentPattern] = useState<string>("");
  useEffect(() => {
    const fetchRepaymentPatterns = async () => {
      if (selectedTenure) {
        try {
          const patterns = await handleGetRepaymentPattern(selectedTenure);
          setRepaymentPatternOptions(patterns.data);
          console.log("repaymentPatternOptions", repaymentPatternOptions);
        } catch (error) {
          console.error("Error getting repayment patterns:", error);
        }
      }
    };

    fetchRepaymentPatterns();
  }, [repaymentPatternOptions]);

  const totalAmount = items
    .reduce((sum, item) => {
      return sum + item.amount * item.quantity;
    }, 0)
    .toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
    });

  useEffect(() => {
    const isStepValid = () => {
      return (
        items.length > 0 &&
        selectedTenure &&
        acceptedTerms === true &&
        repaymentPattern
      );
    };

    // Auto-submit when all conditions are met
    const autoSubmit = async () => {
      if (isStepValid()) {
        try {
          const loanData = {
            tenure: selectedTenure,
            items: items,
            repaymentPattern: repaymentPattern,
            vendorDetails: vendorDetails,
            termsAccepted: acceptedTerms,
          };
          console.log("loanData", loanData);
          await handleCreateLoan(loanData);
          onNext();
        } catch (error) {
          console.error("Error creating loan:", error);
        }
      }
    };

    autoSubmit();
  }, [items, selectedTenure, acceptedTerms, repaymentPattern]);

  // const formatCurrency = (value: number) => {
  //   return new Intl.NumberFormat("en-NG", {
  //     style: "currency",
  //     currency: "NGN",
  //   }).format(value);
  // };

  return (
    <div className="w-full min-h-screen">
      <div className="rounded-lg w-full max-w-5xl mx-auto p-0 md:p-8">
        <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
          Loan Application
        </h3>

        <Formik
          initialValues={{
            tenure: tenure || "",
            repaymentPattern: repaymentPattern || "",
            acceptedTerms: false,
          }}
          onSubmit={async (values) => {
            setTenure(values.tenure);
            setRepaymentPattern(values.repaymentPattern);
            setAcceptedTerms(values.acceptedTerms);
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Field
                  label="Amount (NGN)"
                  placeholder="Enter amount"
                  value={totalAmount}
                  readOnly={true}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenure (Months)
                  </label>
                  <Select
                    value={values.tenure}
                    onValueChange={(value) => {
                      setFieldValue("tenure", value);
                      setSelectedTenure(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tenure" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenureOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repayment Pattern
                </label>
                <Select
                  value={values.repaymentPattern}
                  onValueChange={(value) => {
                    setFieldValue("repaymentPattern", value);
                    setRepaymentPattern(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select repayment pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {repaymentPatternOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Loan Details */}
              {/* {repaymentSchedule && (
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
                      value={`${tenure} month${
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
                      value={formatCurrency(
                        parseFloat(repaymentSchedule.insurance)
                      )}
                    />
                  </div>
                </div>
              )} */}

              {/* Repayment Schedule */}
              {/* {repaymentSchedule && (
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
                                {formatCurrency(
                                  parseFloat(item.totalRepayment)
                                )}
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
              )} */}

              {/* Terms & Save */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={values.acceptedTerms}
                  onChange={(e) => {
                    setFieldValue("acceptedTerms", e.target.checked);
                    setAcceptedTerms(e.target.checked);
                  }}
                  className="mr-2"
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
                  onClick={onPrevious}
                  className="w-full sm:w-fit py-2 px-8 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400"
                >
                  Previous
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
