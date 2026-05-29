"use client";

import { useState } from "react";
import {
  Lock,
  CreditCard,
  User,
  FileText,
  Headphones,
  FileCheck,
  ChevronRight,
} from "lucide-react";

// Import your chunk components
import ChangePassword from "./chunks/ChangePassword";
import ChangeTransactionPin from "./chunks/ChangeTransactionPin";
import AttendantPermission from "./chunks/AttendantPermission";
import BusinessVerification from "./chunks/BusinessVerification";
import CustomerSupport from "./chunks/CustomerSupport";
import TermsOfService from "./chunks/TermsOfService";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/userContext";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("changePassword");
  const { isAttendant } = useUser();

  const menuItems = [
    { id: "changePassword", label: "Change Password", icon: Lock },

    ...(isAttendant
      ? []
      : [
          {
            id: "changeTransactionPin",
            label: "Change Transaction Pin",
            icon: CreditCard,
          },
          {
            id: "attendantPermission",
            label: "Attendant Permission",
            icon: User,
          },
          {
            id: "businessVerification",
            label: "Business Verification",
            icon: FileText,
          },
        ]),
    { id: "customerSupport", label: "Customer Support", icon: Headphones },
    { id: "termsOfService", label: "Terms of Service", icon: FileCheck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "changePassword":
        return <ChangePassword />;

      case "changeTransactionPin":
        return <ChangeTransactionPin />;

      case "attendantPermission":
        return <AttendantPermission />;

      case "businessVerification":
        return <BusinessVerification />;

      case "customerSupport":
        return <CustomerSupport />;

      case "termsOfService":
        return <TermsOfService />;

      default:
        return <ChangePassword />;
    }
  };

  return (
    <div className="">
      <h1 className="text-[20px] md:text-[25px] text-[#2F2F2F] font-bold font-clash">
        Profile Settings
      </h1>
      <p className="text-[14px] md:text-[16px] font-medium text-[#9E9A9A] font-dm-sans ">
        Make change and set your account preferences
      </p>

      <div className="mt-3 md:mt-6">
        <div className="border-b  md:hidden block  border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide space-x-6 md:space-x-10">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative pb-4 pt-2 px-1 flex items-center gap-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-[#0A6DC0] font-medium"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="text-sm md:text-base">{item.label}</span>

                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0A6DC0] rounded-t-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:mt-6">
          <Card className="hidden h-full md:block py-6 md:px-7 w-full md:w-[35%] bg-white">
            <div className="mb-4">
              <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
                Settings Options
              </h1>
              <Separator
                orientation="horizontal"
                className="h-[1px] mt-3"
                style={{ background: "#E0E0E0" }}
              />
            </div>
            <div className="space-y-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 md:py-4 rounded-lg transition ${
                      isActive
                        ? "bg-[#0A6DC012] border border-[#0A6DC0] text-[#2F2F2F]"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Content Area */}
          <Card className="w-full md:w-[65%] py-6 md:px-7">
            {renderContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
