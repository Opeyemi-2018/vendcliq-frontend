"use client";

import { useState } from "react";
import AttendantSettings from "./chunks/AttendantSettings";
import StoreSettings from "./chunks/StoreSettings";

const TABS = [
  { id: "attendant", label: "Attendant Setting" },
  { id: "store", label: "Store Setting" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const BusinessSettings = () => {
  const [tab, setTab] = useState<TabId>("attendant");

  return (
    <div className="font-dm-sans text-[#2F2F2F] flex flex-col gap-5">
      <div>
        <span className="text-[12.5px] font-bold tracking-[.4px] uppercase text-[#8E8E93]">
          More
        </span>
        <h1 className="font-clash font-semibold text-[24px] md:text-[30px] tracking-[-.6px] mt-1.5 m-0">
          Business Settings
        </h1>
        <p className="text-[14.5px] text-[#8E8E93] mt-[5px] m-0">
          Control what your attendants can access and how each store runs.
        </p>
      </div>

      <div
        data-tour="page-tabs"
        className="flex gap-1 bg-[#F4F5F7] p-1 rounded-full self-stretch sm:self-start flex-nowrap"
      >
        {TABS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setTab(option.id)}
            className={`flex-1 sm:flex-none border-none px-[18px] min-h-[44px] rounded-full text-[13.5px] cursor-pointer whitespace-nowrap ${
              tab === option.id
                ? "bg-white text-[#0A6DC0] font-bold shadow-[0_1px_3px_rgba(0,0,0,.10)]"
                : "bg-transparent text-[#6B6B70] font-semibold hover:text-[#2F2F2F]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab === "attendant" ? <AttendantSettings /> : <StoreSettings />}
    </div>
  );
};

export default BusinessSettings;
