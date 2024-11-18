"use client";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import { handleApiError } from "@/lib/utils/api/apiHelper";

import React, { useState } from "react";

import { TbReload } from "react-icons/tb";

type SignupStepThreeProps = {
  nextStep: () => void;
  title: string;
};

const SignupStepThree: React.FC<SignupStepThreeProps> = ({
  nextStep,
  title,
}) => {
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    // if (!code.trim()) {
    //   setError("Confirmation code is required.");
    //   return;
    // }

    // const payload: EmailVerificationPayload = {
    //   code,
    // };

    setLoading(true);
    try {
      // await handleEmailVerification(payload);
      nextStep();
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  // const handleResend = async () => {};
  return (
    <div className="">
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>
      <div className="font-sans">
        <p className="font-medium text-black text-center mt-5">
          A confirmation code has been sent to your email address has been sent
          to <span className="text-primary">g.awuya@vera.africa</span>
        </p>
        <div className="mt-10 font-sans">
          <Input
            label="Confirmation Code"
            placeholder="Enter Confirmation Code"
            className="flex-1  my-5"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="flex gap-1 items-center justify-center mt-3 font-sans text-sm">
          <Button className=" flex  items-center justify-center bg-inherit hover:bg-inherit gap-2 font-medium text-secondary">
            <TbReload size="20" className="text-black" />
            <p className="text-black">Resend confirmation code</p>
          </Button>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 text-white w-full rounded-none"
        >
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default SignupStepThree;
