import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  handleListBanks,
  handleVerifyBankAccount,
} from "@/lib/utils/api/apiHelper";

export const VerifyBankAccount = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [bankOptions, setBankOptions] = useState<
    { bankCode: string; bankName: string }[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountVerified, setAccountVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const handleVerification = async () => {
    if (!selectedBank || !accountNumber) {
      setVerificationError("Please select a bank and enter account number");
      return;
    }

    try {
      setIsLoading(true);
      setVerificationError("");

      const response = await handleVerifyBankAccount({
        accountNumber,
        bankCode: selectedBank,
      });

      if (response.status) {
        setAccountName(response.data.accountName);
        setAccountVerified(true);
      } else {
        setVerificationError(response.msg);
        setAccountVerified(false);
      }
    } catch (error) {
      console.log("error>>>", error);
      setVerificationError("Failed to verify account. Please try again.");
      setAccountVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="flex">
      <div className="md:mt-0 mt-10 bg-white w-full max-w-[600px] p-5 sm:p-10">
        <p className="font-medium text-lg font-clash border-l-4 border-primary pl-3">
          Verify Your Bank Account
        </p>

        {verificationError && (
          <p className="text-red-500 mt-4">{verificationError}</p>
        )}

        {accountVerified && (
          <p className="text-green-500 mt-4">Account Name: {accountName}</p>
        )}

        <div className="gap-5 grid grid-cols-1 mt-10">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Bank <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={setSelectedBank} value={selectedBank}>
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
          </div>

          <div className="flex gap-4">
            <Field
              label="Account Number"
              required
              type="text"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleVerification}
              className="self-end h-12 rounded-none bg-primary text-white hover:bg-primary/90"
              disabled={!selectedBank || !accountNumber || isLoading}
            >
              {isLoading ? "Verifying..." : "Check Account"}
            </Button>
          </div>
        </div>

        <div className="flex mt-10 gap-5 justify-end">
          <Button className="bg-inherit text-primary hover:bg-light-gray border border-primary rounded-none">
            Cancel
          </Button>
          <Button
            className="rounded-none text-black"
            disabled={!accountVerified || isLoading}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
