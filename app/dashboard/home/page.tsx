"use client";
import { ActiveAccountDashboard } from "@/components/dashboard/home/active/ActiveAccountDashboard";
import { PendingAccountDashboard } from "@/components/dashboard/home/pending";
import { handleGetDashboard } from "@/lib/utils/api/apiHelper";

import React, { useState, useEffect } from "react";

const Page = () => {
  const [isFinishedSetup, setIsFinishedSetup] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        console.log("checking registration status");
        const response = await handleGetDashboard();
        const profileCompletionStep =
          response.data.business.profileCompletionStep;
        const accountStatus = response.data.account.status;
        console.log(
          "checking registration status",
          profileCompletionStep,
          accountStatus
        );

        // Assuming final step is not "0" and account status is "ACTIVE"
        const isComplete =
          profileCompletionStep !== "0" &&
          response.data.account.status === "ACTIVE";

        setIsFinishedSetup(isComplete);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setIsFinishedSetup(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  if (isFinishedSetup === null) {
    return <div>Loading...</div>; // Or a loading spinner component
  }

  return (
    <div className="">
      {isFinishedSetup ? (
        <ActiveAccountDashboard />
      ) : (
        <PendingAccountDashboard />
      )}
    </div>
  );
};

export default Page;
