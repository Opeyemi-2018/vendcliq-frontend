"use client";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import { handleEmailVerification } from "@/lib/utils/api/apiHelper";
import { ResendEmailVerificationToken } from "@/services/verification/Verification";
import { EmailVerificationPayload } from "@/types";
import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import Link from "next/link";
import { AxiosError } from "axios";

type SignupStepThreeProps = {
  nextStep: () => void;
  title: string;
  prevStep: () => void;
};

const validationSchema = Yup.object({
  token: Yup.string().required("Confirmation code is required"),
});

const SignupStepThree: React.FC<SignupStepThreeProps> = ({
  nextStep,
  title,
}) => {
  const [error] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const email = localStorage.getItem("email");

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
    setTimerActive(true);
    setTimeLeft(60);
  }, []);

  const handleResendVerificationToken = async () => {
    try {
      setLoading(true);
      const response = await ResendEmailVerificationToken();
      if (response.status === "success") {
        toast.success(response.msg);
        handleStartTimer();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorData = error.response?.data;
        // console.log("errorData>>>>", errorData);
        toast.error(errorData?.msg || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { token: string }) => {
    const payload: EmailVerificationPayload = { token: values.token };

    setLoading(true);
    setTimerActive(false); // Stop timer when submitting
    try {
      const response = await handleEmailVerification(payload);
      if (response.status === "success") {
        toast.success(response.msg);
        nextStep();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorData = error.response?.data;
        if (errorData?.data?.[0]?.message) {
          toast.error(errorData.data[0].message);
        } else {
          toast.error(errorData?.msg || "An error occurred");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = () => {
    setTimerActive(true);
    setTimeLeft(30);
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

        <Formik
          initialValues={{ token: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, isSubmitting }) => (
            <Form className="mt-6">
              <Input
                label="Confirmation Code"
                name="token"
                placeholder="Enter Confirmation Code"
                className="w-full"
                value={values.token}
                onChange={handleChange}
                error={touched.token ? errors.token : undefined}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <div className="flex justify-between items-center mt-4 text-sm">
                {timerActive ? (
                  <p>Time remaining: {timeLeft} seconds</p>
                ) : (
                  <Button
                    onClick={handleResendVerificationToken}
                    variant="ghost"
                    className="text-primary hover:text-primary-dark"
                    disabled={loading}
                    type="button"
                  >
                    Resend OTP
                  </Button>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="mt-6 w-full px-6 py-2 font-sans bg-yellow-500 text-black rounded-none"
              >
                {isSubmitting || loading ? "Verifying..." : "Continue"}
              </Button>
            </Form>
          )}
        </Formik>

        <div className="flex gap-1 items-center justify-center mt-3 font-sans text-sm">
          <p className="text-black">I already have an account?</p>
          <Link href={"/"}>
            <p className="text-primary">Login</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupStepThree;
