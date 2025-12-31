"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInFormData } from "@/types/auth";
import { toast } from "sonner";
import { handleSignIn } from "@/lib/utils/api/apiHelper";
import { useUser } from "@/context/userContext";

const SignIN = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUserAndWallet, clearUserData } = useUser(); // Use setUserAndWallet and clearUserData

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInFormData) => {
    try {
      setIsLoading(true);

      // Clear any existing user data BEFORE logging in
      clearUserData();

      // Optional: Force clear localStorage to ensure clean state
      localStorage.clear();

      const response = await handleSignIn(values);

      if (response.status === "success") {
        const token = response.data?.tokens?.accessToken?.token;

        // Store token first
        if (token) {
          localStorage.setItem("accessToken", token);
          localStorage.setItem("authToken", token);
        }

        const userData = response.data?.user;
        const walletData = response.data?.user?.wallet;

        if (userData) {
          const formattedUserData = {
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email.email,
            status: userData.account.status,
            userId: userData.userId,
            phone: userData.phone,
          };

          const formattedWalletData = walletData
            ? {
                walletId: walletData.walletId,
                balance: walletData.balance,
                currency: walletData.currency,
                accountName: walletData.accountName,
                accountNumbers: walletData.accountNumbers || {},
                createdAt: walletData.createdAt,
                updatedAt: walletData.updatedAt,
              }
            : null;

          // Use setUserAndWallet to update both at once
          setUserAndWallet(formattedUserData, formattedWalletData);

          // Also store in localStorage directly
          localStorage.setItem("user", JSON.stringify(formattedUserData));
          if (formattedWalletData) {
            localStorage.setItem("wallet", JSON.stringify(formattedWalletData));
          }

          toast.success("Signed in successfully!");
          router.push("/dashboards/account/overview");

          return;
        }

        toast.error("User data not found in response");
      } else {
        toast.error(response.msg || "Sign in failed");
      }
    } catch (error) {
      console.log("Sign in error:", error);
      toast.error("No internet connection or server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:max-w-[40rem] mx-auto  px-3 lg:px-10 xl:px-24">
      <h1 className="font-clash  text-[22px] font-semibold mb-2 text-[#2F2F2F]">
        Welcome Back
      </h1>
      <p className="text-[#9E9A9A] mb-4 text-[16px] leading-relaxed">
        Enter your email and password to continue right where you stopped
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 md:space-y-6"
        >
          {/* EMAIL FIELD */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter email"
                      {...field}
                      className="pl-10 bg-[#D8D8D866] h-12 "
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PASSWORD FIELD */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      {...field}
                      className="pl-10 bg-[#D8D8D866] h-12 "
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
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

          <Link
            href="/forgot-password"
            className="text-[#0A6DC0] hover:underline font-medium float-end text-sm"
          >
            Forgot Password?
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#0A6DC0] hover:bg-[#085a9e] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg w-full h-11 transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <p className="text-sm text-gray-600 pt-5 text-center">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[#0A6DC0] hover:underline font-medium"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignIN;
