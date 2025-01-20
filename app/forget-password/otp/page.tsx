"use client";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import {
  handleApiError,
  handleSendOtpForForgetPassword,
} from "@/lib/utils/api/apiHelper";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

import { toast } from "react-toastify";

const Page = () => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const router = useRouter();
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearTimeout(timer);
  }, [timerActive, timeLeft]);

  useEffect(() => {
    // Start the timer when the component mounts
    setTimerActive(true);
    setTimeLeft(30);
  }, []);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await handleSendOtpForForgetPassword({ email });
      // console.log(response);
      if (response.status === "success") {
        toast.success(response.msg);
        router.push("/forget-password/reset");
      }
    } catch (error) {
      handleApiError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  //   const handleStartTimer = () => {
  //     setTimerActive(true);
  //     setTimeLeft(30);
  //     // TODO: Implement resend OTP logic here
  //   };

  return (
    <div className="max-w-xl mx-auto bg-inherit md:bg-white mt-40 px-10 py-6">
      <h2 className="text-xl font-semibold text-black text-left  pb-2">
        Did you forget your password?
      </h2>
      <p className="text-sm text-black text-left font-sans">
        Enter your email address and we&apos;ll send you a token to reset your
        <br />
        password.
      </p>
      <div className="font-sans mt-5">
        <div className="mt-6">
          <Input
            label="Email address"
            placeholder="Enter your email address"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <p
          className="text-sm text-primary font-bold mt-2 text-right cursor-pointer"
          onClick={() => router.push("/login")}
        >
          Back to Login
        </p>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full text-black"
        >
          {loading ? "Sending..." : "Send Reset Token"}
        </Button>
      </div>
    </div>
  );
};

export default Page;
