// components/step5.tsx
"use client";

import { useState } from "react";
// DELETED: Removed unused ChevronLeft import since it's commented out in the JSX
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
// UPDATED: Importing the required partial schema and the central combined type
import {
  createPasswordSchema,
  type CreatePasswordFormData,
  type SignupFormData,
} from "@/types/auth";
// DELETED: Removed 'import { FormData } from "../page";'
import { toast } from "sonner";
import { handleCreatePassword } from "@/lib/utils/api/apiHelper";
import ProgressHeader from "./ProgressHeader";

interface Props {
  // UPDATED: Using the centralized SignupFormData type
  onNext: (data: Partial<SignupFormData>) => void;
  // UPDATED: Using the centralized SignupFormData type
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
    { test: password.length >= 8, label: "At least 8 characters" },
    { test: /[a-zA-Z]/.test(password), label: "Contains letters" },
    { test: /\d/.test(password), label: "Contains numbers" },
    {
      test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      label: "Contains symbols",
    },
  ];

  const onSubmit = async (values: CreatePasswordFormData) => {
    setLoading(true);
    try {
      // Assuming handleCreatePassword uses the global token (stored in Step 1)
      const response = await handleCreatePassword(values.password);

      if (response.status === "success") {
        toast.success(response.msg || "Password created successfully!");
        onNext({
          password: values.password,
          confirmPassword: values.confirmPassword,
        }); // Passing both fields for completeness
      } else {
        toast.error(response.msg || "Failed to create password");
      }
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

      <h1 className="clash-font text-[22px] font-semibold text-[#2F2F2F] mb-3">
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
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-[#2F2F2F]">
                Password must contain:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {req.test ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className={req.test ? "text-green-600" : "text-gray-500"}
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
            className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-bold py-6 rounded-xl text-lg"
          >
            {loading ? "Creating Password..." : "Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
