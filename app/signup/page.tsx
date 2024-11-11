"use client";
import SignupStepOne from "@/components/onboarding/signup/steps/Step1";
import SignupStepTwo from "@/components/onboarding/signup/steps/Step2";
import SignupStepThree from "@/components/onboarding/signup/steps/Step3";
import SignupStepFour from "@/components/onboarding/signup/steps/Step4";
import SignupStepFive from "@/components/onboarding/signup/steps/Step5";
import { Progress } from "@/components/ui/Progress";
import React, { useState } from "react";

const Page = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(step + 1);
  // const prevStep = () => setStep(step - 1);

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-xl h-full mt-40">
        <Progress className="border border-border" value={step * 20} />
        <div className="bg-white w-full rounded-lg p-10 mt-5">
          {step === 1 && (
            <SignupStepOne
              title="What type of business do you operate?"
              nextStep={nextStep}
            />
          )}
          {step === 2 && (
            <SignupStepTwo title="Confirm your details" nextStep={nextStep} />
          )}
          {step === 3 && (
            <SignupStepThree title="Confirm your email" nextStep={nextStep} />
          )}
          {step === 4 && (
            <SignupStepFour title="Confirm phone number" nextStep={nextStep} />
          )}
          {step === 5 && (
            <SignupStepFive title="Confirm phone number" nextStep={nextStep} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
