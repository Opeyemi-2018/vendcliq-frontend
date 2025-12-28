/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/OtherBankTransfer.tsx
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

import { transferSchema, TransferFormData } from "@/types/transfer";
import { Separator } from "@/components/ui/separator";
import { getNipBanks, performNameEnquiry } from "@/actions/otherBanks";
import { ClipLoader } from "react-spinners";
import {
  handleValidatePin,
  handleOtherBankTransfer,
} from "@/lib/utils/api/apiHelper";
import { generateTransactionKey } from "@/lib/utils/generateTransactionKey";
import { useUser } from "@/context/userContext";

const beneficiaries = [
  {
    name: "Shotayo Samson Olumide",
    accountNo: "2764758697",
    bank: "United Bank for Africa",
  },
  {
    name: "Shotayo Samson Olumide",
    accountNo: "2764758697",
    bank: "United Bank for Africa",
  },
  {
    name: "Shotayo Samson Olumide",
    accountNo: "2764758697",
    bank: "United Bank for Africa",
  },
];

export default function OtherBankTransfer() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showBallance, setShowBallance] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // Custom states for new beneficiary
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string | null>(null);
  const [isEnquiring, setIsEnquiring] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  // Reliable states for display in Step 2 & 3
  const [finalAccountNumber, setFinalAccountNumber] = useState<string>("");
  const [finalBankName, setFinalBankName] = useState<string>("");
  const [finalAccountName, setFinalAccountName] = useState<string>("");

  const { wallet } = useUser();

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

  const selectedBeneficiary =
    beneficiaryType === "saved" && savedIndex !== undefined
      ? beneficiaries[savedIndex]
      : null;

  // Load banks
  useEffect(() => {
    async function loadBanks() {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      const bankList = await getNipBanks(token);
      if (bankList) {
        setBanks(bankList);
      } else {
        toast.error("Failed to load banks. Please try again.");
      }
    }
    loadBanks();
  }, []);

  // Name enquiry
  useEffect(() => {
    async function doEnquiry() {
      if (selectedBankCode && accountNumber.length === 10) {
        setIsEnquiring(true);
        setAccountName(null);
        setEnquiryError(null);

        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");
        if (!token) {
          setEnquiryError("Session expired");
          setIsEnquiring(false);
          return;
        }

        const name = await performNameEnquiry(
          selectedBankCode,
          accountNumber,
          token
        );

        if (name) {
          setAccountName(name);
          setValue("accountName", name);
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
    if (beneficiaryType === "new") {
      if (!selectedBankCode || accountNumber.length !== 10 || !accountName) {
        toast.error("Please select a bank and verify the account name");
        return;
      }
      const selectedBankName =
        banks.find((b) => b.code === selectedBankCode)?.name || "";

      // Save to reliable state
      setFinalBankName(selectedBankName);
      setFinalAccountNumber(accountNumber);
      setFinalAccountName(accountName);

      setValue("bank", selectedBankName);
      setValue("accountNumber", accountNumber);
      setValue("accountName", accountName);
    }
    setStep(2);
  };

  const handleStep2 = () => {
    const amount = watch("amount");
    const narration = watch("narration");

    // Validate amount
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if amount is 0, 00, 000, etc. (as string or number)
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

    // Check for special characters in amount (except decimal point)
    if (isNaN(Number(amount))) {
      toast.error("Amount must be a valid number");
      return;
    }

    // Validate narration
    if (!narration || narration.trim() === "") {
      toast.error("Please enter a narration");
      return;
    }

    // Check narration length
    if (narration.trim().length < 2) {
      toast.error("Narration is too short");
      return;
    }

    // If all validations pass, proceed to next step
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!pin || pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    if (!finalAccountName || !selectedBankCode || !finalAccountNumber) {
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
      // 1. Validate PIN
      const pinRes = await handleValidatePin({ pin });
      if (pinRes.status !== "success" || !pinRes.data?.validated) {
        toast.error(pinRes.msg || "Invalid PIN");
        setIsTransferring(false);
        return;
      }

      const pinToken = pinRes.data.pinToken;

      // 2. Generate transaction key
      const transactionKey = await generateTransactionKey();

      // 3. Source account
      const sourceAccountNumber = wallet?.accountNumbers?.WEMA;
      if (!sourceAccountNumber) {
        toast.error("Source wallet account not found");
        setIsTransferring(false);
        return;
      }

      // 4. Build payload
      const payload = {
        transactionKey,
        amount: Number(amount),
        beneficiaryAccountNumber: finalAccountNumber,
        beneficiaryBankCode: selectedBankCode,
        beneficiaryAccountName: finalAccountName,
        narration: narration || "Transfer",
        sourceAccountNumber,
        deviceFingerprint: `web-${Date.now()}-${Math.random()}`,
        ipAddress: "0.0.0.0",
        pinToken,
      };

      // 5. Send transfer
      const transferRes = await handleOtherBankTransfer(payload);

      if (transferRes.status === "success") {
        toast.success("Transfer successful!");
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
        <Card className="p-6">
          <h2 className="text-[16px] text-[#2F2F2F] font-semibold font-clash mb-2">
            Other Bank Transfer
          </h2>
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
                  <div className="space-y-5">
                    {beneficiaries.map((ben, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setValue("savedBeneficiaryIndex", i)}
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
                            {ben.accountNo}
                          </p>
                          <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                            {ben.bank}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 pb-3">
                    {/* Searchable Bank Dropdown */}
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
                                  (bank) => bank.code === selectedBankCode
                                )?.name
                              : "Select a bank..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search bank..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No bank found.</CommandEmpty>
                              <CommandGroup>
                                {banks.map((bank) => (
                                  <CommandItem
                                    key={bank.code}
                                    value={bank.name}
                                    onSelect={() => {
                                      setSelectedBankCode(bank.code);
                                    }}
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

                    {/* Name Enquiry Result */}
                    {isEnquiring && (
                      <div className="text-[#0A6DC0]">
                        Verifying Account Number...
                        <ClipLoader size={20} color="#0A6DC0" />
                      </div>
                    )}
                    <p className="text-[16px] font-dm-sans text-[#9E9A9A]">
                      Account Name
                    </p>
                    {accountName && (
                      <div
                        onClick={() => {
                          // Save values before navigating
                          const selectedBankName =
                            banks.find((b) => b.code === selectedBankCode)
                              ?.name || "";
                          setFinalBankName(selectedBankName);
                          setFinalAccountNumber(accountNumber);
                          setFinalAccountName(accountName);

                          setValue("bank", selectedBankName);
                          setValue("accountNumber", accountNumber);
                          setValue("accountName", accountName);

                          setStep(2);
                        }}
                      >
                        <p
                          onClick={handleStep1}
                          className="font-bold text-[#0A6DC0] text-[16px] -mt-3 flex items-center gap-4 cursor-pointer"
                        >
                          {accountName} <MoveRight className="text-[#0A6DC0]" />
                        </p>
                      </div>
                    )}
                    {enquiryError && (
                      <p className="text-sm text-red-600">{enquiryError}</p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium mt-3">
                  Enter Amount to transfer and click on the proceed button to
                  confirm transfer
                </p>

                <div className="bg-[url('/balance-bg.svg')] my-6 bg-cover bg-no-repeat bg-center  h-[100px] rounded-2xl p-6">
                  <div className="space-y-3">
                    <div className=" flex items-center gap-2">
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-4">
                          <h1 className="font-bold font-dm-sans font-regular text-[13px]   text-white">
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
                          <h1 className="font-clash text-white text-[20px]  font-semibold">
                            # {wallet?.balance}
                          </h1>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Landmark color="#9E9A9A" />
                  <div>
                    <p className="font-medium text-[#2F2F2F] font-dm-sans">
                      {selectedBeneficiary?.name || finalAccountName}
                    </p>
                    <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                      {selectedBeneficiary?.accountNo || finalAccountNumber}
                    </p>
                    <p className="text-[13px] text-[#2F2F2F] font-dm-sans">
                      {selectedBeneficiary?.bank || finalBankName}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
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
                              // Prevent special characters except numbers, backspace, delete, tab, arrow keys
                              if (
                                !/[\d.eE+-]|Backspace|Delete|Tab|Arrow/.test(
                                  e.key
                                ) &&
                                !(e.ctrlKey || e.metaKey)
                              ) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              // Remove any non-numeric characters except decimal point
                              const value = e.target.value.replace(
                                /[^\d.]/g,
                                ""
                              );

                              // Prevent multiple decimal points
                              const parts = value.split(".");
                              if (parts.length > 2) {
                                return;
                              }

                              // Update field value
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="mt-8"
                >
                  <ChevronLeft className="w-4 mr-2" /> Back
                </Button>
              </>
            )}

            {/* Step 3 - Confirmation */}
            {step === 3 && (
              <>
                <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium mt-3">
                  Confirm the information below is correct and click the proceed
                  button to enter transaction pin
                </p>
                <div className="space-y-4 text-left mt-5">
                  {/* Destination */}

                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Account Name
                    </h2>{" "}
                    {selectedBeneficiary?.name || finalAccountName}
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Account No
                    </h2>{" "}
                    {selectedBeneficiary?.accountNo || finalAccountNumber}
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Beneficiary Bank
                    </h2>{" "}
                    {selectedBeneficiary?.bank || finalBankName}
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Transfer amount
                    </h2>{" "}
                    ₦{watch("amount")?.toLocaleString()}
                  </div>

                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Narration:
                    </h2>{" "}
                    {watch("narration") || "None"}
                  </div>
                  <div>
                    <h2 className="font-dm-sans text-[16px] font-bold text-[#2F2F2F]">
                      Destination
                    </h2>
                    <p className="text-[#2F2F2F] font-medium">Other Bank</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] my-4 py-6"
                >
                  Proceed
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="mt-8"
                >
                  <ChevronLeft className="w-4 mr-2" /> Back
                </Button>
              </>
            )}

            {/* Step 4 - PIN Entry */}
            {step === 4 && (
              <div className="mt-8">
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
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-5 md:py-6 text-lg font-medium"
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="mt-8"
                >
                  <ChevronLeft className="w-4 mr-2" /> Back
                </Button>
              </div>
            )}
          </form>
        </Card>
      </Form>

      {/* Success Modal with 🎉 */}
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
                  ₦{watch("amount")?.toLocaleString()}
                </p>
                <p>to</p>
                <p className="text-[18px] md:text-[22px] font-bold text-[#2F2F2F]">
                  {finalAccountName || selectedBeneficiary?.name}
                </p>
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogAction
              className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 text-lg font-medium"
              onClick={() => router.push("/dashboards/account/overview")}
            >
              Back to Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Blink Animation */}
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
