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

      if (newpassword === confirmpassword) {
        localStorage.setItem("pin", newpassword);
        localStorage.setItem("confirmPin", confirmpassword);
        const response = await handleRequestPinToken();
        // console.log(response);
        if (response.status === "success") {
          toast.success("OTP sent successfully");
          goNext();
        }
      } else {
        return toast.error("Pin does not match");
      }
    } catch (error) {
      console.log(error);
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
