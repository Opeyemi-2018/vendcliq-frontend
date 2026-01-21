"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import PlansSelection from "./chunks/plan";
import PlanConfirmation from "./chunks/confirmPlan";
import PaymentInfo from "./chunks/paymentInfo";
import { DisplayPlan, PlanEntity } from "@/types/plans";
import { fetchPricingPlans } from "@/actions/plans";
import { useRouter } from "next/navigation"; // ← added for navigation
import { Button } from "@/components/ui/button";

const getPlanDescription = (planName: string): string => {
  const lowerName = planName.toLowerCase();
  if (lowerName.includes("starter"))
    return "Perfect for small businesses starting out.";
  if (lowerName.includes("smart"))
    return "For growing businesses managing multiple outlets.";
  if (lowerName.includes("pro"))
    return "For scaling vendors with advanced needs";
  if (lowerName.includes("enterprise"))
    return "Custom solutions for large-scale operations";
  return "Flexible plan for your business needs";
};

const getPlanStyling = (planName: string) => {
  const lowerName = planName.toLowerCase();
  if (lowerName.includes("starter"))
    return { borderColor: "border-[#B9900C]", bgColor: "bg-[#FFFBF3]" };
  if (lowerName.includes("smart"))
    return { borderColor: "border-[#0A6DC0]", bgColor: "bg-[#F7FAFF]" };
  if (lowerName.includes("pro"))
    return { borderColor: "border-[#5FB349]", bgColor: "bg-[#F9FFF7]" };
  if (lowerName.includes("enterprise"))
    return { borderColor: "border-[#FF540B]", bgColor: "bg-[#FFF0F0]" };
  return { borderColor: "border-gray-200", bgColor: "bg-gray-50" };
};

const formatFeatureValue = (value: number): string => {
  if (value >= 1000000) return "Unlimited";
  return value.toString();
};

const transformPlanToDisplay = (plan: PlanEntity): DisplayPlan => {
  const styling = getPlanStyling(plan.name);
  const features = [
    {
      name: `${formatFeatureValue(plan.storeLimit)} Store${plan.storeLimit > 1 ? "s" : ""}`,
      included: true,
    },
    {
      name: `${formatFeatureValue(plan.productLimitPerStore)} Products per Store`,
      included: true,
    },
    {
      name: `${formatFeatureValue(plan.shopAttendantLimit)} Shop Attendant${plan.shopAttendantLimit !== 1 ? "s" : ""}`,
      included: plan.shopAttendantLimit > 0,
    },
    {
      name: `${formatFeatureValue(plan.aiStockRecommendationLimit)} AI Stock Recommendations`,
      included: plan.aiStockRecommendationLimit > 0,
    },
    { name: "POS Device Support", included: plan.hasPOSDevice },
    { name: "Auto Stock Updates", included: plan.autoStockUpdate },
    { name: "Invoice Generation", included: plan.invoiceAllowed },
  ];

  return {
    id: plan.id,
    name: plan.name,
    description: getPlanDescription(plan.name),
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.yearlyPrice,
    features,
    buttonText: "Choose Plan",
    borderColor: styling.borderColor,
    bgColor: styling.bgColor,
  };
};

const Subscription = () => {
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [months, setMonths] = useState(1);

  const router = useRouter(); // ← added for navigation

  const enterprisePlan: DisplayPlan = {
    id: 999,
    name: "Enterprise",
    description: "For large-scale retail and enterprise operations.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { name: "Unlimited Stores", included: true },
      { name: "Unlimited Products per Store", included: true },
      { name: "Unlimited Shop Attendants", included: true },
      { name: "Unlimited AI Stock Recommendations", included: true },
      { name: "POS Device Support", included: true },
      { name: "Auto Stock Updates", included: true },
      { name: "Invoice Generation", included: true },
      { name: "Priority Support", included: true },
      { name: "Custom Integrations", included: true },
    ],
    buttonText: "Contact Sales",
    borderColor: "border-[#FF540B]",
    bgColor: "bg-[#FFF0F0]",
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchPricingPlans(
        localStorage.getItem("authToken") || "",
      );

      if (response.statusCode === 200 && response.data) {
        const sortedPlans = response.data.sort((a, b) => {
          const order: { [key: string]: number } = {
            starter: 1,
            smart: 2,
            pro: 3,
          };
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aOrder = Object.keys(order).find((key) => aName.includes(key));
          const bOrder = Object.keys(order).find((key) => bName.includes(key));
          return (
            (aOrder ? order[aOrder] : 999) - (bOrder ? order[bOrder] : 999)
          );
        });

        const apiPlans = sortedPlans.map(transformPlanToDisplay);
        setPlans(apiPlans);
      } else {
        setError("Failed to load pricing plans. Please try again.");
        toast.error("Failed to load pricing plans");
      }
    } catch (err) {
      console.error("Error loading plans:", err);
      setError("Failed to load pricing plans. Please check your connection.");
      toast.error("Failed to load pricing plans. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleRetry = () => {
    loadPlans();
  };

  const handlePlanSelect = (plan: DisplayPlan) => {
    // If Enterprise is selected → navigate to contact us
    if (plan.id === "enterprise" || plan.name.toLowerCase() === "enterprise") {
      router.push("/contact-us"); // ← change to your actual contact page route
      return;
    }

    // Normal flow for other plans
    setSelectedPlan(plan);
    setStep(2);
  };

  const handleConfirmPlan = (
    annualBilling: boolean,
    numberOfMonths: number,
  ) => {
    setIsAnnual(annualBilling);
    setMonths(numberOfMonths);
    setStep(3);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const allPlans = [...plans, enterprisePlan];

  // Skeleton loader component
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 lg:gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border-2 border-gray-200 bg-gray-50 rounded-2xl p-3 flex flex-col h-full animate-pulse"
        >
          <div className="mb-2 lg:mb-6">
            <div className="h-8 w-3/5 bg-gray-300 rounded mb-2"></div>
            <div className="h-5 w-full bg-gray-200 rounded mb-4"></div>
            <div className="h-8 w-1/2 bg-gray-300 rounded"></div>
          </div>
          <div className="flex-1 mb-6 space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-start gap-1">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="h-5 w-4/5 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-12 w-full bg-gray-300 rounded-lg"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="">
        {step === 1 && (
          <>
            {loading ? (
              <SkeletonGrid />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <p className="text-red-600 text-center text-lg font-medium">
                  {error}
                </p>
                <Button
                  onClick={handleRetry}
                  className="bg-[#0A6DC0] hover:bg-[#09599a] text-white px-6 py-3 rounded-lg"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <PlansSelection
                plans={allPlans}
                loading={false}
                onSelectPlan={handlePlanSelect}
              />
            )}
          </>
        )}

        {step === 2 && selectedPlan && (
          <PlanConfirmation
            plan={selectedPlan}
            onConfirm={handleConfirmPlan}
            onBack={handleBack}
          />
        )}

        {step === 3 && selectedPlan && (
          <PaymentInfo
            plan={selectedPlan}
            isAnnual={isAnnual}
            months={months}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default Subscription;
