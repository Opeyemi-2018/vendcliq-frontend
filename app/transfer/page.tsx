"use client";
import TransferSidebar from "@/components/dashboard/transfer/TransferSidebar";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  handleGetAccount,
  handleListBanks,
  handleLocalTransfer,
  handleOutsideTransfer,
  handleVerifyVeraBankAccount,
} from "@/lib/utils/api/apiHelper";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useVerifyBankAccount } from "@/services/loan/loan";
import { ClipLoader } from "react-spinners";

interface Account {
  id: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountBalance: number;
  transactionCount: number;
}

interface TransferFormProps {
  accounts: Account[];
  bankOptions?: { bankCode: string; bankName: string }[];
  isVerifying: boolean;
  onSubmit: (values: TransferFormValues) => void;
}

interface TransferFormValues {
  fromAccount: string;
  beneficiaryAccount: string;
  beneficiaryName: string;
  selectedBank?: string;
  amount: string;
  narration: string;
  saveToBeneficiaryList: boolean;
}

interface VerifyResponse {
  status: string;
  data: {
    accountName: string;
  };
  msg?: string;
}

const initialFormValues: TransferFormValues = {
  fromAccount: "",
  beneficiaryAccount: "",
  beneficiaryName: "",
  amount: "",
  narration: "",
  saveToBeneficiaryList: false,
};

const VeraTransferForm = ({
  accounts,
  isVerifying,
  onSubmit,
}: TransferFormProps) => {
  const [values, setValues] = useState<TransferFormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<TransferFormValues>>({});

  const validate = () => {
    const newErrors: Partial<TransferFormValues> = {};
    if (!values.fromAccount) newErrors.fromAccount = "From account is required";
    if (!values.beneficiaryAccount)
      newErrors.beneficiaryAccount = "Beneficiary account is required";
    if (!values.beneficiaryName && !data?.data?.account_name)
      newErrors.beneficiaryName = "Beneficiary name is required";
    if (!values.amount) newErrors.amount = "Amount is required";
    if (!values.narration) newErrors.narration = "Narration is required";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
      setValues(initialFormValues); // Reset form after submission
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    // Reset form when component unmounts
    return () => {
      setValues(initialFormValues);
      setErrors({});
    };
  }, []);

  useEffect(() => {
    if (!values.beneficiaryAccount || values.beneficiaryAccount.length < 10)
      return;
    const verifyAccount = async () => {
      if (!values.beneficiaryAccount) return;
      await handleVerifyVeraBankAccount(values.beneficiaryAccount);
    };
    verifyAccount();
  }, [values.beneficiaryAccount]);
  const { data } = useQuery({
    queryKey: ["verify-vera-bank-account", values.beneficiaryAccount],
    queryFn: () => handleVerifyVeraBankAccount(values.beneficiaryAccount),
    enabled: !!values.beneficiaryAccount,
  });

  return (
    <form className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label className="block text-sm font-medium text-gray-700">
          From Account <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) =>
            setValues((prev) => ({ ...prev, fromAccount: value }))
          }
          value={values.fromAccount}
        >
          <SelectTrigger className="w-full h-12 bg-gray-100 border border-gray-300 rounded-sm px-3">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select account</SelectLabel>
              {accounts?.map((account: Account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.accountName} - {account.accountNumber} (
                  {account.bankName})
                  <span className="ml-2">₦{account.accountBalance}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.fromAccount && (
          <p className="text-red-500 text-sm mt-1">{errors.fromAccount}</p>
        )}
      </div>

      <div className="flex md:flex-row flex-col md:gap-5">
        <Field
          label="Beneficiary Account"
          required
          type="number"
          name="beneficiaryAccount"
          value={values.beneficiaryAccount}
          onChange={handleChange}
          placeholder="Enter account number"
          className="flex-1"
          error={errors.beneficiaryAccount}
        />
      </div>

      <Field
        label="Benefiaiery Name"
        required
        type="text"
        name="beneficiaryName"
        value={data?.data?.account_name || ""}
        onChange={handleChange}
        disabled={true}
        placeholder="Enter beneficiary name"
        error={errors.beneficiaryName}
        readOnly
      />

      <Field
        label="Amount"
        required
        type="number"
        name="amount"
        value={values.amount}
        onChange={handleChange}
        placeholder="NGN"
        error={errors.amount}
      />

      <Field
        label="Narration"
        required
        type="text"
        name="narration"
        value={values.narration}
        onChange={handleChange}
        placeholder="Enter narration"
        error={errors.narration}
      />

      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          name="saveToBeneficiaryList"
          checked={values.saveToBeneficiaryList}
          onChange={handleChange}
          className="h-4 w-4 text-yellow-500 focus:ring focus:ring-yellow-400 border-gray-300 rounded"
        />
        <label className="ml-2 text-sm font-medium text-gray-700">
          Save to beneficiary list
        </label>
      </div>

      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={isVerifying}
        className="w-full py-2 bg-yellow-500 text-black font-semibold rounded-none hover:bg-yellow-600 transition-colors"
      >
        {isVerifying ? "Processing..." : "Transfer Money"}
      </Button>
    </form>
  );
};

const OtherBanksTransferForm = ({
  accounts,
  bankOptions,
  isVerifying,
  onSubmit,
}: TransferFormProps) => {
  const [values, setValues] = useState<TransferFormValues>({
    ...initialFormValues,
    selectedBank: "",
  });

  const [errors, setErrors] = useState<Partial<TransferFormValues>>({});
  const { verifyBankAccount } = useVerifyBankAccount();

  const validate = () => {
    const newErrors: Partial<TransferFormValues> = {};
    if (!values.fromAccount) newErrors.fromAccount = "From account is required";
    if (!values.selectedBank)
      newErrors.selectedBank = "Bank selection is required";
    if (!values.beneficiaryAccount)
      newErrors.beneficiaryAccount = "Beneficiary account is required";
    if (!values.beneficiaryName)
      newErrors.beneficiaryName = "Beneficiary name is required";
    if (!values.amount) newErrors.amount = "Amount is required";
    if (!values.narration) newErrors.narration = "Narration is required";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      const formattedValues = {
        ...values,
        receiverBankCode: values.selectedBank,
      };
      onSubmit(formattedValues);
      setValues({ ...initialFormValues, selectedBank: "" }); // Reset form after submission
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    // Reset form when component unmounts
    return () => {
      setValues({ ...initialFormValues, selectedBank: "" });
      setErrors({});
    };
  }, []);

  useEffect(() => {
    const verifyAccount = async () => {
      if (!values.beneficiaryAccount || !values.selectedBank) return;

      try {
        const response = (await verifyBankAccount({
          accountNumber: values.beneficiaryAccount,
          bankCode: values.selectedBank,
        })) as VerifyResponse;

        if (response.status === "success") {
          setValues((prev) => ({
            ...prev,
            beneficiaryName: response.data.accountName,
          }));
        } else {
          toast.error(response.msg || "Failed to verify account");
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("Failed to verify account");
      }
    };

    if (values.beneficiaryAccount && values.selectedBank) {
      verifyAccount();
    }
  }, [values.beneficiaryAccount, values.selectedBank, verifyBankAccount]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label className="block text-sm font-medium text-gray-700">
          From Account <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) =>
            setValues((prev) => ({ ...prev, fromAccount: value }))
          }
          value={values.fromAccount}
        >
          <SelectTrigger className="w-full h-12 bg-gray-100 border border-gray-300 rounded-sm px-3">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select account</SelectLabel>
              {accounts?.map((account: Account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.accountName} - {account.accountNumber} (
                  {account.bankName})
                  <span className="ml-2">₦{account.accountBalance}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.fromAccount && (
          <p className="text-red-500 text-sm mt-1">{errors.fromAccount}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <Label className="block text-sm font-medium text-gray-700">
          Select Beneficiary Bank <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) =>
            setValues((prev) => ({ ...prev, selectedBank: value }))
          }
          value={values.selectedBank}
        >
          <SelectTrigger className="w-full h-12 bg-gray-100 border border-gray-300 rounded-sm px-3">
            <SelectValue placeholder="Select bank" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select bank</SelectLabel>
              {bankOptions?.map((bank) => (
                <SelectItem key={bank.bankCode} value={bank.bankCode}>
                  {bank.bankName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.selectedBank && (
          <p className="text-red-500 text-sm mt-1">{errors.selectedBank}</p>
        )}
      </div>

      <div className="flex md:flex-row flex-col md:gap-5">
        <Field
          label="Beneficiary Account"
          required
          type="number"
          name="beneficiaryAccount"
          value={values.beneficiaryAccount}
          onChange={handleChange}
          placeholder="Enter account number"
          className="flex-1"
          error={errors.beneficiaryAccount}
        />
      </div>

      <Field
        label="Beneficiary Name"
        required
        type="text"
        name="beneficiaryName"
        value={values.beneficiaryName}
        onChange={handleChange}
        disabled={true}
        placeholder="Enter beneficiary name"
        error={errors.beneficiaryName}
        readOnly
      />

      <Field
        label="Amount"
        required
        type="number"
        name="amount"
        value={values.amount}
        onChange={handleChange}
        placeholder="NGN"
        error={errors.amount}
      />

      <Field
        label="Narration"
        required
        type="text"
        name="narration"
        value={values.narration}
        onChange={handleChange}
        placeholder="Enter narration"
        error={errors.narration}
      />

      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          name="saveToBeneficiaryList"
          checked={values.saveToBeneficiaryList}
          onChange={handleChange}
          className="h-4 w-4 text-yellow-500 focus:ring focus:ring-yellow-400 border-gray-300 rounded"
        />
        <label className="ml-2 text-sm font-medium text-gray-700">
          Save to beneficiary list
        </label>
      </div>

      <Button
        type="submit"
        disabled={isVerifying}
        className="w-full py-2 bg-yellow-500 text-black font-semibold rounded-none hover:bg-yellow-600 transition-colors"
      >
        {isVerifying ? "Processing..." : "Transfer Money"}
      </Button>
    </form>
  );
};

const Page = () => {
  const [selectedOption, setSelectedOption] = useState<
    "Vendcilo" | "Other Banks"
  >("Vendcilo");
  const [bankOptions, setBankOptions] = useState<
    { bankCode: string; bankName: string }[]
  >([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSelect = (option: "Vendcilo" | "Other Banks") => {
    setSelectedOption(option);
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

  const { data, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: handleGetAccount,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#000" size={50} />
      </div>
    );
  }

  const handleVeraTransfer = async (values: TransferFormValues) => {
    if (!values.fromAccount || !values.beneficiaryAccount || !values.amount) {
      toast.error("Please fill all required fields");
      return;
    }
    // router.
    try {
      setIsVerifying(true);
      await handleLocalTransfer({
        senderAccountId: Number(values.fromAccount),
        receiverAccountNo: values.beneficiaryAccount,
        amount: Number(values.amount),
        narration: values.narration,
        saveAsBeneficiary: values.saveToBeneficiaryList,
      });
      toast.success("Transfer successful");
      window.location.reload();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error.response?.data?.message || error.message || "Transfer failed";
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtherBanksTransfer = async (values: TransferFormValues) => {
    try {
      setIsVerifying(true);
      await handleOutsideTransfer({
        senderAccountId: Number(values.fromAccount),
        receiverAccountNo: values.beneficiaryAccount,
        receiverAccountName: values.beneficiaryName,
        amount: Number(values.amount),
        narration: values.narration,
        saveAsBeneficiary: values.saveToBeneficiaryList,
        receiverBankCode: values.selectedBank!,
      });
      toast.success("Transfer successful");
      window.location.reload();
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      // console.log("error", error);
      toast.error(error.response?.data?.msg || "Transfer failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <div className="flex md:flex-row flex-col gap-5 md:gap-20 p-5 md:px-20 pt-10 h-screen font-sans bg-background">
        <div className="">
          <TransferSidebar
            selectedOption={selectedOption}
            onSelect={handleSelect}
          />
        </div>

        <div className="w-full md:w-[50%] h-fit md:py-10 md:p-16 bg-white">
          <div className="flex p-5 md:p-8">
            <div className="w-full">
              <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
                Transfer to {selectedOption}
              </h3>

              {selectedOption === "Vendcilo" ? (
                <VeraTransferForm
                  accounts={data?.data?.accounts || []}
                  isVerifying={isVerifying}
                  onSubmit={handleVeraTransfer}
                />
              ) : (
                <OtherBanksTransferForm
                  accounts={data?.data?.accounts || []}
                  bankOptions={bankOptions}
                  isVerifying={isVerifying}
                  onSubmit={handleOtherBanksTransfer}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
