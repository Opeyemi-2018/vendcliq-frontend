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
  const router = useRouter();

  // restore progress
  useEffect(() => {
    const savedData = localStorage.getItem("signupFormData");
    const savedStep = localStorage.getItem("signupStep");
    if (savedData && savedStep) {
      setData(JSON.parse(savedData));
      setStep(parseInt(savedStep, 10));
    }
  }, []);

  // save progress
  useEffect(() => {
    localStorage.setItem("signupFormData", JSON.stringify(data));
    localStorage.setItem("signupStep", step.toString());
  }, [step, data]);

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

  return (
    <div className="w-full py-8 px-3 lg:px-10 xl:px-24">
      <Toaster position="top-center" richColors />
      <div className="mx6-auto lg:max-w-[40rem] w-full">
        {steps[step as keyof typeof steps]}
      </div>
    </div>
  );
}