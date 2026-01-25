import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { X } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { DisplayPlan } from "@/types/plans";

interface PlansSelectionProps {
  plans: DisplayPlan[];
  loading: boolean;
  onSelectPlan: (plan: DisplayPlan) => void;
}

const PlansSelection: React.FC<PlansSelectionProps> = ({
  plans,
  loading,
  onSelectPlan,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <ClipLoader size={50} color="#0A6DC0" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex md:items-center justify-between gap-2 md:gap-0 mb-4 md:mb-7 flex-col md:flex-row">
        <div className="">
          <h1 className="font-clash text-[20px] md:text-[25px] lg:text-[32px] font-semibold text-[#2F2F2F] dark:text-white">
            Upgrade Plan
          </h1>
          <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
            Upgrade your plan today to enjoy more features and opportunities on
            Vendcliq{" "}
          </p>
        </div>

        <div className="flex items-center font-dm-sans bg-[#ECECF080] rounded-lg p-1">
          <Button
            onClick={() => setIsAnnual(false)}
            className={`px-3 w-full lg:px-6  bg-transparent rounded-md font-semibold transition-all text-nowrap ${
              !isAnnual
                ? "bg-[#0A6DC0] hover:bg-[#09599a] text-white  hover:text-[#2F2F2F]"
                : "text-gray-700 hover:bg-white hover:text-[#2F2F2F]"
            }`}
          >
            Monthly Payment
          </Button>
          <Button
            onClick={() => setIsAnnual(true)}
            className={`px-3 w-full lg:px-6  bg-transparent rounded-md font-semibold transition-all text-nowrap ${
              isAnnual
                ? "bg-[#0A6DC0] hover:bg-[#09599a] text-white  hover:text-[#2F2F2F]"
                : "text-gray-700 hover:bg-white hover:text-[#2F2F2F]"
            }`}
          >
            Annual Payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border-2 w-full ${plan.borderColor} ${plan.bgColor} rounded-2xl p-3 flex flex-col h-full transition-transform hover:shadow-lg hover:scale-[1.02]`}
          >
            <div className="mb-2 lg:mb-6">
              <h3 className="text-[20px] lg:text-[22px] font-bold text-[#191D23] mb-2">
                {plan.name}
              </h3>
              <p className="text-[14px] lg:text-[18px] lg:text-[20px] leading-6 text-[#191D23] mb-4">
                {plan.description}
              </p>
              {plan.id !== "enterprise" ? (
                <div className="mb-2 flex items-center gap-2">
                  <div className="lg:text-[20px] 2xl:text-[30px] font-bold text-[#191D23]">
                    NGN
                    {isAnnual
                      ? plan.annualPrice.toLocaleString()
                      : plan.monthlyPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    / {isAnnual ? "Year" : "Month"}
                  </div>
                </div>
              ) : (
                <div className="text-[20px] 2xl:text-[30px] font-bold text-[#191D23]">
                  Negotiable
                </div>
              )}
            </div>

            <div className="flex-1 mb-6">
              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-1">
                    {feature.included ? (
                      <Image
                        src="/circle.svg"
                        alt="included"
                        width={100}
                        height={100}
                        className="w-[25px]"
                      />
                    ) : (
                      <X
                        size={20}
                        className="text-[#4B5768] bg-[#E5E7EB] rounded-full p-1 flex-shrink-0 mt-0.5"
                      />
                    )}
                    <span
                      className={`text-[15px] ${
                        feature.included ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full py-3 rounded-lg font-semibold transition-all bg-[#0A6DC0] hover:bg-[#09599a] text-white hover:scale-105"
              onClick={() => onSelectPlan(plan)}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansSelection;
