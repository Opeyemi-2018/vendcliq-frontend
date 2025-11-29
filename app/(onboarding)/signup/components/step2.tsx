// components/step2.tsx
"use client";

import { useState, useEffect } from "react";
// DELETED: Removed unused ChevronLeft import since it's commented out in the JSX
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  verifyEmailSchema,
  type VerifyEmailFormData,
  type SignupFormData,
} from "@/types/auth";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";

import {
  handleEmailVerification,
  handleResendEmailVerificationToken,
} from "@/lib/utils/api/apiHelper";
import ProgressHeader from "./ProgressHeader";

interface Props {
  onNext: (data: Partial<SignupFormData>) => void;
  data: SignupFormData;
}

export default function Step2({ onNext, data }: Props) {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canResend, setCanResend] = useState(false);

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await handleResendEmailVerificationToken();

      if (res.status === "success") {
        toast.success(res.msg || "New code sent!");
        setTimeLeft(10);
        setCanResend(false);
      } else {
        toast.error(res.msg || "Failed to resend code");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (values: VerifyEmailFormData) => {
    setLoading(true);
    try {
      const response = await handleEmailVerification(values.verificationCode);

      if (response.status === "success") {
        toast.success(response.msg || "Email verified successfully!");
        onNext({ verificationCode: values.verificationCode });
      } else {
        const errorMsg = response.msg || "Invalid or expired code";
        toast.error(errorMsg);
        form.setError("verificationCode", { message: errorMsg });
      }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMsg = errorData.msg || "Invalid verification code";
        toast.error(errorMsg);
        form.setError("verificationCode", { message: errorMsg });
      } else {
        const msg = error.message || "Failed to verify email";
        toast.error(msg);
        form.setError("verificationCode", { message: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const code = form.watch("verificationCode") || "";

  return (
    <div className="max-w-lg mx-auto">
      <ProgressHeader currentStep={2} />

      <h1 className="clash-font text-[22px] font-semibold text-[#2F2F2F] mb-3">
        Verify Your Email
      </h1>
      <p className="text-[#9E9A9A] mb-8 leading-relaxed">
        We sent a 6-digit verification code to
        <br />
        <span className="font-semibold text-[#2F2F2F] block mt-1">
          {data.email}
        </span>
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="verificationCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex  gap-3 md:gap-5">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <Input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={field.value?.[index] || ""}
                        onChange={(e) => {
                          const digit = e.target.value.replace(/\D/g, "");
                          if (!digit && e.target.value !== "") return;

                          const newCode = (field.value || "")
                            .padEnd(6, " ")
                            .split("");
                          newCode[index] = digit;
                          const joined = newCode.join("").trim().slice(0, 6);
                          field.onChange(joined);

                          if (digit && index < 5) {
                            document
                              .getElementById(`otp-${index + 1}`)
                              ?.focus();
                          } else if (!digit && index > 0) {
                            document
                              .getElementById(`otp-${index - 1}`)
                              ?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            !field.value?.[index] &&
                            index > 0
                          ) {
                            e.preventDefault();
                            document
                              .getElementById(`otp-${index - 1}`)
                              ?.focus();
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        id={`otp-${index}`}
                        className="w-12 h-12 text-[13px] text-[#333333] lg:w-14 lg:h-14 text-center  rounded-xl border-2 bg-[#D8D8D866] focus:border-[#0A6DC0] focus:bg-white transition-all"
                        disabled={loading}
                      />
                    ))}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-between text-sm text-[#9E9A9A]">
            <p>
              Didn’t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || resending}
                className="text-[#0A6DC0] font-medium hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            </p>
            {timeLeft > 0 && <p className="mt-2">{timeLeft}s</p>}
          </div>

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-bold py-6 rounded-xl"
          >
            {loading ? (
              <>
            
                Verifying...
                    <ClipLoader size={20} color="white" />
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
