"use client";

import { useState } from "react";
import Step1 from "./components/step1";
import Step2 from "./components/step2";
import Step3 from "./components/step3";
import Step4 from "./components/step4";
import Step5 from "./components/step5";
import Step6 from "./components/step6";
import Step7 from "./components/step7";

interface FormData {
  // Step 1
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  phoneCode: string;
  businessAddress: string;
  proofOfAddress: File | null;

  // Step 2
  fullAddress: string;
  city: string;
  state: string;
  postalCode: string;

  // Step 3
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;

  // Step 4
  businessProofDoc: File | null;

  // Step 5
  cacDocument: File | null;

  // Step 6
  registrationNumber: string;
  dateOfIncorporation: string;
  businessType: string;

  // Step 7
  shareholders: Array<{
    name: string;
    percentage: number;
    email: string;
  }>;
}

export default function KYCPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    phoneCode: "+234",
    businessAddress: "",
    proofOfAddress: null,
    fullAddress: "",
    city: "",
    state: "",
    postalCode: "",
    contactPersonName: "",
    contactEmail: "",
    contactPhone: "",
    businessProofDoc: null,
    cacDocument: null,
    registrationNumber: "",
    dateOfIncorporation: "",
    businessType: "",
    shareholders: [],
  });

  const steps = [
    { id: 1, title: "Business Information" },
    { id: 2, title: "Business Address" },
    { id: 3, title: "Business Contact Information" },
    { id: 4, title: "Upload Proof" },
    { id: 5, title: "Upload CAC" },
    { id: 6, title: "Company Information" },
    { id: 7, title: "Shareholders Information" },
  ];

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSave = () => {
    console.log("Form Data:", formData);
    alert("Form saved successfully!");
    // Here you would typically send data to your API
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2 formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3 formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4 formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5 formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Step6 formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <Step7 formData={formData} updateFormData={updateFormData} />;
      default:
        return <Step1 formData={formData} updateFormData={updateFormData} />;
    }
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-120px)]">
      {/* Left Sidebar - Steps */}
      <div className="bg-white rounded-lg p-8  shadow-sm">
        <h2 className="text-[16px] text-[#2F2F2F] font-semibold mb-8">
          Registration Steps
        </h2>
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 cursor-pointer text-[16px] font-medium transition-all ${
                currentStep === step.id ? "text-[#0A6DC0]" : "text-[#000000]"
              }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                  currentStep === step.id
                    ? "bg-blue-50 border-[#0A6DC0] text-[#0A6DC0]"
                    : "bg-[#E7EBED] border-[#A2A2A2] text-gray-500"
                }`}
              >
                {step.id}
              </div>
              <span className="font-medium">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-white  rounded-lg  p-10 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Complete account setup</h2>
        <p className="text-gray-500 mb-8">Kindly enter your business details</p>

        {renderStep()}

        <button
          onClick={handleSave}
          className="w-full mt-8 bg-[#0A6DC0] text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}
