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
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface LoanStepTwoProps {
  vendor: string;
  onVendorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedBank: string;
  onBankChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const bankOptions = [
  { value: "bank1", label: "Bank 1" },
  { value: "bank2", label: "Bank 2" },
  { value: "bank3", label: "Bank 3" },
  { value: "bank4", label: "Bank 4" },
  // Add more banks as needed
];

const LoanStepTwo: React.FC<LoanStepTwoProps> = ({
  vendor,
  onVendorChange,
  selectedBank,
  onBankChange,
  onNext,
  onPrevious,
}) => {
  return (
    <>
      <h3 className="text-lg sm:text-xl font-medium border-b border-border pb-2 font-clash mb-4 sm:mb-8">
        Who are you buying from?
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Vendor Name"
            required
            type="text"
            placeholder="Enter vendor name"
            value={vendor}
            onChange={onVendorChange}
            className="h-full"
          />
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Bank <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={onBankChange} defaultValue={selectedBank}>
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
                      value={bank.value}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                    >
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Field
          label="Vendor name / Account name"
          required
          type="text"
          placeholder="Enter account name"
          value={vendor}
          onChange={onVendorChange}
          className="h-full"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Narration"
            required
            type="text"
            placeholder="Input narration"
            value={vendor}
            onChange={onVendorChange}
            className="h-full"
          />
          <Field
            label="Invoice number"
            required
            type="number"
            placeholder="Enter invoice number"
            value={vendor}
            onChange={onVendorChange}
            className="h-full"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8">
        <Button
          onClick={onNext}
          className="w-full sm:w-auto py-2 px-8 bg-yellow-500 text-white rounded-sm hover:bg-yellow-600"
        >
          Save
        </Button>
        <Button
          onClick={onPrevious}
          className="w-full sm:w-auto py-2 px-8 bg-gray-300 text-gray-700 rounded-sm hover:bg-gray-400"
        >
          Previous
        </Button>
      </div>
    </>
  );
};

export default LoanStepTwo;
