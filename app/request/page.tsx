"use client";
import { ItemDetails } from "@/components/dashboard/loadRequest/ItemDetails";
import LoanStatus from "@/components/dashboard/loadRequest/LoadStatus";
import LoanStepsSidebar from "@/components/dashboard/loadRequest/LoanStepsSidebar";
import LoanStepOne from "@/components/dashboard/loadRequest/WhatToBuy";
import LoanStepTwo from "@/components/dashboard/loadRequest/WhoToBuyFrom";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

interface Item {
  name: string;
  quantity: string;
  tenure: string;
  amount: string;
}

const LoanApplication: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [items, setItems] = useState<Item[]>([
    { name: "", quantity: "", tenure: "", amount: "" },
  ]);
  const [vendor, setVendor] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: "", tenure: "", amount: "" }]);
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

  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  return (
    <div>
      <div className="flex justify-between px-20 pt-10 w-full">
        <Image
          src="/assets/logo/logo.png"
          alt="Vera logo"
          width={150}
          height={80}
        />
        <Button
          className=" text-black bg-inherit hover:bg-inherit"
          onClick={() => router.back()}
        >
          <IoCloseOutline size="28" />
        </Button>
      </div>
      <div className="flex md:flex-row gap-20 p-5 md:p-20 h-screen font-sans bg-background">
        <div className="w-[40%] md:flex hidden">
          <LoanStepsSidebar
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>

        <div className=" w-full md:w-full h-screen px-5 py-10 md:p-16 bg-white">
          {currentStep === 1 && (
            <LoanStepOne
              items={items}
              onAddItem={handleAddItem}
              onNext={handleNextStep}
              onInputChange={handleInputChange}
            />
          )}

          {currentStep === 2 && (
            <LoanStepTwo
              vendor={vendor}
              onVendorChange={(e) => setVendor(e.target.value)}
              selectedBank={selectedBank}
              onBankChange={handleBankChange}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          )}
          {currentStep === 3 && (
            <ItemDetails
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          )}
          {currentStep === 4 && <LoanStatus />}
        </div>
      </div>
    </div>
  );
};

export default LoanApplication;
