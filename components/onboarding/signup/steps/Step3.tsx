"use client";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Field";
import {
  handleApiError,
  handleEmailVerification,
} from "@/lib/utils/api/apiHelper";
import { ResendEmailVerificationToken } from "@/services/verification/Verification";
import { EmailVerificationPayload } from "@/types";
import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

type SignupStepThreeProps = {
  nextStep: () => void;
  title: string;
};

const validationSchema = Yup.object({
  token: Yup.string().required("Confirmation code is required"),
});

const SignupStepThree: React.FC<SignupStepThreeProps> = ({
  nextStep,
  title,
}) => {
  const [error, setError] = useState<string | null>(null);
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
    setTimeLeft(30);
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
      handleApiError(error, setError);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { token: string }) => {
    const payload: EmailVerificationPayload = { token: values.token };

    setLoading(true);
    try {
      const response = await handleEmailVerification(payload);
      if (response.status === "success") {
        toast.success(response.msg);
        nextStep();
      }
    } catch (error) {
      handleApiError(error, setError);
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
                className="mt-6 w-full"
              >
                {isSubmitting || loading ? "Verifying..." : "Continue"}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SignupStepThree;
