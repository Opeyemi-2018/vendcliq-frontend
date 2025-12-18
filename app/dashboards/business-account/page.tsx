"use client";

import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import Step1 from "./chunks/Step1";
import Step2 from "./chunks/Step2";
import Step3 from "./chunks/Step3";
import Step4 from "./chunks/Step4";
import Step5 from "./chunks/Step5";

interface CacFormData {
  isRegistered: "register" | "notRegistered";
  cacNumber: string;
  cacApplicationDocumentsImage?: File | null;
  memartImage?: File | null;
}

interface SavedProgress {
  step: number;
  phoneNumbers: {
    phoneNumber1: string;
    phoneNumber2: string | null;
  };
  cacData: {
    isRegistered: "register" | "notRegistered";
    cacNumber: string;
  } | null;
}

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [phoneNumbers, setPhoneNumbers] = useState<{
    phoneNumber1: string;
    phoneNumber2: string | null;
  }>({
    phoneNumber1: "",
    phoneNumber2: null,
  });

  const [cacFiles, setCacFiles] = useState<{
    cacApplicationDocumentsImage: File | null;
    memartImage: File | null;
  }>({
    cacApplicationDocumentsImage: null,
    memartImage: null,
  });

  const [cacInfo, setCacInfo] = useState<{
    isRegistered: "register" | "notRegistered";
    cacNumber: string;
  } | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("businessSignupProgress");
      if (saved) {
        const parsed: SavedProgress = JSON.parse(saved);
        setStep(parsed.step || 1);
        setPhoneNumbers({
          phoneNumber1: parsed.phoneNumbers?.phoneNumber1 || "",
          phoneNumber2: parsed.phoneNumbers?.phoneNumber2 || null,
        });
        setCacInfo(parsed.cacData);
      }
    } catch (error) {
      console.error("Failed to restore progress:", error);
      localStorage.removeItem("businessSignupProgress"); 
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const toSave: SavedProgress = {
      step,
      phoneNumbers,
      cacData: cacInfo,
    };

    try {
      localStorage.setItem("businessSignupProgress", JSON.stringify(toSave));
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }, [step, phoneNumbers, cacInfo, isInitialized]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleStep1Complete = (phones: {
    phoneNumber1: string;
    phoneNumber2: string | null;
  }) => {
    setPhoneNumbers(phones);
    nextStep();
  };

  const handleStep4Complete = (data: CacFormData) => {
    setCacInfo({
      isRegistered: data.isRegistered,
      cacNumber: data.cacNumber,
    });
    setCacFiles({
      cacApplicationDocumentsImage: data.cacApplicationDocumentsImage || null,
      memartImage: data.memartImage || null,
    });
    nextStep();
  };

  const getCacData = (): CacFormData | null => {
    if (!cacInfo) return null;
    return {
      ...cacInfo,
      cacApplicationDocumentsImage: cacFiles.cacApplicationDocumentsImage,
      memartImage: cacFiles.memartImage,
    };
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A6DC0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" richColors />

      <div>
        <h1 className="text-[#2F2F2F] font-semibold font-clash text-[20px] md:text-[25px]">
          Create Business Account
        </h1>
        <p className="text-[#9E9A9A] font-dm-sans text-[16px] font-medium">
          Complete the information below to create a business account
        </p>
      </div>

      <div className="bg-white rounded-2xl px-4 lg:px-8 py-8 mt-10">
        {step === 1 && <Step1 onNext={handleStep1Complete} onPrev={prevStep} />}
        {step === 2 && (
          <Step2
            onNext={nextStep}
            onPrev={prevStep}
            phoneNumbers={phoneNumbers}
          />
        )}
        {step === 3 && <Step3 onNext={nextStep} onPrev={prevStep} />}
        {step === 4 && <Step4 onNext={handleStep4Complete} onPrev={prevStep} />}
        {step === 5 && (
          <Step5 onNext={nextStep} onPrev={prevStep} cacData={getCacData()} />
        )}
      </div>
    </div>
  );
}
