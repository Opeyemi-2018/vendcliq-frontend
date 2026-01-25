import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import Image from "next/image";
import { X } from "lucide-react";
import { DisplayPlan } from "@/types/plans";
import { Card } from "@/components/ui/card";

interface PlanConfirmationProps {
  plan: DisplayPlan;
  onConfirm: (isAnnual: boolean, months: number) => void;
  onBack: () => void;
}

const PlanConfirmation: React.FC<PlanConfirmationProps> = ({
  plan,
  onConfirm,
  onBack,
}) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [months, setMonths] = useState(1);

  const handleSubscribe = () => {
    onConfirm(isAnnual, months);
  };

  return (
    <div className="">
      <div className="mb-6">
        <div className="font-clash flex items-center gap-2 text-[#2F2F2F] dark:text-white">
          <p className="text-[20px] md:text-[25px] lg:text-[32px] font-semibold ">
            {plan.name} -
          </p>{" "}
          <p className="text-[20px] md:text-[25px] lg:text-[32px] font-semibold ">
            {" "}
            {"₦" +
              (
                (isAnnual ? plan.annualPrice : plan.monthlyPrice) * months
              ).toLocaleString()}{" "}
          </p>
          <span className="font-regular text-[25px]">
            {isAnnual ? "Yearly" : "Monthly"}
          </span>
        </div>
        <p className="font-medium font-dm-sans text-[#9E9A9A] text-[13px] md:text-[16px]">
          Choose and pay for the number of months you would like to subscribe to
        </p>
      </div>

      <div className="flex justify-between md:gap-4 flex-col lg:flex-row">
        <Card className="space-y-6 md:p-6 lg:w-[65%]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[#2F2F2F] font-dm-sans text-[16px]">
                Plan Name
              </label>
              <Input
                type="text"
                readOnly
                value={`${plan.name} plan`}
                className="w-full border border-[#E0E0E0] bg-[#F9F9F9] h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[#2F2F2F] font-dm-sans text-[16px]">
                Amount {isAnnual ? "Yearly" : "Monthly"} (NGN)
              </label>
              <Input
                type="text"
                value={
                  "₦" +
                  (isAnnual
                    ? plan.annualPrice.toLocaleString()
                    : plan.monthlyPrice.toLocaleString())
                }
                readOnly
                className="w-full bg-[#F9F9F9] border border-[#E0E0E0] h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[#2F2F2F] font-dm-sans text-[16px]">
                Number of {isAnnual ? "Years" : "Months"} to Subscribe
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => setMonths(Math.max(1, months - 1))}
                  className="px-4 h-12 bg-[#0A6DC0] text-white rounded-lg hover:bg-[#085a9d] transition-colors"
                >
                  -
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={months}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setMonths(1);
                    } else {
                      setMonths(Math.max(1, parseInt(val) || 1));
                    }
                  }}
                  placeholder="Min of 1"
                  className="flex-1 border border-[#E0E0E0] bg-[#F9F9F9] text-center h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                  type="button"
                  onClick={() => setMonths(months + 1)}
                  className="px-4 h-12 bg-[#0A6DC0] text-white rounded-lg hover:bg-[#085a9d] transition-colors"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[#2F2F2F] font-dm-sans text-[16px]">
                Total Amount Payable (NGN)
              </label>
              <Input
                type="text"
                readOnly
                value={
                  "₦" +
                  (
                    (isAnnual ? plan.annualPrice : plan.monthlyPrice) * months
                  ).toLocaleString()
                }
                className="w-full border border-[#E0E0E0] bg-[#F9F9F9] h-12"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onBack} variant="outline" className="flex-1 h-12">
              Back
            </Button>
            <Button
              onClick={handleSubscribe}
              className="flex-1 h-12 bg-[#0A6DC0] hover:bg-[#09599a] text-white"
            >
              Subscribe Now
            </Button>
          </div>
        </Card>

        {/* Plan Preview (desktop only) */}
        <div
          className={`border-2 ${plan.borderColor} ${plan.bgColor} rounded-lg hidden md:block py-6 px-4 lg:w-[35%] h-full bg-white`}
        >
          <div className="mb-6">
            <h3 className="text-[20px] lg:text-[22px] font-bold text-[#191D23] mb-2">
              {plan.name}
            </h3>
            <p className="text-[16px] leading-6 text-[#191D23] mb-4">
              {plan.description}
            </p>
            {plan.id !== "enterprise" ? (
              <div className="mb-2 flex items-center gap-2">
                <div className="text-[20px] lg:text-[24px] font-bold text-[#191D23]">
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
              <div className="text-[24px] font-bold text-[#191D23]">
                Negotiable
              </div>
            )}
          </div>

          <div className="space-y-3">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {feature.included ? (
                  <Image
                    src="/circle.svg"
                    alt="included"
                    width={100}
                    height={100}
                    className="w-[20px]"
                  />
                ) : (
                  <X
                    size={20}
                    className="text-[#4B5768] bg-[#E5E7EB] rounded-full p-1 flex-shrink-0 mt-0.5"
                  />
                )}
                <span
                  className={`text-sm ${
                    feature.included ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanConfirmation;