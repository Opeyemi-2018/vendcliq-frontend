// app/(onboarding)/signup/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { SignupFormData } from "@/types/auth";
import Step1 from "./components/step1";
import Step2 from "./components/step2";
import Step3 from "./components/step3";
import Step4 from "./components/step4";
import Step5 from "./components/step5";
import Step6 from "./components/step6";
import Step7 from "./components/step7";
import Step8 from "./components/step8";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SignupFormData>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const isRestoredSession = useRef(false);

  // Restore progress on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("signupFormData");
      const savedStep = localStorage.getItem("signupStep");
      const accessToken = localStorage.getItem("accessToken");
      const authToken = localStorage.getItem("authToken");

      if (savedData && savedStep) {
        const parsedData = JSON.parse(savedData);
        const stepNum = parseInt(savedStep, 10);

        setData(parsedData);

        // If step is 1 or 2 (before signup API), restore without checking tokens
        if (stepNum <= 2) {
          setStep(stepNum);
          isRestoredSession.current = true;
        }
        // If step is 3+ (after signup API), only restore if tokens exist
        else if (stepNum >= 3 && (accessToken || authToken)) {
          setStep(stepNum);
          isRestoredSession.current = true;
        }
        // Otherwise start from step 1
        else {
          setStep(1);
          isRestoredSession.current = false;
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error restoring signup progress:", error);
      setIsInitialized(true);
    }
  }, []);

  // Only save to localStorage after initialization
  useEffect(() => {
    if (
      isInitialized &&
      (isRestoredSession.current || step !== 1 || Object.keys(data).length > 0)
    ) {
      try {
        localStorage.setItem("signupFormData", JSON.stringify(data));
        localStorage.setItem("signupStep", step.toString());
      } catch (error) {
        console.error("Error saving signup progress:", error);
      }
    }
  }, [step, data, isInitialized]);

  const next = (newData: Partial<SignupFormData>) => {
    setData((prev) => ({ ...prev, ...newData }));

    if (step === 8) {
      // Final step → go to congrats page (handled in Step8 component)
      // Clear signup progress is done in Step8 after API success
      return;
    } else {
      setStep((s) => s + 1);
    }
  };

  const prev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const steps = {
    1: <Step1 onNext={next} data={data} />,
    2: <Step2 onNext={next} onPrev={prev} data={data} />,
    3: <Step3 onNext={next} data={data} />,
    4: <Step4 onNext={next} data={data} />,
    5: <Step5 onNext={next} data={data} />,
    6: <Step6 onNext={next} data={data} />,
    7: <Step7 onNext={next} data={data} />,
    8: <Step8 onNext={next} data={data} />,
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="w-full py-8 px-3 lg:px-10 xl:px-24">
        <div className="mx-auto lg:max-w-[40rem] w-full flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A6DC0]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-3 lg:px-10 xl:px-24">
      <Toaster position="top-center" richColors />
      <div className="mx-auto lg:max-w-[40rem] w-full">
        {steps[step as keyof typeof steps]}
      </div>
    </div>
  );
}