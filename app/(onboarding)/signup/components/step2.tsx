/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, X, ChevronLeft } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPasswordSchema,
  type CreatePasswordFormData,
  type SignupFormData,
} from "@/types/auth";
import { toast } from "sonner";
import { poster } from "@/lib/utils/api/apiHelper";
import { SIGN_UP } from "@/url/api-url";
import ProgressHeader from "./ProgressHeader";
import { ClipLoader } from "react-spinners";
import { useUser } from "@/context/userContext";

interface Props {
  onNext: (data: Partial<SignupFormData>) => void;
  onPrev: () => void; 
  data: SignupFormData;
}

export default function Step2({ onNext, onPrev, data }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const form = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      password: data.password || "",
      confirmPassword: data.confirmPassword || "",
    },
  });

  const password = form.watch("password");

  const requirements = [
    { test: password.length >= 8, label: "8 characters" },
    { test: /[a-zA-Z]/.test(password), label: "Letters" },
    { test: /\d/.test(password), label: "Numbers" },
    {
      test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      label: "symbols",
    },
  ];

  const onSubmit = async (values: CreatePasswordFormData) => {
    setLoading(true);

    try {
      const payload = {
        firstName: data.firstName!.trim(),
        lastName: data.lastName!.trim(),
        email: data.email!.toLowerCase().trim(),
        password: values.password,
        confirmPassword: values.confirmPassword, // Added
        referralCode: data.referralCode?.trim() || "", // Send empty string if none
        device_info: {
          // Full dummy device_info object
          device_id: "",
          device_name: "",
          device_model: "",
          manufacturer: "",
          os_name: "",
          os_version: "",
          os_build: "",
          screen_width: "",
          screen_height: "",
          screen_density: "",
          connection_type: "",
          carrier_name: "",
          timezone: "",
          language: "",
          country_code: "",
          app_version: "",
          app_build: "",
          biometric_available: true,
          jailbreak_status: false,
          free_memory: "",
          free_storage: "",
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log("Signup payload:", payload);
      const response = await poster<any>(SIGN_UP, payload);

      if (response.status === "success") {
        const token = response.data?.tokens?.accessToken?.token;
        const userData = response.data?.user;

        if (!token) {
          toast.error("Authentication failed: No token received");
          return;
        }
        if (userData) {
          setUser(userData);
        }

        localStorage.setItem("accessToken", token);
        localStorage.setItem("authToken", token);
        localStorage.setItem("email", data.email!.toLowerCase().trim());

        toast.success(
          "Account created! Check your email for verification code"
        );

        onNext({
          password: values.password,
          confirmPassword: values.confirmPassword,
        });
      } else {
        toast.error(response.msg || "Signup failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        "Network error. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProgressHeader currentStep={2} />{" "}
      <button
        type="button"
        onClick={onPrev} // ← Now uses the proper prev function
        className="flex items-center gap-2 text-[#2F2F2F] pb-4 md:pb-10 hover:opacity-70 mb-4"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>
      <h1 className="font-clash text-[22px] font-semibold text-[#2F2F2F] mb-3">
        Create Password
      </h1>
      <p className="text-[#9E9A9A] mb-8">
        Create a strong password to secure your account
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...field}
                      className="pl-10 pr-12 bg-[#FAFAFA] h-12"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.67 0-8 1.335-8 4v2h16v-2c0-2.665-5.33-4-8-4z"
                        />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...field}
                      className="pl-10 pr-12 bg-[#FAFAFA] h-12"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.67 0-8 1.335-8 4v2h16v-2c0-2.665-5.33-4-8-4z"
                        />
                      </svg>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-3 text-gray-500"
                    >
                      {showConfirm ? (
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

          {password && (
            <div className=" space-y-2">
              <p className="text-sm font-medium text-[#2F2F2F]">
                Password must contain:
              </p>
              <div className="flex items-center justify-between md:gap-2 text-[11px] md:text-[14px]">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-center md:gap-2">
                    {req.test ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className={
                        req.test
                          ? "text-green-600 whitespace-nowrap"
                          : "text-red-400 whitespace-nowrap"
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
            disabled={loading || !form.formState.isValid}
            className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-bold py-6 rounded-xl "
          >
            {loading ? (
              <>
                Creating Account...
                <ClipLoader size={24} color="white" />
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
