/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import animationData from "@/public/animate.json";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Landmark,
  Eye,
  EyeOff,
  MoveRight,
  ChevronDown,
  MoveLeft,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  transferSchema,
  TransferFormData,
  Beneficiary,
} from "@/types/transfer";
import { Separator } from "@/components/ui/separator";
import { getNipBanks, performNameEnquiry } from "@/lib/utils/api/apiHelper";
import { ClipLoader } from "react-spinners";
import {
  handleValidatePin,
  handleOtherBankTransfer,
  handleCreateBeneficiary,
  handleGetBeneficiaries,
} from "@/lib/utils/api/apiHelper";
import { generateTransactionKey } from "@/lib/utils/generateTransactionKey";
import CreatePinPrompt from "@/components/SetPinModal";
import { useWallet } from "@/hooks/useWallet";

export default function OtherBankTransfer() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showBallance, setShowBallance] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSavingBeneficiary, setIsSavingBeneficiary] = useState(false);
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(false);
  const router = useRouter();

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiaryData, setSelectedBeneficiaryData] =
    useState<Beneficiary | null>(null);

  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string | null>(null);
  const [isEnquiring, setIsEnquiring] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const [finalAccountNumber, setFinalAccountNumber] = useState<string>("");
  const [finalBankName, setFinalBankName] = useState<string>("");
  const [finalAccountName, setFinalAccountName] = useState<string>("");
  const [finalBankCode, setFinalBankCode] = useState<string>("");

  const { wallet, refreshWallet, getBalance, getAccountNumber } = useWallet();
  const fee = 10;

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema) as any,
    defaultValues: {
      beneficiaryType: "saved",
      savedBeneficiaryIndex: undefined,
      bank: "",
      accountNumber: "",
      accountName: "",
      amount: 0,
      narration: "",
      pin: "",
    },
  });

  const { watch, setValue } = form;
  const beneficiaryType = watch("beneficiaryType");
  const savedIndex = watch("savedBeneficiaryIndex");
  const pin = watch("pin");

  useEffect(() => {
    async function loadBeneficiaries() {
      setIsLoadingBeneficiaries(true);
      try {
        const response = await handleGetBeneficiaries();

        if (response.status === "success" && response.data.beneficiaries) {
          setBeneficiaries(response.data.beneficiaries);
        }
      } catch (error) {
        toast.info("No saved beneficiaries available");
      } finally {
        setIsLoadingBeneficiaries(false);
      }
    }

    loadBeneficiaries();
  }, []);

  useEffect(() => {
    async function loadBanks() {
      const result = await getNipBanks();
      if (result?.status === "success" && result?.data?.banks) {
        const parsed = result.data.banks.map((item: string) => {
          const [name, code] = item.split("|");
          return { name: name.trim(), code: code.trim() };
        });
        setBanks(parsed);
      } else {
        toast.error("Failed to load banks. Please try again.");
      }
    }
    loadBanks();
  }, []);

  useEffect(() => {
    async function doEnquiry() {
      if (selectedBankCode && accountNumber.length === 10) {
        setIsEnquiring(true);
        setAccountName(null);
        setEnquiryError(null);

        const result = await performNameEnquiry(
          selectedBankCode,
          accountNumber,
        );

        if (result?.status === "success" && result?.data?.accountName) {
          setAccountName(result.data.accountName);
          setValue("accountName", result.data.accountName);
        } else {
          setEnquiryError("Unable to verify account name");
        }
        setIsEnquiring(false);
      } else {
        setAccountName(null);
        setEnquiryError(null);
      }
    }

    doEnquiry();
  }, [selectedBankCode, accountNumber, setValue]);

  const handleStep1 = () => {
    if (beneficiaryType === "saved") {
      if (!selectedBeneficiaryData) {
        toast.error("Please select a beneficiary");
        return;
      }

      setFinalBankName(selectedBeneficiaryData.bankName);
      setFinalAccountNumber(selectedBeneficiaryData.accountNumber);
      setFinalAccountName(selectedBeneficiaryData.name);
      setFinalBankCode(selectedBeneficiaryData.bankCode);
    } else if (beneficiaryType === "new") {
      if (!selectedBankCode || accountNumber.length !== 10 || !accountName) {
        toast.error("Please select a bank and verify the account name");
        return;
      }
      const selectedBankName =
        banks.find((b) => b.code === selectedBankCode)?.name || "";

      setFinalBankName(selectedBankName);
      setFinalAccountNumber(accountNumber);
      setFinalAccountName(accountName);
      setFinalBankCode(selectedBankCode);

      setValue("bank", selectedBankName);
      setValue("accountNumber", accountNumber);
      setValue("accountName", accountName);
    }
    setStep(2);
  };

  const handleStep2 = () => {
    const amount = watch("amount");
    const narration = watch("narration");

    // Schema validation first
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Minimum amount: 100 NGN
    if (amount < 100) {
      toast.error("Amount must be at least ₦100");
      return;
    }

    // Zero-only check
    if (
      amount.toString().replace(/[^0-9]/g, "") === "" ||
      amount
        .toString()
        .replace(/[^0-9]/g, "")
        .match(/^0+$/)
    ) {
      toast.error("Amount cannot be zero or contain only zeros");
      return;
    }

    // Narration required
    if (!narration || narration.trim() === "") {
      toast.error("Please enter a narration");
      return;
    }

    // Narration length
    if (narration.trim().length < 2) {
      toast.error("Narration is too short");
      return;
    }

    // Proceed
    setStep(3);
  };

  const handleAddToBeneficiary = async () => {
    if (
      !selectedBankCode ||
      !accountNumber ||
      !accountName ||
      !wallet?.walletId
    ) {
      toast.error("Missing required information");
      return;
    }

    setIsSavingBeneficiary(true);

    try {
      const selectedBankName =
        banks.find((b) => b.code === selectedBankCode)?.name || "";

      const payload = {
        walletId: wallet.walletId,
        name: accountName,
        accountNumber: accountNumber,
        bankCode: selectedBankCode,
        bankName: selectedBankName,
      };

      const response = await handleCreateBeneficiary(payload);

      if (response.status === "success") {
        toast.success("Beneficiary added successfully!");

        const beneficiariesResponse = await handleGetBeneficiaries();
        if (beneficiariesResponse.status === "success") {
          setBeneficiaries(beneficiariesResponse.data.beneficiaries);
        }

        setFinalBankName(selectedBankName);
        setFinalAccountNumber(accountNumber);
        setFinalAccountName(accountName);
        setFinalBankCode(selectedBankCode);

        setValue("bank", selectedBankName);
        setValue("accountNumber", accountNumber);
        setValue("accountName", accountName);

        setStep(2);
      } else {
        toast.error(response.msg || "Failed to add beneficiary");
      }
    } catch (error: any) {
      console.error("Error adding beneficiary:", error);
      toast.error(error?.msg || "Failed to add beneficiary");
    } finally {
      setIsSavingBeneficiary(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!pin || pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    if (!finalAccountName || !finalBankCode || !finalAccountNumber) {
      toast.error("Invalid beneficiary details");
      return;
    }

    const amount = watch("amount");
    const narration = watch("narration");
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsTransferring(true);

    try {
      const pinRes = await handleValidatePin({ pin });
      if (pinRes.status !== "success" || !pinRes.data?.validated) {
        toast.error(pinRes.msg || "Invalid PIN");
        setIsTransferring(false);
        return;
      }

      const pinToken = pinRes.data.pinToken;

      const transactionKey = await generateTransactionKey();

      const sourceAccountNumber = getAccountNumber("WEMA");
      if (!sourceAccountNumber) {
        toast.error("Source wallet account not found");
        setIsTransferring(false);
        return;
      }

      const totalAmount = Number(amount) + fee;

      const payload = {
        transactionKey,
        amount: Number(amount),
        beneficiaryAccountNumber: finalAccountNumber,
        beneficiaryBankCode: finalBankCode,
        beneficiaryAccountName: finalAccountName,
        narration: narration || "Transfer",
        sourceAccountNumber,
        deviceFingerprint: `web-${Date.now()}-${Math.random()}`,
        ipAddress: "0.0.0.0",
        pinToken,
      };

      const transferRes = await handleOtherBankTransfer(payload);

      if (transferRes.status === "success") {
        toast.success("Transfer successful!");

        await refreshWallet();

        setShowSuccess(true);
      } else {
        toast.error(transferRes.msg || "Transfer failed");
      }
    } catch (err: any) {
      toast.error(err?.msg || "Transfer failed. Please try again.");
      console.error(err);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="">
      <Form {...form}>
        <div className="md:p-6 lg:border border-[#E4E4E4] md:rounded-lg bg-white">
          <div className="flex justify-between mb-2">
            <h2 className="text-[16px] text-[#2F2F2F] font-semibold font-clash ">
              Other Bank Transfer
            </h2>
            <CreatePinPrompt />
          </div>
          <Separator
            orientation="horizontal"
            className="h-[1px]"
            style={{ background: "#E0E0E0" }}
          />
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 1 */}
            {step === 1 && (
              <>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium mt-3">
                  Select from the list of beneficiary or add a new account
                </p>

                <div className="flex flex-col my-6 gap-4">
                  <Button
                    type="button"
                    variant={
                      beneficiaryType === "saved" ? "default" : "outline"
                    }
                    onClick={() => setValue("beneficiaryType", "saved")}
                    className={`font-medium hover:bg-[#0A6DC012] ${
                      beneficiaryType === "saved"
                        ? "bg-[#cbdff5] text-[#2F2F2F] hover:bg-[#cbdff5]"
                        : "bg-white border border-[#E3E3E3] text-[#9E9A9A]"
                    }`}
                  >
                    Select from Beneficiary ({beneficiaries.length}/5)
                  </Button>
                  <Button
                    type="button"
                    variant={beneficiaryType === "new" ? "default" : "outline"}
                    onClick={() => setValue("beneficiaryType", "new")}
                    className={`font-medium hover:bg-[#0A6DC012] ${
                      beneficiaryType === "new"
                        ? "bg-[#cbdff5] text-[#2F2F2F] hover:bg-[#cbdff5]"
                        : "bg-white border border-[#E3E3E3] text-[#9E9A9A]"
                    }`}
                  >
                    Add a new account to Beneficiary
                  </Button>
                </div>

                {beneficiaryType === "saved" ? (
                  <>
                    {isLoadingBeneficiaries ? (
                      <div className="flex items-center justify-center py-10">
                        <ClipLoader size={30} color="#0A6DC0" />
                        <span className="ml-3 text-[#9E9A9A]">
                          Loading beneficiaries...
                        </span>
                      </div>
                    ) : beneficiaries.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-[#9E9A9A] text-[16px]">
                          No beneficiaries found
                        </p>
                        <p className="text-[#9E9A9A] text-[14px] mt-2">
                          Add a new beneficiary to get started
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-5">
                          {beneficiaries.map((ben, i) => (
                            <button
                              key={ben.id}
                              type="button"
                              onClick={() => {
                                setValue("savedBeneficiaryIndex", i);
                                setSelectedBeneficiaryData(ben);
                              }}
                              className={`w-full border-b p-2 border-[#E0E0E0] text-left flex items-center gap-4 transition-all ${
                                savedIndex === i ? "bg-[#0A6DC01A]" : ""
                              }`}
                            >
                              <Landmark color="#9E9A9A" />
                              <div>
                                <p className="font-medium text-[#2F2F2F] font-dm-sans">
                                  {ben.name}
                                </p>
                                <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                                  {ben.accountNumber}
                                </p>
                                <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                                  {ben.bankName}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>

                        {savedIndex !== undefined && (
                          <Button
                            type="button"
                            onClick={handleStep1}
                            className="w-full bg-[#0A6DC0] hover:bg-[#09599a] mt-6 py-6"
                          >
                            Proceed
                          </Button>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 pb-3">
                    {/* Bank Dropdown */}
                    <div>
                      <Label className="text-[#2F2F2F] font-medium text-[16px]">
                        Bank
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-[55px] font-normal text-left"
                          >
                            {selectedBankCode
                              ? banks.find(
                                  (bank) => bank.code === selectedBankCode,
                                )?.name
                              : "Select a bank..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-full p-0"
                          align="start"
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          <Command>
                            <CommandInput
                              placeholder="Search bank..."
                              className="h-9"
                            />
                            <CommandList className="max-h-[300px] overflow-y-auto">
                              <CommandEmpty>No bank found.</CommandEmpty>
                              <CommandGroup>
                                {banks.map((bank) => (
                                  <CommandItem
                                    key={bank.code}
                                    value={bank.name}
                                    onSelect={() => {
                                      setSelectedBankCode(bank.code);
                                      document.dispatchEvent(
                                        new KeyboardEvent("keydown", {
                                          key: "Escape",
                                        }),
                                      );
                                    }}
                                    className="cursor-pointer hover:bg-gray-100"
                                  >
                                    {bank.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Account Number */}
                    <div>
                      <Label className="text-[#2F2F2F] font-medium text-[16px]">
                        Account Number
                      </Label>
                      <Input
                        placeholder="10 digits"
                        className="h-[55px]"
                        value={accountNumber}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setAccountNumber(val);
                        }}
                        maxLength={10}
                      />
                    </div>

                    {isEnquiring && (
                      <div className="text-[#0A6DC0] flex items-center gap-2">
                        Verifying Account Number...
                        <ClipLoader size={20} color="#0A6DC0" />
                      </div>
                    )}

                    {enquiryError && (
                      <p className="text-sm text-red-600">{enquiryError}</p>
                    )}

                    {/* ── New verified account block with "Add to beneficiary" action ── */}
                    {accountName && (
                      <div className="pt-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">
                                Account Name
                              </p>
                              <p className="font-semibold text-[#0A6DC0]">
                                {accountName}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {accountNumber} •{" "}
                                {
                                  banks.find((b) => b.code === selectedBankCode)
                                    ?.name
                                }
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleAddToBeneficiary}
                              disabled={isSavingBeneficiary}
                              className="flex flex-col items-end text-[#0A6DC0] hover:text-[#09599a] transition-colors group"
                            >
                              <MoveRight className="h-8 w-8 group-hover:translate-x-1 transition-transform " />
                              <span className="text-xs font-medium mt-1 whitespace-nowrap">
                                {isSavingBeneficiary
                                  ? "Adding..."
                                  : "Add to beneficiary"}
                              </span>
                            </button>
                          </div>

                          {isSavingBeneficiary && (
                            <div className="mt-3 text-center text-sm text-gray-500">
                              <ClipLoader
                                size={14}
                                color="#0A6DC0"
                                className="mr-2"
                              />
                              Adding beneficiary...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} className="mt-4">
                  <MoveLeft />
                </button>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium ">
                  Enter Amount to transfer and click on the proceed button to
                  confirm transfer
                </p>

                <div className="bg-[url('/balance-bg.svg')] my-2 bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-4">
                          <h1 className="font-bold font-dm-sans font-regular text-[13px] text-white">
                            Wallet Balance
                          </h1>
                          <button
                            type="button"
                            onClick={() => setShowBallance(!showBallance)}
                          >
                            {showBallance ? (
                              <EyeOff size={21} color="white" />
                            ) : (
                              <Eye size={23} color="white" />
                            )}
                          </button>
                        </div>
                        {showBallance ? (
                          <h1 className="text-[28px] text-white font-clash font-bold">
                            * * * *
                          </h1>
                        ) : (
                          <h1 className="font-clash text-white text-[20px] font-semibold">
                            ₦ {getBalance()}
                          </h1>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-2">
                  <Landmark color="#9E9A9A" />
                  <div>
                    <p className="font-medium text-[#2F2F2F] font-dm-sans">
                      {finalAccountName}
                    </p>
                    <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                      {finalAccountNumber}
                    </p>
                    <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                      {finalBankName}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            className="h-[55px]"
                            onKeyDown={(e) => {
                              if (
                                !/[\d.eE+-]|Backspace|Delete|Tab|Arrow/.test(
                                  e.key,
                                ) &&
                                !(e.ctrlKey || e.metaKey)
                              ) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^\d.]/g,
                                "",
                              );

                              const parts = value.split(".");
                              if (parts.length > 2) {
                                return;
                              }

                              field.onChange(value === "" ? "" : Number(value));
                            }}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="narration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Narration</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Goods payment"
                            className="h-[55px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleStep2}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 mt-6"
                >
                  Proceed to Confirm
                </Button>
              </>
            )}

            {/* Step 3 - Confirmation */}
            {step === 3 && (
              <>
                <button onClick={() => setStep(2)} className="mt-4">
                  <MoveLeft />
                </button>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium ">
                  Confirm the information below is correct and click the proceed
                  button to enter transaction pin
                </p>
                <div className="gap-y-2 md:gap-y-4 text-left mt-5 grid grid-cols-2 gap-x-5 md:gap-x-0">
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Account Name
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      {finalAccountName}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Account No
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      {finalAccountNumber}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Bank
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      {finalBankName}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Transfer amount
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      ₦{watch("amount")?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Fee amount
                    </h2>
                    <p className="text-[13px] md:text-[16px]">₦{fee}</p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Total amount
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      ₦{(fee + (watch("amount") || 0)).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Narration:
                    </h2>
                    <p className="text-[13px] md:text-[16px]">
                      {watch("narration") || "None"}
                    </p>
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[13px] md:text-[16px] font-bold text-[#2F2F2F]">
                      Destination
                    </h2>
                    <p className="text-[13px] md:text-[16px]">Other Bank</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] my-4 py-6"
                >
                  Proceed
                </Button>
              </>
            )}

            {/* Step 4 - PIN Entry */}
            {step === 4 && (
              <div className="mt-3">
                <button onClick={() => setStep(3)} className="mt-4">
                  <MoveLeft />
                </button>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
                  To proceed with this transaction, please enter your PIN
                </p>

                <div className="flex gap-4 my-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <div
                        className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-[16px] font-medium transition-all relative ${
                          pin?.[index]
                            ? "border-[#0A6DC0] bg-[#0A6DC01A]"
                            : "border-[#D8D8D866] bg-[#F9F9F9]"
                        } ${
                          pin?.length === index
                            ? "!border-[#0A6DC0] !bg-white"
                            : ""
                        }`}
                      >
                        {pin?.[index] || ""}
                        {pin?.length === index && !pin?.[index] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[2px] h-4 bg-[#0A6DC0] animate-blink" />
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={pin?.[index] || ""}
                        onChange={(e) => {
                          const digit = e.target.value.replace(/\D/g, "");
                          if (digit || e.target.value === "") {
                            const newPin = (pin || "").split("");
                            newPin[index] = digit;
                            setValue("pin", newPin.join("").slice(0, 4));
                            if (digit && index < 3) {
                              document
                                .getElementById(`pin-${index + 1}`)
                                ?.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            !pin?.[index] &&
                            index > 0
                          ) {
                            e.preventDefault();
                            document
                              .getElementById(`pin-${index - 1}`)
                              ?.focus();
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        id={`pin-${index}`}
                        className="absolute inset-0 opacity-0 cursor-default"
                        autoFocus={index === 0}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-5 md:py-6 "
                  disabled={pin?.length !== 4 || isTransferring}
                >
                  {isTransferring ? (
                    <>
                      <ClipLoader size={20} color="white" className="mr-2" />
                      Sending Money...
                    </>
                  ) : pin?.length === 4 ? (
                    "Send Money"
                  ) : (
                    `Send Money`
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </Form>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="text-center w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] p-8">
          <AlertDialogHeader className="">
            <Lottie
              animationData={animationData}
              loop={true}
              className="w-40 md:w-64 md:h-64 mx-auto drop-shadow-lg"
            />
            <div className="">
              <AlertDialogTitle className="text-center text-[#2F2F2F] text-[20px] md:text-[28px] font-bold font-clash">
                🎉 Transfer Successful! 🎉
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[16px] font-medium text-[#9E9A9A] font-dm-sans text-center">
                <p>You have successfully sent</p>
                <p className="text-[22px] md:text-[28px] font-bold text-[#0A6DC0]">
                  ₦{((watch("amount") || 0) + fee).toLocaleString()}
                </p>
                <p className="text-sm text-[#9E9A9A] mt-2">
                  (Amount: ₦{(watch("amount") || 0).toLocaleString()} + Fee: ₦
                  {fee})
                </p>
                <p>to</p>
                <p className="text-[18px] md:text-[22px] font-bold text-[#2F2F2F]">
                  {finalAccountName}
                </p>
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogAction
              className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 text-lg font-medium"
              onClick={() => router.push("/account/overview")}
            >
              Back to Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
}
