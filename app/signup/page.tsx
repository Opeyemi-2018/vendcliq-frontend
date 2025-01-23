"use client";
import SignupStepOne from "@/components/onboarding/signup/steps/Step1";
import SignupStepTwo from "@/components/onboarding/signup/steps/Step2";
import SignupStepThree from "@/components/onboarding/signup/steps/Step3";
import SignupStepFour from "@/components/onboarding/signup/steps/Step4";
import SignupStepFive from "@/components/onboarding/signup/steps/Step5";
import { Progress } from "@/components/ui/Progress";
import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const SignupContent = () => {
  const searchParams = useSearchParams();
  const step = searchParams?.get("step");
  const [signupData, setSignupData] = useState({ businessType: "" });
  const router = useRouter();

  const nextStep = (data?: object) => {
    if (data) {
      setSignupData({ ...signupData, ...data });
    }
    // Calculate next step number
    const currentStep = parseInt(step || "1");
    const nextStepNumber = currentStep + 1;
    // Navigate to next step
    router.push(`/signup?step=${nextStepNumber}`);
  };

  const prevStep = () => {
    // Implement logic to move to the previous step
  };

  const renderStep = () => {
    switch (step) {
      case "1":
        return (
          <SignupStepOne
            title="What type of business do you operate?"
            nextStep={nextStep}
          />
        );
      case "2":
        return (
          <SignupStepTwo
            title="Confirm your details"
            nextStep={nextStep}
            previousData={signupData}
            prevStep={prevStep}
          />
        );
      case "3":
        return (
          <SignupStepThree
            title="Confirm your email"
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case "4":
        return (
          <SignupStepFour
            title="Confirm phone number"
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case "5":
        return (
          <SignupStepFive
            title="Verify Phone Number"
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      default:
        return <div>Step 1</div>;
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-xl h-full p-5 md:p-0 mt-40">
        <Progress
          className="border border-border"
          value={step ? parseInt(step) * 20 : 0}
        />
        <div className=" md:bg-white w-full rounded-lg md:p-10 p-0 mt-5">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
};

export default Page;
