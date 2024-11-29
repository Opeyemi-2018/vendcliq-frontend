"use client";
import { ActiveAccountDashboard } from "@/components/dashboard/home/active/ActiveAccountDashboard";
import { PendingAccountDashboard } from "@/components/dashboard/home/pending";
import { fetcher } from "@/lib/utils/api/apiHelper";
import { GET_PROFILE } from "@/url/api-url";
import { jwtDecode } from "jwt-decode";
import { parseCookies } from "nookies";
import React, { useState, useEffect } from "react";

interface UserProfile {
  data: {
    business: {
      profileCompletionStep: string;
    };
    account: {
      status: string;
    };
  };
}

const Page = () => {
  const [isFinishedSetup, setIsFinishedSetup] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await fetcher<UserProfile>(GET_PROFILE);
        const data = response.data;
        console.log(data);

        // Assuming final step is not "0" and account status is "ACTIVE"
        const isComplete =
          data.business.profileCompletionStep !== "0" &&
          data.account.status === "ACTIVE";

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
