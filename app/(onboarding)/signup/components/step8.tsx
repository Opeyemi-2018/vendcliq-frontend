"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClipLoader from "react-spinners/ClipLoader";
import { type SignupFormData } from "@/types/auth";
import { toast } from "sonner";
import { useState } from "react";
import ProgressHeader from "./ProgressHeader";
import { useRouter } from "next/navigation";
import { handleCreateBusinessDetails } from "@/lib/utils/api/apiHelper";

interface Props {
  onNext: (data: Partial<SignupFormData>) => void;
  data: SignupFormData;
}

const goals = [
  { id: "Fast Sales" as const, title: "Fast Sales", icon: "⚡" },
  { id: "Higher Profit" as const, title: "Higher Profit", icon: "📈" },
];

export default function Step8({ data }: Props) {
  const [selected, setSelected] = useState<SignupFormData["companyGoal"]>(
    data.companyGoal || "Fast Sales"
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!selected) {
      toast.error("Please select a goal");
      return;
    }

    setLoading(true);

    const payload = {
      businessType: data.businessType!,
      companyGoal: selected,
      businessName: data.businessName!,
      businessAddress: data.businessAddress!,
      logo: data.uploadedLogo || undefined,
    };

    try {
      const response = await handleCreateBusinessDetails(payload);

      if (response.status === "success") {
        toast.success("Business created successfully!");
        localStorage.removeItem("signupFormData");
        localStorage.removeItem("signupStep");
        router.push("/congrats");
      } else {
        toast.error(response.msg || "Failed to create business");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Network error. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProgressHeader currentStep={8} />

      <h1 className="text-[22px] font-semibold mb-3 font-clash">
        What&apos;s your main business goal?
      </h1>
      <p className="text-[#9E9A9A] mb-8">
        This helps us recommend the best features and pricing for you
      </p>

      <div className="space-y-4">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelected(goal.id)}
            disabled={loading}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              selected === goal.id
                ? "border-[#0A6DC0] bg-[#0A6DC012]"
                : "border-[#E5E7EB] bg-white"
            } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{goal.icon}</span>
                <h3
                  className={`text-[16px] font-medium ${
                    selected === goal.id ? "text-[#2F2F2F]" : "text-[#9E9A9A]"
                  }`}
                >
                  {goal.title}
                </h3>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected === goal.id
                    ? "bg-[#0A6DC0] border-[#0A6DC0]"
                    : "border-[#E3E3E3] bg-white"
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
        disabled={loading}
        className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-bold py-6 rounded-xl mt-8 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-80 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            Creating Account...
            <ClipLoader size={20} color="white" />
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
}