"use client";
import { ActiveAccountDashboard } from "@/components/dashboard/home/active/ActiveAccountDashboard";
import { PendingAccountDashboard } from "@/components/dashboard/home/pending";
import { handleGetDashboard } from "@/lib/utils/api/apiHelper";
import { ClipLoader } from "react-spinners";
import React, { useState, useEffect } from "react";

const Page = () => {
  const [isFinishedSetup, setIsFinishedSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await handleGetDashboard();
        const profileCompletionStep = response.data.business.status;
        const isComplete =
          profileCompletionStep === "ACTIVATED" ||
          response.data.account.status === "ACTIVE";

        setIsFinishedSetup(isComplete);
        console.log("isComplete>>>>>", isComplete);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setIsFinishedSetup(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistrationStatus();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      setIsLoading(true);
      setIsFinishedSetup(null);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#000" size={50} />
      </div>
    );
  }

  return (
    <div>
      {isFinishedSetup === true ? (
        <ActiveAccountDashboard />
      ) : (
        <PendingAccountDashboard />
      )}
    </div>
  );
};

export default Page;
