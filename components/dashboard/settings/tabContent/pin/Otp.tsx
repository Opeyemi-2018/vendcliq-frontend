"use client";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/ui/PasswordInput";
import React, { useState } from "react";
import { IoIosLock } from "react-icons/io";

export const Otp = ({
  goNext,
  goBack,
}: {
  goNext: () => void;
  goBack: () => void;
}) => {
  const [newpassword, setNewPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  return (
    <div>
      <div className="mt-10 bg-white w-[600px] p-10 flex justify-center flex-col">
        <div className=" flex justify-center items-center mb-5">
          <div className="bg-light-gray p-3 rounded-full">
            <IoIosLock size={"24"} className=" text-black" />
          </div>
        </div>
        <p className="font-medium text-lg  font-clash border-l-4 border-primary pl-3 ">
          Create a personal four digit pin for your transaction
        </p>

        <div className="mb-5 mt-10 space-y-5">
          <PasswordInput
            disabled={true}
            label="New pin"
            placeholder="Enter new pin"
            value={newpassword}
            onChange={setNewPassword}
          />
          <PasswordInput
            disabled={true}
            label="Confirm new pin"
            placeholder="Confirm new pin"
            value={confirmpassword}
            onChange={setConfirmPassword}
          />
          <div className="pt-10 space-y-5">
            <p className="font-medium text-lg font-clash border-l-4 border-primary pl-3 ">
              Enter OTP sent to your phone 0803****098
            </p>
            <div>
              <PasswordInput
                label="Enter OTP code"
                placeholder="Confirm new pin"
                value={otp}
                onChange={setOtp}
              />
              <p></p>
            </div>
          </div>
        </div>
        <div className="flex mt-10 gap-5 justify-end">
          <Button
            onClick={goBack}
            className="bg-inherit text-primary hover:bg-light-gray border border-primary rounded-none"
          >
            Cancel
          </Button>
          <Button onClick={goNext} className="rounded-none text-black">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
