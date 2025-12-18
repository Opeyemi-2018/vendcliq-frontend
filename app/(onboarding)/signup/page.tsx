// app/(onboarding)/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SignupFormData>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Restore progress on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("signupFormData");
      const savedStep = localStorage.getItem("signupStep");
      const accessToken = localStorage.getItem("accessToken");
      const authToken = localStorage.getItem("authToken");

      // If user has completed Step 1 (has tokens) but browser closed
      if ((accessToken || authToken) && savedData) {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);

        // If savedStep exists and is > 1, continue from there
        if (savedStep) {
          const stepNum = parseInt(savedStep, 10);
          // Make sure we don't go back to step 1 if tokens exist
          setStep(stepNum > 1 ? stepNum : 2);
        } else {
          // No saved step but has token - start from step 2
          setStep(2);
        }
      } else if (savedData && savedStep) {
        // Normal restoration without tokens (user hasn't completed Step 1 yet)
        setData(JSON.parse(savedData));
        setStep(parseInt(savedStep, 10));
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error restoring signup progress:", error);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
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
      // Final step → go to thanks page
      router.push("/thanks");
    } else {
      setStep((s) => s + 1);
    }
  };

  const steps = {
    1: <Step1 onNext={next} data={data} />,
    2: <Step2 onNext={next} data={data} />,
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
