"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

import { type SignupFormData } from "@/types/auth";

import { toast } from "sonner";
import { useState } from "react";
import ProgressHeader from "./ProgressHeader";

interface Props {
  onNext: (data: Partial<SignupFormData>) => void;

  data: SignupFormData;
}

const goals = [
  { id: "Fast Sales" as const, title: "Fast Sales", icon: "⚡" },
  { id: "Higher Profit" as const, title: "Higher Profit", icon: "📈" },
];

export default function Step8({ onNext, data }: Props) {

  const [selected, setSelected] = useState<SignupFormData["companyGoal"]>(
    data.companyGoal || "Fast Sales"
  );

  const handleContinue = () => {
    if (selected) {
      onNext({ companyGoal: selected });
      toast.success("Goal selected! One last step...");
    } else {
      toast.error("Please select a goal to continue.");
    }
  };

  return (
    <div>
     
      <ProgressHeader currentStep={8} />

      <h1 className="text-[22px] font-semibold mb-3">
        What’s your main business goal?
      </h1>
      <p className="text-[#9E9A9A] mb-8">
        This helps us recommend the best features and pricing for you
      </p>

      <div className="space-y-4">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelected(goal.id)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              selected === goal.id
                ? "border-[#0A6DC0] bg-[#0A6DC012]"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{goal.icon}</span>
                <h3
                  className={`text-[16px] transition-colors ${
                    selected === goal.id ? "text-[#2F2F2F]" : "text-[#9E9A9A]"
                  }`}
                >
                  {goal.title}
                </h3>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected === goal.id
                    ? "bg-[#0A6DC0]"
                    : "border-[#E3E3E3] bg-white group-hover:border-slate-400"
                }`}
              >
                {selected === goal.id && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-bold py-6 rounded-xl mt-10"
      >
        Continue
      </Button>
    </div>
  );
}
