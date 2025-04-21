"use client";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/ui/PasswordInput";
import { handleRequestPinToken } from "@/lib/utils/api/apiHelper";
import React, { useState } from "react";
import { IoIosLock } from "react-icons/io";
import { toast } from "react-toastify";

export const CreatePin = ({ goNext }: { goNext: () => void }) => {
  const [newpassword, setNewPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");

  const handleSubmitCreatePin = async () => {
    try {
      if (newpassword.length !== 4) {
        return toast.error("Pin must be exactly 4 digits");
      }

      if (!/^\d{4}$/.test(newpassword)) {
        return toast.error("Pin must contain only numbers");
      }

      // Additional PIN validation
      if (/(\d)\1{3}/.test(newpassword)) {
        return toast.error("PIN cannot contain repeated digits");
      }

      if (/^(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)$/.test(newpassword)) {
        return toast.error("PIN cannot be sequential numbers");
      }

      if (newpassword === confirmpassword) {
        // Store PIN values in localStorage for the next step
        localStorage.setItem("pin", newpassword);
        localStorage.setItem("confirmPin", confirmpassword);
        
        // Request PIN token
        const response = await handleRequestPinToken();
        
        if (response.status === "success") {
          toast.success("OTP sent successfully");
          goNext();
        }
      } else {
        return toast.error("Pin does not match");
      }
    } catch (error) {
      console.error("Error creating PIN:", error);
      toast.error("Failed to create PIN. Please try again.");
    }
  };

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
            label="New pin"
            placeholder="Enter new pin"
            value={newpassword}
            onChange={setNewPassword}
          />
          <PasswordInput
            label="Confirm new pin"
            placeholder="Confirm new pin"
            value={confirmpassword}
            onChange={setConfirmPassword}
          />
        </div>

        <div className="flex mt-10 gap-5 justify-end">
          <Button
            onClick={handleSubmitCreatePin}
            className="rounded-none text-black"
          >
            Create Pin
          </Button>
        </div>
      </div>
    </div>
  );
};
