/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ChevronLeft, Mail, Eye, EyeOff, Lock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import {
  forgotPasswordStep1Schema,
  forgotPasswordStep2Schema,
  type ForgotPasswordStep1Data,
  type ForgotPasswordStep2Data,
  type ForgotPasswordFormData,
} from "@/types/auth";
import {
  handleSendOtpForForgetPassword,
  handleResetPassword,
} from "@/lib/utils/api/apiHelper";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<ForgotPasswordFormData>({});
  const router = useRouter();

  // Step 1 Form
  const step1Form = useForm<ForgotPasswordStep1Data>({
    resolver: zodResolver(forgotPasswordStep1Schema),
    defaultValues: {
      email: formData.email || "",
    },
  });

  // Step 2 Form
  const step2Form = useForm<ForgotPasswordStep2Data>({
    resolver: zodResolver(forgotPasswordStep2Schema),
    defaultValues: {
      otp: formData.otp || "",
      password: formData.password || "",
      confirmPassword: formData.confirmPassword || "",
    },
  });
  
  const password = step2Form.watch("password");

  const passwordRequirements = [
    { test: password?.length >= 8, label: "At least 8 characters" },
    { test: /[a-zA-Z]/.test(password || ""), label: "Contains letters" },
    { test: /\d/.test(password || ""), label: "Contains numbers" },
    {
      test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password || ""),
      label: "Contains symbols",
    },
  ];

  // Step 1: Request OTP
  const onStep1Submit = async (values: ForgotPasswordStep1Data) => {
    setIsLoading(true);
    try {
      const response = await handleSendOtpForForgetPassword({
        email: values.email.toLowerCase().trim(),
      });

      if (response.status === "success") {
        setFormData({ ...formData, email: values.email });
        toast.success("OTP sent to your email!");
        setStep(2);
      } else {
        toast.error(response.msg || "Failed to send OTP");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        "Network error. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
  const onStep2Submit = async (values: ForgotPasswordStep2Data) => {
    setIsLoading(true);
    try {
      const response = await handleResetPassword({
        otp: values.otp,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      if (response.status === "success") {
        toast.success("Password reset successful!");
        router.push("/signin");
      } else {
        toast.error(response.msg || "Failed to reset password");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        "Network error. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:max-w-[40rem] mx-auto py-8 px-3 lg:px-10 xl:px-24">
      <button
        onClick={() => (step === 1 ? router.back() : setStep(1))}
        className="flex items-center gap-2 text-[#2F2F2F] py-10 hover:opacity-70 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      {/* Step 1: Request OTP */}
      {step === 1 && (
        <div>
          <h1 className="text-[22px] font-clash font-semibold mb-2 text-[#2F2F2F]">
            Forgot Password?
          </h1>
          <p className="text-[#9E9A9A] mb-8 text-[16px] leading-relaxed">
            Enter your email address and we&apos;ll send you a code to reset your
            password.
          </p>

          <Form {...step1Form}>
            <form
              onSubmit={step1Form.handleSubmit(onStep1Submit)}
              className="space-y-6"
            >
              <FormField
                control={step1Form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className="pl-10 bg-[#D8D8D866] h-12 border-0"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#0A6DC0] hover:bg-[#085a9e] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg w-full h-12 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <ClipLoader size={20} color="white" />
                    Requesting OTP...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Step 2: Reset Password with OTP */}
      {step === 2 && (
        <div>
          <h1 className="text-[22px] font-clash font-semibold mb-2 text-[#2F2F2F]">
            Reset Password
          </h1>
          <p className="text-[#9E9A9A] mb-8 text-[16px] leading-relaxed">
            Enter the OTP sent to your email and create a new password.
          </p>

          <Form {...step2Form}>
            <form
              onSubmit={step2Form.handleSubmit(onStep2Submit)}
              className="space-y-6"
            >
              {/* OTP Field */}
              <FormField
                control={step2Form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                      Verification Code
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-6 gap-2 w-full">
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
                              const joined = newCode
                                .join("")
                                .trim()
                                .slice(0, 6);
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
                            className="w-12 h-12 text-[13px] text-[#333333] lg:w-14 lg:h-14 text-center rounded-xl border-2 bg-[#D8D8D866] focus:border-[#0A6DC0] focus:bg-white transition-all"
                            disabled={isLoading}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password Field */}
              <FormField
                control={step2Form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          {...field}
                          className="pl-10 pr-12 bg-[#D8D8D866] h-12 border-0"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={step2Form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          {...field}
                          className="pl-10 pr-12 bg-[#D8D8D866] h-12 border-0"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Requirements */}
              {password && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-[#2F2F2F]">
                    Password must contain:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {req.test ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        <span
                          className={
                            req.test ? "text-green-600" : "text-gray-500"
                          }
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#0A6DC0] hover:bg-[#085a9e] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg w-full h-12 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <ClipLoader size={20} color="white" />
                    Resetting Password...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
