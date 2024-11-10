import React from "react";
import { IoWarningOutline } from "react-icons/io5";
import { Button } from "./button";

export const WarningAlert = () => {
  return (
    <div className="flex items-center bg-lighter-yellow border-2 border-light-yellow py-3 px-5 space-x-5">
      <div className="flex text-primary gap-1 items-center">
        <IoWarningOutline size={20} />
        <span className="font-semibold">Important:</span>
      </div>
      <p className="text-black">
        Click here to complete your business account setup
      </p>
      <Button className="w-fit h-10 justify-center items-center flex px-5 rounded-md">
        Complete profile{" "}
      </Button>
    </div>
  );
};
