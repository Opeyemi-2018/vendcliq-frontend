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
import { toast } from "sonner";

import {
  step1Schema,
  type Step1FormData,
  type SignupFormData,
} from "@/types/auth";

import ProgressHeader from "./ProgressHeader";

interface Props {
  onNext: (data: Partial<SignupFormData>) => void;
  data: SignupFormData;
}

export default function Step1({ onNext, data }: Props) {
  const [loading] = useState(false);

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      referralCode: data.referralCode || "",
    },
  });

  const onSubmit = (values: Step1FormData) => {
    // Just validate and move to next step (password creation)
    onNext({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      referralCode: values.referralCode,
    });
    toast.success("Information saved!");
  };

  return (
    <div>
      <ProgressHeader currentStep={1} />

      <h1 className="font-clash  text-[22px] font-semibold mb-2 text-[#2F2F2F]">
        Create Account
      </h1>
      <p className="text-[#9E9A9A] mb-4 text-[16px] leading">
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
            Continue
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