"use client";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import {
  handleApiError,
  handleConfirmPhoneNumber,
} from "@/lib/utils/api/apiHelper";
import { ConfirmPhoneNumberPayload } from "@/types";

import React, { useState } from "react";

type SignupStepFourProps = {
  nextStep: () => void;
  title: string;
};

const SignupStepFour: React.FC<SignupStepFourProps> = ({ nextStep, title }) => {
  const [phone, setPhone] = useState<string>("");
  const [isWhatsappNo, setIsWhatsappNo] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!phone) {
      setError("Phone number is required.");
      return;
    }

    const payload: ConfirmPhoneNumberPayload = {
      phone,
      isWhatsappNo,
    };

    setLoading(true);
    try {
      await handleConfirmPhoneNumber(payload);
      nextStep();
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>
      <div className="font-sans">
        <div className="mt-10 font-sans">
          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            className="flex-1 my-5"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="mt-5">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isWhatsappNo}
                onChange={(e) => setIsWhatsappNo(e.target.checked)}
                className="form-checkbox"
              />
              Is this your WhatsApp number?
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <Button
          onClick={handleSubmit}
          className="mt-6 w-full text-white rounded-none"
        >
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default SignupStepFour;
