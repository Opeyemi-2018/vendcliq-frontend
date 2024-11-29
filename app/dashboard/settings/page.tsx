"use client";

import { BusinessProfile } from "@/components/dashboard/settings/tabContent/BusinessProfile";
import { Password } from "@/components/dashboard/settings/tabContent/Password";
import { PersonalProfile } from "@/components/dashboard/settings/tabContent/PersonalProfile";
import { CreatePin } from "@/components/dashboard/settings/tabContent/pin/CreatePin";
import { Otp } from "@/components/dashboard/settings/tabContent/pin/Otp";
import { VerifyBankAccount } from "@/components/dashboard/settings/tabContent/VerifyBankAccount";
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
      className="data-[state=active]:border-b-2 data-[state=active]:border-[#39498C] pb-1 data-[state=active]:text-[#39498C] text-black rounded-none shadow-none text-sm sm:text-base"
      value={value}
    >
      {children}
    </TabsTrigger>
  );

  return (
    <div className="h-screen">
      <div className="py-5 px-5 sm:px-10 space-y-5 h-full">
        <PageTitle className="border-b border-border" title="Settings" />
        <div className="font-sans">
          <Tabs defaultValue="business" className="w-full py-5">
            <TabsList className="w-full bg-inherit">
              <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-5 border-b border-border font-medium w-full justify-center sm:justify-start">
                <TabTrigger value="business">Business Profile</TabTrigger>
                <TabTrigger value="personal">Personal Profile</TabTrigger>
                <TabTrigger value="password">Password</TabTrigger>
                <TabTrigger value="pin">Pin</TabTrigger>
                <TabTrigger value="bank">Bank Account</TabTrigger>
              </div>
            </TabsList>

            <TabsContent value="business">
              <div className="p-3 sm:p-5">
                <BusinessProfile />
              </div>
            </TabsContent>
            <TabsContent value="personal">
              <div className="p-3 sm:p-5">
                <PersonalProfile />
              </div>
            </TabsContent>
            <TabsContent value="password">
              <div className="p-3 sm:p-5">
                <Password />
              </div>
            </TabsContent>
            <TabsContent value="pin">
              <div className="p-3 sm:p-5">
                {transferScreen === "create" && (
                  <CreatePin goNext={handleNext} />
                )}
                {transferScreen === "otp" && (
                  <Otp goNext={handleNext} goBack={handleBack} />
                )}
              </div>
            </TabsContent>
            <TabsContent value="bank">
              <div className="p-3 sm:p-5">
                <VerifyBankAccount />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
