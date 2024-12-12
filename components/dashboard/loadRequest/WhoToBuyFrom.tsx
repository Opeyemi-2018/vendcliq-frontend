import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Field from "@/components/ui/Field";
import React, { useContext, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { handleListBanks } from "@/lib/utils/api/apiHelper";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RequestContext } from "./RequestContext";
import { useVerifyBankAccount } from "@/services/loan/loan";

interface LoanStepTwoProps {
  onVendorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedBank: string;
  onBankChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface VerifyResponse {
  status: string;
  data: {
    accountName: string;
  };
  msg?: string;
}

const LoanStepTwo: React.FC<LoanStepTwoProps> = ({
  selectedBank,
  onBankChange,
  onNext,
}) => {
  const { setVendorDetails } = useContext(RequestContext);
  const [bankOptions, setBankOptions] = useState<
    { bankCode: string; bankName: string }[]
  >([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const { verifyBankAccount } = useVerifyBankAccount();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await handleListBanks();
        if (response?.data?.banks) {
          setBankOptions(response.data.banks);
        }
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };

    fetchBanks();
  }, []);

  const validationSchema = Yup.object({
    accountNumber: Yup.string().required("Account number is required"),
    selectedBank: Yup.string().required("Bank selection is required"),
    accountName: Yup.string().required("Account name is required"),
    narration: Yup.string().required("Narration is required"),
    invoiceNo: Yup.string().required("Invoice number is required"),
  });

  const formik = useFormik({
    initialValues: {
      selectedBank: selectedBank.toString(),
      accountNumber: "",
      accountName: "",
      narration: "",
      invoiceNo: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log("Form submission started");
      const vendorDetails = {
        accountName: values.accountName,
        bankCode: values.selectedBank,
        accountNumber: values.accountNumber,
        narration: values.narration,
        invoiceNo: values.invoiceNo,
      };
      console.log("Vendor details prepared:", vendorDetails);
      setVendorDetails(vendorDetails);
      onNext();
    },
  });

  useEffect(() => {
    const handleVerifyAccount = async () => {
      if (!formik.values.accountNumber || !formik.values.selectedBank) {
        setVerificationError("Please enter account number and select bank");
        return;
      }

      setIsVerifying(true);
      setVerificationError("");

      try {
        const response = (await verifyBankAccount({
          accountNumber: formik.values.accountNumber,
          bankCode: formik.values.selectedBank,
        })) as VerifyResponse;
        console.log("response verify", response);
        if (response.status === "success") {
          formik.setFieldValue("accountName", response.data.accountName);
        } else {
          setVerificationError(response.msg || "Failed to verify account");
        }
      } catch (error) {
        console.log("error verify", error);
        setVerificationError("An error occurred while verifying account");
      } finally {
        setIsVerifying(false);
      }
    };

    if (formik.values.accountNumber && formik.values.selectedBank) {
      handleVerifyAccount();
    }
  }, [
    formik.values.accountNumber,
    formik.values.selectedBank,
    verifyBankAccount,
    formik.setFieldValue,
    formik,
  ]);

  return (
    <div className="w-full bg-white p-6 ">
      <h3 className="text-lg sm:text-xl font-medium border-b border-border pb-2 font-clash mb-4 sm:mb-8">
        Who are you buying from?
      </h3>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Account Number"
            required
            type="text"
            placeholder="Enter Account Number"
            {...formik.getFieldProps("accountNumber")}
            className="h-full"
            error={
              formik.touched.accountNumber
                ? formik.errors.accountNumber
                : undefined
            }
          />
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Bank <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => {
                formik.setFieldValue("selectedBank", value);
                onBankChange(value);
              }}
              value={formik.values.selectedBank.toString()}
            >
              <SelectTrigger className="w-full h-12 bg-gray-100 border border-gray-300 rounded-sm px-3 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <SelectValue placeholder="Select Bank" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                <SelectGroup>
                  <SelectLabel className="px-4 py-2 text-sm text-gray-500">
                    Select Bank
                  </SelectLabel>
                  {bankOptions.map((bank) => (
                    <SelectItem
                      key={bank.bankCode}
                      value={bank.bankCode}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                    >
                      {bank.bankName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formik.touched.selectedBank && formik.errors.selectedBank && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.selectedBank}
              </p>
            )}
          </div>
        </div>

        {verificationError && (
          <p className="text-red-500 text-sm">{verificationError}</p>
        )}

        <Field
          label="Vendor name / Account name"
          required
          type="text"
          placeholder="Enter account name"
          {...formik.getFieldProps("accountName")}
          className="h-full"
          error={
            formik.touched.accountName ? formik.errors.accountName : undefined
          }
          disabled={isVerifying}
          readOnly
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Narration"
            required
            type="text"
            placeholder="Input narration"
            {...formik.getFieldProps("narration")}
            className="h-full"
            error={
              formik.touched.narration ? formik.errors.narration : undefined
            }
          />
          <Field
            label="Invoice number"
            required
            type="text"
            placeholder="Enter invoice number"
            {...formik.getFieldProps("invoiceNo")}
            className="h-full"
            error={
              formik.touched.invoiceNo ? formik.errors.invoiceNo : undefined
            }
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8">
          <Button
            type="submit"
            className="w-full sm:w-auto py-2 px-8 bg-yellow-500 text-white rounded-sm hover:bg-yellow-600 disabled:bg-gray-300"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoanStepTwo;
