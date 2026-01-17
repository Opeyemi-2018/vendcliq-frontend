"use client";

import React from "react";
import { useUser } from "@/context/userContext";
import { CheckCircle2, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const BusinessVerification = () => {
  const { verificationStatus, getVerificationProgress } = useUser();
  const progress = getVerificationProgress();
  const router = useRouter();

  const verificationSteps = [
    {
      id: "bvn",
      title: "BVN Verification",
      isCompleted: verificationStatus?.bvn.isVerified || false,
    },
    {
      id: "documents",
      title: "Business Document Verification",
      isCompleted: verificationStatus?.documents.hasAnyDocument || false,
    },
  ];

  return (
    <div className="">
      <div className="mb-4">
        <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
          Business Verification{" "}
        </h1>
        <Separator
          orientation="horizontal"
          className="h-[1px] mt-3"
          style={{ background: "#E0E0E0" }}
        />
        <p className="text-[16px] font-dm-sans text-[#9E9A9A]">
          Complete verification to activate your account and unlock full app
          features.
        </p>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#0A6DC0]  font-bold font-dm-sans text-[16px]">
            {progress.percentage}% to complete
          </span>
          <span className="text-sm text-[#2F2F2F] font-dm-sans text-[16px]">
            You've completed <strong>{progress.completed}</strong> of{" "}
            <strong>{progress.total}</strong> verification steps
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-[#0A6DC0] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Verification Steps */}
      <div className="space-y-3">
        {verificationSteps.map((step) => (
          <div
            key={step.id}
            className="flex items-center justify-between p-4 border border-[#E3E3E3] rounded-lg"
          >
            <span className="text-[#2F2F2F] font-dm-sans font-medium">
              {step.title}
            </span>
            {step.isCompleted ? (
              <div className="flex items-center  rounded-full px-2 py-1 gap-2 bg-[#E7F4EB]">
                <span className="w-2 h-2 bg-[#00C53A] rounded-full"></span>
                <span className="text-[12px] font-dm-sans font-bold ">
                  Completed
                </span>
              </div>
            ) : (
              <div className="flex items-center  rounded-full px-2 py-1 gap-2 bg-[#FFF8E9]">
                <span className="w-2 h-2 bg-[#BE8C12] rounded-full"></span>
                <span className="text-[12px] text-[#BE8C12] font-dm-sans font-bold ">
                  Completed
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Document Details (Optional - shows what documents are submitted) */}
      {verificationStatus?.documents.hasAnyDocument && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">
            Submitted Documents
          </h3>
          <div className="space-y-2 text-sm">
            {verificationStatus.documents.nin.submitted && (
              <div className="flex items-center justify-between">
                <span className="text-blue-800">National ID (NIN)</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            )}
            {verificationStatus.documents.votersCard.submitted && (
              <div className="flex items-center justify-between">
                <span className="text-blue-800">Voter's Card</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            )}
            {verificationStatus.documents.driversLicense.submitted && (
              <div className="flex items-center justify-between">
                <span className="text-blue-800">Driver's License</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            )}
            {verificationStatus.documents.internationalPassport.submitted && (
              <div className="flex items-center justify-between">
                <span className="text-blue-800">International Passport</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* BVN Details (Optional) */}
      {verificationStatus?.bvn.isVerified && verificationStatus.bvn.value && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-semibold text-green-900 mb-1">
            BVN Verified
          </h3>
          <p className="text-xs text-green-700">
            BVN: {verificationStatus.bvn.value.replace(/(\d{3})(?=\d)/g, "$1-")}
          </p>
        </div>
      )}

      {/* Action Button */}
      {progress.percentage < 100 && (
        <Button
          onClick={() => router.push("/dashboards/business-account")}
          className="w-full mt-6 bg-[#0A6DC0] hover:bg-[#09599a]  py-5 md:py-6 transition"
        >
          Complete Verification
        </Button>
      )}
    </div>
  );
};

export default BusinessVerification;
