// chunks/Step3.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import {
  verifyBvnTokenSchema,
  type VerifyBvnTokenData,
} from "@/types/business";
import { handleVerifyBvnToken } from "@/lib/utils/api/apiHelper";
import { Separator } from "@/components/ui/separator";

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3({ onNext, onPrev }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VerifyBvnTokenData>({
    resolver: zodResolver(verifyBvnTokenSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  const code = form.watch("verificationCode");

  const onSubmit = async (values: VerifyBvnTokenData) => {
    setIsLoading(true);
    try {
      const response = await handleVerifyBvnToken({
        verificationCode: values.verificationCode,
      });

      if (response.status === "success") {
        toast.success(response.msg);
        onNext();
      } else {
        toast.error(response.msg || "Verification failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] text-[#2F2F2F] font-clash font-semibold ">
          Enter Verification Code
        </h2>
        <p className="text-[#9E9A9A] text-[14px] mb-2">
          Enter the 6-digit code sent to your phone number
        </p>
         <Separator
          orientation="horizontal"
          className="h-[1px]"
          style={{ background: "#E0E0E0" }}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="verificationCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-3">
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
                              .getElementById(`bvn-otp-${index + 1}`)
                              ?.focus();
                          } else if (!digit && index > 0) {
                            document
                              .getElementById(`bvn-otp-${index - 1}`)
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
                              .getElementById(`bvn-otp-${index - 1}`)
                              ?.focus();
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        id={`bvn-otp-${index}`}
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
          <Button
            type="submit"
            disabled={isLoading || code?.length !== 6}
            className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <ClipLoader size={20} color="white" />
                Verifying...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
