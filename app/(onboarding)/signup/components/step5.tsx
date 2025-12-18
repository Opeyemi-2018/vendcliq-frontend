"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
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
import { handleCreatePassword } from "@/lib/utils/api/apiHelper";
import ProgressHeader from "./ProgressHeader";
import { ClipLoader } from "react-spinners";

interface Props {
  onNext: (data: Partial<SignupFormData>) => void;
  data: SignupFormData;
}

export default function Step5({ onNext, data }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      // Pre-fill existing data if available (though unlikely for a fresh password)
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
      const response = await handleCreatePassword(values.password);

      if (response.status === "success") {
        toast.success(response.msg || "Password created successfully!");
        onNext({
          password: values.password,
          confirmPassword: values.confirmPassword,
        }); 
      } else {
        toast.error(response.msg || "Failed to create password");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProgressHeader currentStep={5} />
      {/* <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#2F2F2F] hover:text-[#0A6DC0] transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
      </div> */}

      <h1 className="font-clash text-[22px] font-semibold text-[#2F2F2F] mb-3">
        Create Password
      </h1>
      <p className="text-[#9E9A9A] mb-8">
        Create a strong password to secure your account
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Password */}
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

          {/* Confirm Password */}
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
                Creating...
                <ClipLoader size={24} color="white" />
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
