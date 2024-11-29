"use client";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import {
  handleApiError,
  handleEmailVerification,
} from "@/lib/utils/api/apiHelper";
import { EmailVerificationPayload } from "@/types";
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
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const email = localStorage.getItem("email");

  // useEffect(() => {
  //   let timer: NodeJS.Timeout;
  //   if (timerActive && timeLeft > 0) {
  //     timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
  //   } else if (timeLeft === 0) {
  //     setTimerActive(false);
  //   }
  //   return () => clearTimeout(timer);
  // }, [timerActive, timeLeft]);

  // useEffect(() => {
  //   // Start the timer when the component mounts
  //   setTimerActive(true);
  //   setTimeLeft(30);
  // }, []);

  const handleSubmit = async () => {
    if (!token.trim()) {
      setError("Confirmation code is required.");
      return;
    }

    const payload: EmailVerificationPayload = { token };

    setLoading(true);
    try {
      console.log("payload");
      const response = await handleEmailVerification(payload);
      console.log(response);
      nextStep();
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = () => {
    setTimerActive(true);
    setTimeLeft(30);
    // TODO: Implement resend OTP logic here
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-black text-center border-b border-border pb-2">
        {title}
      </h2>
      <div className="font-sans mt-5">
        <p className="font-medium text-black text-center">
          A confirmation code has been sent to your email address:
          <span className="text-primary block mt-1">{email}</span>
        </p>
        <div className="mt-6">
          <Input
            label="Confirmation Code"
            placeholder="Enter Confirmation Code"
            className="w-full"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="flex justify-between items-center mt-4 text-sm">
          {timerActive ? (
            <p>Time remaining: {timeLeft} seconds</p>
          ) : (
            <Button
              onClick={handleStartTimer}
              variant="ghost"
              className="text-primary hover:text-primary-dark"
            >
              Resend OTP
            </Button>
          )}
          <Button
            onClick={handleStartTimer}
            variant="ghost"
            className="flex items-center gap-2 text-secondary hover:text-secondary-dark"
            disabled={timerActive}
          >
            <TbReload size="16" />
            <span>Resend code</span>
          </Button>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full"
        >
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default SignupStepThree;
