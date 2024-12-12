"use client";
import { ItemDetails } from "@/components/dashboard/loadRequest/ItemDetails";
import LoanStatus from "@/components/dashboard/loadRequest/LoadStatus";
import LoanStepsSidebar from "@/components/dashboard/loadRequest/LoanStepsSidebar";
import LoanStepOne from "@/components/dashboard/loadRequest/WhatToBuy";
import LoanStepTwo from "@/components/dashboard/loadRequest/WhoToBuyFrom";
import Logo from "@/components/Logo";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

interface Item {
  name: string;
  quantity: string;
  tenure?: string;
  amount: string;
}

export interface VendorDetails {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  invoiceNo: string;
  narration: string;
  amount: string;
  tenure: string;
}

const LoanApplication: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState<Item[]>([
    { name: "", quantity: "", amount: "" },
  ]);
  const [vendor, setVendor] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [vendorDetails, setVendorDetails] = useState<VendorDetails>({
    accountNumber: "",
    accountName: "",
    bankCode: "",
    invoiceNo: "",
    narration: "",
    amount: "",
    tenure: "",
  });

  useEffect(() => {
    console.log("LoanApplication mounted");
    return () => {
      console.log("LoanApplication unmounted");
    };
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        name: "",
        quantity: "",
        amount: "",
      },
    ]);
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newItems = [...items];
    newItems[index][event.target.name as keyof Item] = event.target.value;
    setItems(newItems);
  };

  const handleBankChange = (value: string) => {
    setSelectedBank(value);
  };

  const handleSubmitLoan = async () => {
    try {
      const payload = {
        amount: parseFloat(vendorDetails.amount),
        term: parseInt(vendorDetails.tenure),
        purpose: "purchase",
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          amount: item.amount,
          tenure: item.tenure,
        })),
        vendor: vendor,
        bankCode: selectedBank,
        accountName: vendorDetails.accountName,
        narration: vendorDetails.narration,
        invoiceNumber: vendorDetails.invoiceNo,
      };
      console.log("payload", payload);
      // await handleCreateLoan(payload);
      handleNextStep();
    } catch (error) {
      console.error("Failed to submit loan:", error);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return items.every((item) => item.name && item.quantity && item.amount);
      case 2:
        return !!selectedBank;
      case 3:
        return true; // Remove validation for step 3 to allow progression
      case 4:
        return true; // Remove validation for step 4 to allow progression
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      console.log("currentStep", currentStep);
      setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  return (
    <div>
      <div className="flex justify-between  px-5 md:px-20 pt-10 w-full">
        <div>
          <Logo />
        </div>

        <IoCloseOutline size="28" onClick={() => router.back()} />
      </div>
      <div className="flex md:flex-row gap-20 p-5 md:p-20 h-screen font-sans bg-background">
        <div className="w-[40%] md:flex hidden">
          <LoanStepsSidebar
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step >= 1 && step <= 4) setCurrentStep(step);
            }}
          />
        </div>

        <div className="w-full md:w-full h-screen">
          {currentStep === 1 && (
            <LoanStepOne
              key={1}
              items={items}
              onAddItem={handleAddItem}
              onNext={handleNextStep}
              onInputChange={handleInputChange}
            />
          )}

          {currentStep === 2 && (
            <LoanStepTwo
              key={2}
              onVendorChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setVendor(e.target.value)
              }
              selectedBank={selectedBank}
              onBankChange={handleBankChange}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          )}
          {currentStep === 3 && (
            <ItemDetails
              key={3}
              onNext={handleNextStep}
              onSubmit={handleSubmitLoan}
              onPrevious={handlePreviousStep}
              vendorDetails={{
                amount: parseFloat(vendorDetails.amount),
                tenure: vendorDetails.tenure,
              }}
              setVendorDetails={(details) =>
                setVendorDetails({
                  ...vendorDetails,
                  amount: details.amount?.toString() || "",
                  tenure: details.tenure || "",
                })
              }
            />
          )}
          {currentStep === 4 && <LoanStatus />}
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
