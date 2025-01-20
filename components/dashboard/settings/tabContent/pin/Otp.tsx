"use client";
import { Button } from "@/components/ui/button";
import PasswordInput from "@/components/ui/PasswordInput";
import { handleCreatePin, handleGetDashboard } from "@/lib/utils/api/apiHelper";
import { PinPayload } from "@/types";
import React, { useEffect, useState } from "react";
import { IoIosLock } from "react-icons/io";
import { toast } from "react-toastify";

export const Otp = ({
  goNext,
  goBack,
}: {
  goNext: () => void;
  goBack: () => void;
}) => {
  const pin = localStorage.getItem("pin") || "";
  const confirmPin = localStorage.getItem("confirmPin") || "";

  const [otp, setOtp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  useEffect(() => {
    const fetchDashboard = async () => {
      const response = await handleGetDashboard();
      setPhoneNumber(response.data.phone.number);
    };
    fetchDashboard();
  }, []);
  const handleSubmitCreatePin = async () => {
    try {
      const payload: PinPayload = {
        otp: otp,
        pin: pin,
        confirmPin: confirmPin,
      };
      const response = await handleCreatePin(payload);
      // console.log("response", response);
      if (response.status === "success") {
        toast.success("PIN created successfully");
        goNext();
      }
    } catch (error) {
      console.error("Error creating pin:", error);
      toast.error(
        "Failed to create PIN. Please try again or contact support if the issue persists."
      );
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
          Create a personal four digit pin for your transaction
        </p>

        <div className="mb-5 mt-10 space-y-5">
          <PasswordInput
            disabled={true}
            label="New pin"
            placeholder="Enter new pin"
            value={pin}
          />
          <PasswordInput
            disabled={true}
            label="Confirm new pin"
            placeholder="Confirm new pin"
            value={confirmPin}
          />

          <div className="pt-10 space-y-5">
            <p className="font-medium text-lg font-clash border-l-4 border-primary pl-3">
              Enter OTP sent to your phone{" "}
              {phoneNumber.slice(0, 4) + "****" + phoneNumber.slice(8, 12)}
            </p>
            <div>
              <PasswordInput
                label="Enter OTP code"
                placeholder="Enter OTP code"
                value={otp}
                onChange={setOtp}
              />
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
          <Button
            onClick={handleSubmitCreatePin}
            className="rounded-none text-black"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
