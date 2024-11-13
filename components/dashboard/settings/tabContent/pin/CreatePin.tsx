"use client";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/ui/PasswordInput";
import React, { useState } from "react";
import { IoIosLock } from "react-icons/io";

export const CreatePin = ({ goNext }: { goNext: () => void }) => {
  const [newpassword, setNewPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");

  return (
    <div className="flex">
      <div className="md:mt-0 mt-10 bg-white w-full max-w-[600px] p-5 sm:p-10 flex flex-col">
        <div className="flex justify-center items-center mb-5">
          <div className="bg-light-gray p-3 rounded-full">
            <IoIosLock size={"24"} className="text-black" />
          </div>
        </div>
        <p className="font-medium text-lg font-clash border-l-4 border-primary pl-3">
          Create a personal four-digit pin for your transaction
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
        </div>

        <div className="flex mt-10 gap-5 justify-end">
          <Button onClick={goNext} className="rounded-none text-black">
            Create Pin
          </Button>
        </div>
      </div>
    </div>
  );
};
