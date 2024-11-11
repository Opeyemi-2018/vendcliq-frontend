"use client";

import { BusinessProfile } from "@/components/dashboard/settings/tabContent/BusinessProfile";
import { Password } from "@/components/dashboard/settings/tabContent/Password";
import { PersonalProfile } from "@/components/dashboard/settings/tabContent/PersonalProfile";
import { CreatePin } from "@/components/dashboard/settings/tabContent/pin/CreatePin";
import { Otp } from "@/components/dashboard/settings/tabContent/pin/Otp";
import { PageTitle } from "@/components/ui/pageTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";

const Settings = () => {
  const [transferScreen, setTransferScreen] = useState("create");

  const handleNext = () => {
    if (transferScreen === "create") {
      setTransferScreen("otp");
    }
  };

  const handleBack = () => {
    if (transferScreen === "otp") {
      setTransferScreen("create");
    }
  };

  const TabTrigger = ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => (
    <TabsTrigger
      className="data-[state=active]:border-b-2 data-[state=active]:border-[#39498C] pb-1 data-[state=active]:text-[#39498C] text-black rounded-none shadow-none"
      value={value}
    >
      {children}
    </TabsTrigger>
  );

  return (
    <div className="h-screen">
      <div className="py-5 px-10 space-y-5 h-full">
        <PageTitle className="border-b border-border" title="Settings" />
        <div className="font-sans">
          <Tabs defaultValue="business" className="w-full py-5">
            <TabsList className="w-full bg-inherit">
              <div className="flex gap-5 border-b border-border font-medium w-full">
                <TabTrigger value="business">Business Profile</TabTrigger>
                <TabTrigger value="personal">Personal Profile</TabTrigger>
                <TabTrigger value="password">Password</TabTrigger>
                <TabTrigger value="pin">Pin</TabTrigger>
              </div>
            </TabsList>

            <TabsContent value="business">
              <BusinessProfile />
            </TabsContent>
            <TabsContent value="personal">
              <PersonalProfile />
            </TabsContent>
            <TabsContent value="password">
              <Password />
            </TabsContent>

            <TabsContent value="pin">
              {transferScreen === "create" && <CreatePin goNext={handleNext} />}

              {transferScreen === "otp" && (
                <Otp goNext={handleNext} goBack={handleBack} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
