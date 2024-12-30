"use client";
import SignupStepOne from "@/components/onboarding/signup/steps/Step1";
import SignupStepTwo from "@/components/onboarding/signup/steps/Step2";
import SignupStepThree from "@/components/onboarding/signup/steps/Step3";
import SignupStepFour from "@/components/onboarding/signup/steps/Step4";
import SignupStepFive from "@/components/onboarding/signup/steps/Step5";
import { Progress } from "@/components/ui/Progress";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const SignupContent = () => {
  const searchParams = useSearchParams();
  const stepParam = searchParams?.get("step") ?? null;
  const [step, setStep] = useState(stepParam ? parseInt(stepParam) : 1);
  const [signupData, setSignupData] = useState({ businessType: "" });

  const nextStep = (data?: object) => {
    if (data) {
      setSignupData({ ...signupData, ...data });
    }
    setStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-xl h-full p-5 md:p-0 mt-40">
        <Progress className="border border-border" value={step * 20} />
        <div className=" md:bg-white w-full rounded-lg md:p-10 p-0 mt-5">
          {step === 1 && (
            <SignupStepOne
              title="What type of business do you operate?"
              nextStep={nextStep}
            />
          )}
          {step === 2 && (
            <SignupStepTwo
              title="Confirm your details"
              nextStep={nextStep}
              previousData={signupData}
              prevStep={prevStep}
            />
          )}
          {step === 3 && (
            <SignupStepThree
              title="Confirm your email"
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {step === 4 && (
            <SignupStepFour
              title="Confirm phone number"
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {step === 5 && (
            <SignupStepFive
              title="Confirm phone number"
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
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
