import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import React, { useState, useEffect, useContext } from "react";
import { RequestContext } from "./RequestContext";
import {
  handleCreateLoan,
  handleGetRepaymentPattern,
  handlePostRepaymentPattern,
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
import { PostRepaymentPatternResponse } from "@/types";
import { toast } from "react-toastify";

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

interface RepaymentPattern {
  value: string;
  key: string;
}

export const ItemDetails: React.FC<{
  onNext: () => void;
  onPrevious: () => void;
  vendorDetails: VendorDetails;
  setVendorDetails: (vendorDetails: VendorDetails) => void;
}> = ({ onNext }) => {
  const { items, vendorDetails, tenure } = useContext(RequestContext);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [tenureOptions, setTenureOptions] = useState<string[]>([]);
  const [repaymentPatternOptions, setRepaymentPatternOptions] = useState<
    RepaymentPattern[]
  >([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  const Detail: React.FC<{ label: string; value?: string }> = ({
    label,
    value,
  }) => (
    <div className="flex justify-between">
      <span className="text-[#39498C] font-semibold">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  useEffect(() => {
    const fetchTenures = async () => {
      try {
        const tenures = await getTenures();
        setTenureOptions(tenures);
      } catch (error) {
        console.error("Error getting tenures:", error);
        toast.error("Failed to fetch tenures");
      }
    };

    fetchTenures();
  }, []);

  const [selectedTenure, setSelectedTenure] = useState<string>("");
  const [repaymentPattern, setRepaymentPattern] = useState<string>("");
  const [loanRepaymentPattern, setLoanRepaymentPattern] =
    useState<PostRepaymentPatternResponse>({
      status: "",
      msg: "",
      data: {
        repaymentPattern: [],
        principal: 0,
        interest: 0,
        totalAmount: 0,
      },
    });

  useEffect(() => {
    const fetchRepaymentPatterns = async () => {
      if (selectedTenure) {
        try {
          const response = await handleGetRepaymentPattern(selectedTenure);
          setRepaymentPatternOptions(response.data);
        } catch (error) {
          console.error("Error getting repayment patterns:", error);
          toast.error("Failed to fetch repayment patterns");
        }
      }
    };

    fetchRepaymentPatterns();
  }, [selectedTenure]);

  const totalAmount = items
    .reduce((sum, item) => {
      return sum + item.amount * item.quantity;
    }, 0)
    .toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
    });

  const getRepaymentSchedule = async () => {
    if (!selectedTenure || !repaymentPattern) {
      toast.error("Please select tenure and repayment pattern first");
      return;
    }

    setIsScheduleLoading(true);
    try {
      const loanPatternData = {
        tenure: selectedTenure,
        items: items,
        repaymentPattern: repaymentPattern,
      };

      const repaymentPatternResponse = await handlePostRepaymentPattern(
        loanPatternData
      );

      if (repaymentPatternResponse.status === "success") {
        setLoanRepaymentPattern({
          status: repaymentPatternResponse.status,
          msg: repaymentPatternResponse.msg,
          data: repaymentPatternResponse.data,
        });
        toast.success("Repayment schedule calculated successfully");
      } else {
        toast.error(
          repaymentPatternResponse.msg || "Failed to get repayment pattern"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to calculate repayment schedule");
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTenure || !repaymentPattern || !acceptedTerms) {
      toast.error("Please fill all required fields and accept terms");
      return;
    }

    if (loanRepaymentPattern.status !== "success") {
      toast.error("Please calculate repayment schedule first");
      return;
    }

    try {
      const loanData = {
        tenure: selectedTenure,
        items: items,
        repaymentPattern: repaymentPattern,
        vendorDetails: vendorDetails,
        termsAccepted: acceptedTerms,
      };

      const loanResponse = await handleCreateLoan(loanData);

      if (loanResponse.status === "success") {
        toast.success("Loan created successfully");
        onNext();
      } else {
        toast.error(loanResponse.msg || "Failed to create loan");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while creating the loan");
    }
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

        <Formik
          initialValues={{
            tenure: tenure || "",
            repaymentPattern: repaymentPattern || "",
            acceptedTerms: false,
          }}
          onSubmit={handleSubmit}
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
                      <SelectItem key={option.key} value={option.key}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <Button
                  type="button"
                  onClick={getRepaymentSchedule}
                  disabled={isScheduleLoading}
                  className="w-full py-2 px-8 bg-indigo-600 text-white rounded-sm hover:bg-indigo-700"
                >
                  {isScheduleLoading
                    ? "Calculating..."
                    : "Calculate Repayment Schedule"}
                </Button>
              </div>

              {/* Loan Details */}
              {loanRepaymentPattern.status === "success" && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2">Loan Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border p-5">
                    <Detail
                      label="Principal"
                      value={formatCurrency(
                        loanRepaymentPattern.data.principal
                      )}
                    />
                    <Detail
                      label="Interest"
                      value={formatCurrency(loanRepaymentPattern.data.interest)}
                    />
                    <Detail label="Tenure" value={`${selectedTenure}`} />
                  </div>
                </div>
              )}

              {/* Repayment Schedule */}
              {loanRepaymentPattern.status === "success" && (
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
                        {loanRepaymentPattern.data.repaymentPattern.map(
                          (item, index) => (
                            <tr key={index}>
                              <td className="p-2 border">
                                {new Date(item.due_date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </td>
                              <td className="p-2 border font-clash">
                                {formatCurrency(item.principal)}
                              </td>
                              <td className="p-2 border font-clash">
                                {formatCurrency(item.interest)}
                              </td>
                              <td className="p-2 border font-clash">
                                {formatCurrency(item.repayment_amount)}
                              </td>
                            </tr>
                          )
                        )}
                        <tr className="bg-[#39498C] font-semibold text-white">
                          <td className="p-2 border">Total</td>
                          <td className="p-2 border">
                            {formatCurrency(
                              loanRepaymentPattern.data.principal
                            )}
                          </td>
                          <td className="p-2 border">
                            {formatCurrency(loanRepaymentPattern.data.interest)}
                          </td>
                          <td className="p-2 border">
                            {formatCurrency(
                              loanRepaymentPattern.data.totalAmount
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
                  type="submit"
                  className="w-full py-2 px-8 bg-yellow-500 text-white rounded-sm hover:bg-yellow-600"
                >
                  Create Loan
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
