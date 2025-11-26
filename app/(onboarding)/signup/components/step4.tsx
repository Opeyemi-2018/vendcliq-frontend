"use client";

import { useState, useEffect } from "react";
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
import { verifyPhoneSchema, type VerifyPhoneData, type SignupFormData } from "@/types/auth"; 
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";

import {
  handleVerifyPhoneNumber,
  handleResendPhoneVerificationToken,
} from "@/lib/utils/api/apiHelper";
import ProgressHeader from "./ProgressHeader";

interface Props {
  onNext: (data: Partial<SignupFormData>) => void; 
  data: SignupFormData;
}

export default function Step4({ onNext, data }: Props) {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canResend, setCanResend] = useState(false);

  const form = useForm<VerifyPhoneData>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: { phoneVerificationCode: "" }, 
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
    
    if (!data.phone) {
        toast.error("Phone number not found. Please go back to step 3.");
        setResending(false);
        return;
    }

    try {
      const channel = data.isWhatsappNo === "true" ? "whatsapp" : "phone";

      const res = await handleResendPhoneVerificationToken(data.phone, channel);

      if (res.status === "success") {
        toast.success(
          `New code sent via ${channel === "whatsapp" ? "WhatsApp" : "SMS"}!`
        );
        setTimeLeft(10); 
        setCanResend(false);
      } else {
        toast.error(res.msg || "Failed to resend code");
      }
    } catch (error: any) {
      const backendMessage = error.response?.data?.msg;
      const errorMsg = backendMessage || error.message || "Network error";
      toast.error(errorMsg);
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (values: VerifyPhoneData) => {
    setLoading(true);
    try {
      const response = await handleVerifyPhoneNumber(values.phoneVerificationCode);

      if (response.status === "success") {
        toast.success(response.msg || "Phone verified!");
        onNext({ phoneVerificationCode: values.phoneVerificationCode });
      } else {
        const msg = response.msg || "Invalid code";
        toast.error(msg);
        form.setError("phoneVerificationCode", { message: msg }); 
      }
    } catch (error: any) {
      const backendMessage = error.response?.data?.msg;
      const errorMsg = backendMessage || error.message || "Verification failed";

      toast.error(errorMsg);
      form.setError("phoneVerificationCode", { message: errorMsg }); 
    } finally {
      setLoading(false);
    }
  };

  const code = form.watch("phoneVerificationCode") || "";

  return (
    <div className="">
      <ProgressHeader currentStep={4} />

      <h1 className="clash-font text-[22px] font-semibold text-[#2F2F2F] mb-3">
        Verify Phone Number
      </h1>
      <p className="text-[#9E9A9A] mb-8">
        We've sent a one-time code via{" "}
        <strong>{data.isWhatsappNo === "true" ? "WhatsApp" : "SMS"}</strong>
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="phoneVerificationCode" 
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
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
              Didn't receive code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || resending}
                className="text-[#0A6DC0] font-medium hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend"}
              </button>
            </p>
            {timeLeft > 0 && (
              <p className="mt-1 text-[16px] text-[#2F2F2F] font-clash">
                {timeLeft}s
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-bold py-6 rounded-xl"
          >
            {loading ? (
              <>
                <ClipLoader size={24} color="white" />
                Verifying...
              </>
            ) : (
              "Verify Phone"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}