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
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { handleCreateLoan, handleListBanks } from "@/lib/utils/api/apiHelper";
import { useFormik } from "formik";
import * as Yup from "yup";

interface LoanStepTwoProps {
  vendor: string;
  onVendorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedBank: string;
  onBankChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const LoanStepTwo: React.FC<LoanStepTwoProps> = ({
  vendor,
  onVendorChange,
  selectedBank,
  onBankChange,
  onNext,
  onPrevious,
}) => {
  const [bankOptions, setBankOptions] = useState<any[]>([]);

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
    vendor: Yup.string().required("Vendor name is required"),
    selectedBank: Yup.string().required("Bank selection is required"),
    accountName: Yup.string().required("Account name is required"),
    narration: Yup.string().required("Narration is required"),
    invoiceNumber: Yup.number()
      .typeError("Invoice number must be a valid number")
      .required("Invoice number is required"),
  });

  const formik = useFormik({
    initialValues: {
      vendor: vendor,
      selectedBank: selectedBank,
      accountName: "",
      narration: "",
      invoiceNumber: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log("Form values:", values);
      try {
        const loanItems = JSON.parse(localStorage.getItem("loanItems") || "[]");
        const payload = {
          items: loanItems,
          vendor: values.vendor,
          bankCode: values.selectedBank,
          accountName: values.accountName,
          narration: values.narration,
          invoiceNumber: values.invoiceNumber,
        };
        console.log(payload);
        await handleCreateLoan(payload);
        onNext();
      } catch (error) {
        console.error("Error creating loan:", error);
      }
    },
  });

  return (
    <>
      <h3 className="text-lg sm:text-xl font-medium border-b border-border pb-2 font-clash mb-4 sm:mb-8">
        Who are you buying from?
      </h3>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Vendor Name"
            required
            type="text"
            placeholder="Enter vendor name"
            {...formik.getFieldProps("vendor")}
            className="h-full"
            error={formik.touched.vendor ? formik.errors.vendor : undefined}
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
              value={formik.values.selectedBank}
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
                      key={bank.value}
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
            type="number"
            placeholder="Enter invoice number"
            {...formik.getFieldProps("invoiceNumber")}
            className="h-full"
            error={
              formik.touched.invoiceNumber
                ? formik.errors.invoiceNumber
                : undefined
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
          <Button
            type="button"
            onClick={onPrevious}
            className="w-full sm:w-auto py-2 px-8 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400"
          >
            Previous
          </Button>
        </div>
      </form>
    </>
  );
};

export default LoanStepTwo;
