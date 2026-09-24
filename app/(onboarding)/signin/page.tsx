/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInFormData } from "@/types/auth";
import { toast } from "sonner";
import {
  handleGetAttendantPermissions,
  handleSignIn,
} from "@/lib/utils/api/apiHelper";
import { useUser, extractVerificationStatus } from "@/context/userContext";

const SignIN = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setAllUserData, clearUserData, setAttendantPermissions } = useUser();

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

      clearUserData();

      const response = await handleSignIn(values);

      if (response.status === "success") {
        const userRole = response.data?.user?.account?.accountRole; // ← NEW

        // === NEW: Set userRole cookie for middleware ===
        if (userRole) {
          document.cookie = `userRole=${userRole}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
        }

        const userData = response.data?.user;
        const businessData = response.data?.user?.business;

        if (userData) {
          const formattedUserData = {
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email.email,
            status: userData.account.status,
            userId: userData.userId,

            accountRole: userData.account.accountRole as
              | "CUSTOMER"
              | "ATTENDANTS",
            phone: userData.phone,
            pin: userData.pin ?? false,
            createdAt: userData.createdAt,
            referral: (userData as any).referral
              ? {
                  code: (userData as any).referral.code,
                  referredBy: (userData as any).referral.referredBy,
                  referralCount: (userData as any).referral.referralCount,
                }
              : undefined,
            wallet: userData.wallet || null,
          };

          const verificationStatus = businessData
            ? extractVerificationStatus(businessData)
            : null;

          setAllUserData(formattedUserData, verificationStatus);
          if (
            userData.account.accountRole === "ATTENDANTS" &&
            userData.userId
          ) {
            try {
              const permRes = await handleGetAttendantPermissions(
                userData.userId,
              );
              const permData = permRes?.data;

              if (permData && typeof permData === "object") {
                setAttendantPermissions({
                  can_buy: !!permData.can_buy,
                  can_sell: !!permData.can_sell,
                  can_update_stock: !!permData.can_update_stock,
                  can_move_stock: !!permData.can_move_stock,
                  can_add_stock: !!permData.can_add_stock,
                  can_market_place: !!permData.can_market_place,
                  can_push_to_market: !!permData.can_push_to_market,
                  can_view_store_info: !!permData.can_view_store_info,
                  can_reporting: !!permData.can_reporting,
                  can_expenses: !!permData.can_expenses,
                  can_sell_on_credit: !!permData.can_sell_on_credit,
                });
                const perms: string[] = [];
                if (permData.can_sell) perms.push("canSell");
                if (permData.can_buy) perms.push("canBuy");
                if (permData.can_reporting) perms.push("canReporting");
                if (permData.can_expenses) perms.push("canExpenses");
                if (permData.can_market_place)
                  perms.push("canAccessMarketplace");

                document.cookie = `userPermissions=${perms.join(",")}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
              }
            } catch {
              // permissions fetch failed — all will default to false for attendant
            }
          }

          // Store in localStorage for persistence
          localStorage.setItem("user", JSON.stringify(formattedUserData));
          if (verificationStatus) {
            localStorage.setItem(
              "verificationStatus",
              JSON.stringify(verificationStatus),
            );
          }

          // After the ATTENDANTS block, in the else or just before router.push
          if (userData.account.accountRole !== "ATTENDANTS") {
            document.cookie = `userPermissions=canSell,canBuy,canReporting,canExpenses,canAccessMarketplace; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
          }

          toast.success("Signed in successfully!");
          router.push(
            userData.account.accountRole === "ATTENDANTS"
              ? "/inventory/overview"
              : "/account/overview",
          );
        } else {
          toast.error("User data not found in response");
        }
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
    <>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0A6DC0]">
        Welcome back
      </p>
      <h1 className="font-clash text-[36px] font-semibold leading-[1.05] tracking-tight text-[#0A2540] sm:text-[44px]">
        Good to see you.
      </h1>
      <p className="mb-8 mt-4 text-[16px] leading-relaxed text-[#5B6B7F]">
        Sign in to pick up right where you stopped — your stock, sales
        and orders are waiting.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* EMAIL FIELD */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      autoComplete="email"
                      {...field}
                      className="h-14 rounded-2xl border-slate-200 bg-white pl-12 shadow-sm"
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
                <FormLabel className="sr-only">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="current-password"
                      {...field}
                      className="h-14 rounded-2xl border-slate-200 bg-white pl-12 pr-12 shadow-sm"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#0A6DC0] underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-2xl bg-[#0A6DC0] px-4 text-white transition-all hover:bg-[#085a9e] disabled:bg-gray-400"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </Form>

      <p className="pt-6 text-center text-sm text-gray-600">
        New to Vendcliq?{" "}
        <Link
          href="/signup"
          className="font-medium text-[#0A6DC0] underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </>
  );
};

export default SignIN;
