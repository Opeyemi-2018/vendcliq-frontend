"use client";
import { ActiveAccountDashboard } from "@/components/dashboard/home/active/ActiveAccountDashboard";
import { PendingAccountDashboard } from "@/components/dashboard/home/pending";
import React, { useState } from "react";

const page = () => {
  const [isFinishedSetup] = useState(true);
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

export default page;
