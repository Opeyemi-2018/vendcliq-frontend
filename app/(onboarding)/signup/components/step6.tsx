"use client";

import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormData } from "../page";
import { toast } from "sonner";
import ProgressHeader from "./ProgressHeader";

interface Props {
  onNext: (data: Partial<FormData>) => void;
  
  data: FormData;
}

const accountTypes = [
  {
    id: "DISTRIBUTOR" as const,
    title: "Distributor",
    icon: "📦",
    description:
      "For businesses that buy directly from manufacturers and sell to wholesalers or retailers",
  },
  {
    id: "WHOLESALER" as const,
    title: "Wholesaler",
    icon: "🛒",
    description:
      "For businesses that buy from distributors or manufacturer and sell to the retailer",
  },
  {
    id: "RETAILER" as const,
    title: "Retailer",
    icon: "🏪",
    description:
      "For businesses that buy from distributors or wholesalers and sell to the final consumers.",
  },
];

export default function Step6({ onNext, data }: Props) {
  const [selected, setSelected] = useState<FormData["accountType"]>(
    data.accountType || "RETAILER"
  );

  const handleProceed = () => {
    onNext({ accountType: selected });
    toast.success("Account type selected!");
  };

  return (
    <div>
      {/* <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition mb-7 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <button
          onClick={handleProceed}
          className="text-slate-700 hover:text-slate-900 transition font-medium"
        >
          Next
        </button>
      </div> */}
      <ProgressHeader currentStep={6} />

      <div className="mb-10">
        <h1 className="text-[22px] font-semibold text-[#2F2F2F] mb-1">
          Account Type
        </h1>
        <p className="text-[#9E9A9A] text-[16px] leading-relaxed">
          Select the type of business you run so we can tailor features to your
          needs.
        </p>
      </div>

      <div className="mb-8">
        <label className="block text-slate-900 font-semibold mb-6">
          Select Account Type
        </label>

        <div className="space-y-3">
          {accountTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 text-left group ${
                selected === type.id
                  ? "border-[#E3E3E3] bg-[#0A6DC012]"
                  : "border-[#D8D8D866] bg-white hover:border-[#D8D8D8]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-3xl mt-1">{type.icon}</span>
                  <div>
                    <h3
                      className={`font-medium text-[16px] mb-1 transition-colors ${
                        selected === type.id
                          ? "text-[#2F2F2F]"
                          : "text-slate-900"
                      }`}
                    >
                      {type.title}
                    </h3>
                    <p
                      className={`text-[13px] leading-relaxed ${
                        selected === type.id
                          ? "text-[#2F2F2F]"
                          : "text-[#9E9A9A]"
                      }`}
                    >
                      {type.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                    selected === type.id
                      ? "bg-[#0A6DC0] border-[#0A6DC0]"
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                  }`}
                >
                  {selected === type.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleProceed}
        className="w-full bg-[#0A6DC0]  text-white font-bold py-6 px-6 rounded-xl transition-all duration-300 hover:shadow-xl"
      >
        Proceed
      </Button>
    </div>
  );
}
