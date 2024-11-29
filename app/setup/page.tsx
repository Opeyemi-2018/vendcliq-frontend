"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Field from "@/components/ui/Field";
import { FileUpload } from "@/components/ui/Fileupload";
import MultiValueInput from "@/components/ui/MultiValueInput";
import {
  handleIdentityUpload,
  handleBusinessSetup,
  handleBusinessSetupStepTwo,
} from "@/services/setup/Setup";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";

interface Shareholder {
  firstname: string;
  lastname: string;
  gender: string;
  date_of_birth: string;
  phone: string;
  bank_verification_number: string;
}

interface IdentityPayload {
  file: File | null;
}

interface StepOnePayload {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessProofOfAddress: File | null;
}

interface StepTwoPayload {
  rcNumber: string;
  dateOfIncorporation: string;
  shareholders: Shareholder[];
  businessCACCertificate: File | null;
  businessMemoOfAssociation: File | null;
}

const steps = ["Upload Identity", "Business Information", "Upload CAC"];

const AccountSetup = () => {
  const router = useRouter();

  const [identityPayload, setIdentityPayload] = useState<IdentityPayload>({
    file: null,
  });

  const [stepOnePayload, setStepOnePayload] = useState<StepOnePayload>({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    businessProofOfAddress: null as File | null,
  });

  const [stepTwoPayload, setStepTwoPayload] = useState<StepTwoPayload>({
    rcNumber: "",
    dateOfIncorporation: "",
    shareholders: [
      {
        firstname: "",
        lastname: "",
        gender: "",
        date_of_birth: "",
        phone: "",
        bank_verification_number: "",
      },
    ],
    businessCACCertificate: null,
    businessMemoOfAssociation: null,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    if (currentStep === 0) {
      console.log("file", identityPayload.file);
      if (identityPayload.file) {
        formData.append("file", identityPayload.file);
        console.log("identityPayload", identityPayload.file);
      }
      const response = await handleIdentityUpload({
        file: identityPayload.file,
      });
      console.log("Identity upload response", response);
      if (response.status === "success") handleNext();
    } else if (currentStep === 1) {
      formData.append("businessName", stepOnePayload.businessName);
      formData.append("businessEmail", stepOnePayload.businessEmail);
      formData.append("businessPhone", stepOnePayload.businessPhone);
      formData.append("businessAddress", stepOnePayload.businessAddress);
      if (stepOnePayload.businessProofOfAddress) {
        formData.append(
          "businessProofOfAddress",
          stepOnePayload.businessProofOfAddress
        );
      }
      const response = await handleBusinessSetup(formData);
      console.log("Business setup response", response);
      if (response.status === "success") handleNext();
    } else if (currentStep === 2) {
      formData.append("rcNumber", stepTwoPayload.rcNumber);
      formData.append(
        "dateOfIncorporation",
        stepTwoPayload.dateOfIncorporation
      );
      formData.append(
        "shareholders",
        JSON.stringify(stepTwoPayload.shareholders)
      );

      if (stepTwoPayload.businessCACCertificate) {
        formData.append(
          "businessCACCertificate",
          stepTwoPayload.businessCACCertificate
        );
      }
      if (stepTwoPayload.businessMemoOfAssociation) {
        formData.append(
          "businessMemoOfAssociation",
          stepTwoPayload.businessMemoOfAssociation
        );
      }
      // Log each key-value pair in formData
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log("jjjj");
      const response = await handleBusinessSetupStepTwo(formData);
      if (response.status === "success") {
        router.push("/dashboard/home");
      }
      console.log("Business setup step two response", response);
    }
  };

  const updatePayload = (
    key: keyof IdentityPayload | keyof StepOnePayload | keyof StepTwoPayload,
    value: any
  ) => {
    if (currentStep === 0) {
      setIdentityPayload({ ...identityPayload, [key]: value });
    } else if (currentStep === 1) {
      setStepOnePayload({ ...stepOnePayload, [key]: value });
    } else {
      setStepTwoPayload({ ...stepTwoPayload, [key]: value });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-[#F1F0EE] gap-5 py-5 px-4 lg:py-10 lg:px-20">
      {/* Left Form Area */}
      <div className="w-full lg:w-2/3 p-5 lg:p-10 bg-white rounded-lg">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 border-b pb-2">
          Complete Account Setup
        </h2>
        <p className="text-gray-600 mb-6 lg:mb-8 font-sans">
          {currentStep === 0
            ? "Please upload your identity document"
            : "Kindly enter your business details"}
        </p>

        {/* Step Form */}
        {currentStep === 0 && (
          <form className="grid grid-cols-1 gap-4 lg:gap-6 font-sans">
            <div className="col-span-1">
              <FileUpload
                id="identity-document"
                label="Upload Identity Document"
                accept=".png,.jpg,.jpeg,.pdf"
                maxSize={5 * 1024 * 1024} // 5MB
                onChange={(file) => updatePayload("file", file)}
                name="file"
              />
            </div>
          </form>
        )}

        {currentStep === 1 && (
          <form className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 font-sans">
            {[
              {
                label: "Business Name",
                type: "text",
                placeholder: "Enter name",
                value: stepOnePayload.businessName,
                key: "businessName",
              },
              {
                label: "Business Email",
                type: "email",
                placeholder: "Enter email",
                value: stepOnePayload.businessEmail,
                key: "businessEmail",
              },
              {
                label: "Business Phone Number",
                type: "text",
                placeholder: "Enter phone number",
                value: stepOnePayload.businessPhone,
                key: "businessPhone",
              },
              {
                label: "Business Address",
                type: "text",
                placeholder: "Enter address",
                value: stepOnePayload.businessAddress,
                key: "businessAddress",
              },
            ].map(({ label, type, placeholder, value, key }, index) => (
              <div key={index}>
                <Field
                  label={label}
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) =>
                    updatePayload(key as keyof StepOnePayload, e.target.value)
                  }
                />
              </div>
            ))}
            <div className="col-span-1 lg:col-span-2">
              <FileUpload
                id="business-proof-of-address"
                label="Attach Proof Of Address"
                accept=".png,.jpg,.jpeg,.pdf"
                maxSize={5 * 1024 * 1024} // 5MB
                onChange={(file) =>
                  updatePayload("businessProofOfAddress", file)
                }
              />
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 font-sans"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <Field
                label="RC Number"
                type="text"
                placeholder="Enter number"
                value={stepTwoPayload.rcNumber}
                onChange={(e) => updatePayload("rcNumber", e.target.value)}
              />
            </div>
            <div>
              <Field
                label="Date of Incorporation"
                type="date"
                value={stepTwoPayload.dateOfIncorporation}
                onChange={(e) =>
                  updatePayload("dateOfIncorporation", e.target.value)
                }
              />
            </div>
            <div className="col-span-1 lg:col-span-2">
              <MultiValueInput
                label="Add shareholders"
                onChange={(shareholders: Shareholder[]) =>
                  updatePayload(
                    "shareholders",
                    shareholders.map((shareholder) => ({
                      firstname: shareholder.firstname,
                      lastname: shareholder.lastname,
                      gender: shareholder.gender,
                      date_of_birth: shareholder.date_of_birth,
                      phone: shareholder.phone,
                      bank_verification_number:
                        shareholder.bank_verification_number,
                    }))
                  )
                }
              />
            </div>
            <div className="col-span-1 lg:col-span-2">
              <FileUpload
                id="business-cac-certificate"
                label="CAC Certificate"
                accept=".png,.jpg,.jpeg,.pdf"
                maxSize={5 * 1024 * 1024}
                onChange={(file) =>
                  updatePayload("businessCACCertificate", file)
                }
              />
            </div>
            <div className="col-span-1 lg:col-span-2">
              <FileUpload
                id="business-memo"
                label="Business Memo of Association"
                accept=".png,.jpg,.jpeg,.pdf"
                maxSize={5 * 1024 * 1024}
                onChange={(file) =>
                  updatePayload("businessMemoOfAssociation", file)
                }
              />
            </div>
          </form>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col lg:flex-row justify-between mt-6 lg:mt-8 gap-3 lg:gap-5">
          {currentStep > 0 && (
            <Button
              className="px-6 py-2 font-sans bg-gray-200 text-gray-700 rounded-none"
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          <Button
            className="px-6 py-2 w-full lg:w-auto font-sans bg-yellow-500 text-black rounded-none"
            onClick={handleSubmit}
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>

      {/* Right Steps Sidebar */}
      <div className="w-full lg:w-1/3 p-5 lg:p-10 mt-5 lg:mt-0 rounded-lg bg-white">
        <h3 className="text-lg font-semibold mb-4 lg:mb-6">
          Registration Steps
        </h3>
        <ol className="space-y-3 lg:space-y-4 font-sans">
          {steps.map((step, index) => (
            <li
              key={index}
              className={`flex items-center gap-3 ${
                index === currentStep ? "text-yellow-500 font-bold" : ""
              }`}
            >
              <span
                className={`flex items-center justify-center h-6 w-6 rounded-full border ${
                  index <= currentStep
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default AccountSetup;
