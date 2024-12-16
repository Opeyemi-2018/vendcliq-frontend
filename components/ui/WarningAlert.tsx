import React from "react";
import { IoWarningOutline } from "react-icons/io5";
import { Button } from "./button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const WarningAlert = () => {
  return (
    <div className="flex flex-col text-[14px] sm:flex-row items-center gap-5 w-full md:gap-10 bg-lighter-yellow border-2 font-sans border-light-yellow py-2 px-4 sm:px-5 space-y-3 sm:space-y-0">
      <div className="flex text-primary gap-1 items-center">
        <IoWarningOutline size={20} />
        <span className="font-[700]">Important:</span>
      </div>
      <p className="text-black text-center sm:text-left">
        Click here to complete your business account setup
      </p>
      <Link href="/dashboard/setup" className="w-full sm:w-auto">
        <Button className="w-full sm:w-fit h-8 justify-center items-center text-[#292826] font-[500] flex px-5 rounded-md">
          Complete profile
          <ArrowRight size={16} />
        </Button>
      </Link>
    </div>
  );
};
