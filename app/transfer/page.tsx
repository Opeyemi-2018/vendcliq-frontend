"use client";
import TransferSidebar from "@/components/dashboard/transfer/TransferSidebar";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React, { useState } from "react";

const Page = () => {
  const [selectedOption, setSelectedOption] = useState<"Vera" | "Other Banks">(
    "Vera"
  );

  const handleSelect = (option: "Vera" | "Other Banks") => {
    setSelectedOption(option);
  };
  const [fromAccount, setFromAccount] = useState("");
  const [beneficiaryAccount, setBeneficiaryAccount] = useState("");
  const [beneficiaryName] = useState("Erik Ten Hag");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [saveToBeneficiaryList, setSaveToBeneficiaryList] = useState(false);

  return (
    <div>
      <div className="flex md:flex-row flex-col gap-5 md:gap-20 p-5 md:px-20 pt-10 h-screen font-sans bg-background">
        <div className="">
          <TransferSidebar
            selectedOption={selectedOption}
            onSelect={handleSelect}
          />
        </div>

        <div className="  w-full md:w-[50%] h-fit md:py-10 md:p-16 bg-white">
          <div className="flex p-5 md:p-8">
            {selectedOption === "Vera" ? (
              <div className="w-full">
                <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
                  Transfer to Vera
                </h3>
                <Label className="block text-sm font-medium text-gray-700">
                  From Account
                </Label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="border rounded-sm border-input-border h-12 text-sm text-black bg-light-gray px-3 py-2 focus:outline-none focus:border-0 w-full"
                >
                  <option value="">Select account</option>
                  {/* Add options dynamically as needed */}
                </select>
                {/* Beneficiary Account */}
                <div className="flex md:flex-row flex-col md:gap-5 mt-5">
                  <Field
                    label="  Beneficiary Account"
                    type="text"
                    value={beneficiaryAccount}
                    onChange={(e) => setBeneficiaryAccount(e.target.value)}
                    placeholder="Enter account number"
                    className="flex-1"
                  />
                  <Field
                    label="   Beneficiary Name"
                    type="text"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryAccount(e.target.value)}
                    placeholder="Enter account number"
                    className="flex-1"
                  />
                </div>

                {/* Amount */}
                <Field
                  label="Amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="NGN"
                />

                <Field
                  label="Narration"
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />

                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    checked={saveToBeneficiaryList}
                    onChange={() =>
                      setSaveToBeneficiaryList(!saveToBeneficiaryList)
                    }
                    className="h-4 w-4 text-yellow-500 focus:ring focus:ring-yellow-400 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Save to beneficiary list
                  </label>
                </div>
                <Link href={"/transfer/confirmation"}>
                  <Button className="w-full py-2 bg-yellow-500 text-black font-semibold rounded-none hover:bg-yellow-600 transition-colors">
                    Transfer Money
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="w-full">
                <h3 className="text-xl font-medium border-b border-border pb-2 font-clash mb-8">
                  Transfer to Other Banks
                </h3>

                <div className="flex md:flex-row flex-col  mb-5 gap-5">
                  <div className="flex-1">
                    <Label className="block text-sm font-medium text-gray-700">
                      From Account
                    </Label>
                    <select
                      value={fromAccount}
                      onChange={(e) => setFromAccount(e.target.value)}
                      className="border rounded-sm border-input-border h-12 text-sm text-black bg-light-gray px-3 py-2 focus:outline-none focus:border-0 w-full"
                    >
                      <option value="">Select account</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label className="block text-sm font-medium text-gray-700">
                      Select Beneficiary Bank
                    </Label>
                    <select
                      value={fromAccount}
                      onChange={(e) => setFromAccount(e.target.value)}
                      className="border rounded-sm border-input-border h-12 text-sm text-black bg-light-gray px-3 py-2 focus:outline-none focus:border-0 w-full"
                    >
                      <option value="">Select account</option>
                    </select>
                  </div>
                </div>

                <div className="flex md:flex-row flex-col  md:gap-5">
                  <Field
                    label="  Beneficiary Account"
                    type="text"
                    value={beneficiaryAccount}
                    onChange={(e) => setBeneficiaryAccount(e.target.value)}
                    placeholder="Enter account number"
                    className="flex-1"
                  />
                  <Field
                    label="   Beneficiary Name"
                    type="text"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryAccount(e.target.value)}
                    placeholder="Enter account number"
                    className="flex-1"
                  />
                </div>

                {/* Amount */}
                <Field
                  label="Amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="NGN"
                />

                <Field
                  label="Narration"
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />

                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    checked={saveToBeneficiaryList}
                    onChange={() =>
                      setSaveToBeneficiaryList(!saveToBeneficiaryList)
                    }
                    className="h-4 w-4 text-yellow-500 focus:ring focus:ring-yellow-400 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Save to beneficiary list
                  </label>
                </div>
                <Link href={"/transfer/confirmation"}>
                  <Button className="w-full py-2 bg-yellow-500 text-black font-semibold rounded-none hover:bg-yellow-600 transition-colors">
                    Transfer Money
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
