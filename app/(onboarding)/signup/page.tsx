

"use client";

import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import Step1 from "./components/step1";
import Step2 from "./components/step2";
import Step3 from "./components/step3";
import Step4 from "./components/step4";
import Step5 from "./components/step5";
import Step6 from "./components/step6";
import Step7 from "./components/step7";
import Step8 from "./components/step8";
import Step9 from "./components/step9";

export type FormData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  referralCode?: string;
  verificationCode?: string;
  phone?: string;
  isWhatsappNo?: "true" | "false";
  phoneVerificationCode?: string;
  password?: string;
  confirmPassword?: string;
  accountType?: "DISTRIBUTOR" | "WHOLESALER" | "RETAILER";
  businessName?: string;
  businessAddress?: string;
  uploadedLogo?: File | null;
  uploadedLogoPreview?: string | null;
  companyGoal?: "Fast Sales" | "Higher Profit";
};

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>({});

  

  // On mount, restore progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("signupFormData");
    const savedStep = localStorage.getItem("signupStep");

    if (savedData && savedStep) {
      try {
        const parsedData = JSON.parse(savedData);
        const parsedStep = parseInt(savedStep);

        setData(parsedData);
        setStep(parsedStep);
      } catch (e) {
        console.error("Failed to restore signup progress");
      }
    }
  }, []);

  // Save to localStorage every time step or data changes
  useEffect(() => {
    localStorage.setItem("signupFormData", JSON.stringify(data));
    localStorage.setItem("signupStep", step.toString());
  }, [step, data]);

  const next = (newData: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...newData }));
    setStep((s) => s + 1);
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
    9: <Step9 data={data} />,
  };

  return (
    <div className="w-full lg:max-w-[40rem] mx-auto py-8 px-3 lg:px-10 xl:px-24">
      <Toaster position="top-center" richColors />
      {steps[step as keyof typeof steps]}
    </div>
  );
}
