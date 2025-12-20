"use client";

import { useState } from "react";
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
import { User, Mail, Link2 } from "lucide-react";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";

import {
  step1Schema,
  type Step1FormData,
  type SignupFormData,
} from "@/types/auth";

import { poster } from "@/lib/utils/api/apiHelper";
import { SIGN_UP } from "@/url/api-url";
import ProgressHeader from "./ProgressHeader";

interface Props {
  onNext: (data: Partial<SignupFormData>) => void;
  data: SignupFormData;
}

export default function Step1({ onNext, data }: Props) {
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      referralCode: data.referralCode || "",
    },
  });

  const onSubmit = async (values: Step1FormData) => {
    setLoading(true);

    try {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.toLowerCase().trim(),
        referralCode: values.referralCode?.trim() || undefined,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        localStorage.setItem("email", values.email.toLowerCase().trim());

        toast.success("Verification code sent! Check your email");

        onNext({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          referralCode: values.referralCode,
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
      <ProgressHeader currentStep={1} />

      <h1 className="font-clash  text-[22px] font-semibold mb-2 text-[#2F2F2F]">
        Create Account
      </h1>
      <p className="text-[#9E9A9A] mb-4 text-[16px] leading-relaxed">
        Join thousands of business owners transforming how they manage and grow
        their stores.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="First name"
                      {...field}
                      className="pl-10 bg-[#D8D8D866] h-12 border-0"
                      disabled={loading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Last name"
                      {...field}
                      className="pl-10 bg-[#D8D8D866] h-12 border-0"
                      disabled={loading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      className="pl-10 bg-[#D8D8D866] h-12 border-0"
                      disabled={loading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referralCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Code (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Enter referral code"
                      {...field}
                      className="pl-10 bg-[#D8D8D866] h-12 border-0"
                      disabled={loading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-bold py-6 rounded-xl mt-8 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                Creating Account...
                <ClipLoader size={20} color="white" />
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </Form>

      <p className="text-center mt-8 text-sm text-[#9E9A9A]">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-[#0A6DC0] font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
