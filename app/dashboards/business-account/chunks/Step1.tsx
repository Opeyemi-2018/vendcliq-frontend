"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { validateBvnSchema, type ValidateBvnData } from "@/types/business";
import { handleValidateBvn } from "@/lib/utils/api/apiHelper";

type Props = {
  onNext: (phoneNumbers: {
    phoneNumber1: string;
    phoneNumber2: string | null;
  }) => void;
  onPrev?: () => void; 
};

export default function Step1({ onNext }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ValidateBvnData>({
    resolver: zodResolver(validateBvnSchema),
    defaultValues: {
      bvnNumber: "",
    },
  });

  const onSubmit = async (values: ValidateBvnData) => {
    setIsLoading(true);
    try {
      const response = await handleValidateBvn({
        bvnNumber: values.bvnNumber,
      });

      if (response.status === "success") {
        toast.success(response.msg);
        onNext({
          phoneNumber1: response.data.phoneNumber1,
          phoneNumber2: response.data.phoneNumber2,
        });
      } else {
        toast.error(response.msg || "BVN validation failed");
      }
    } catch (error) {
      const err = error as {
        response?: { data?: { msg?: string; message?: string } };
      };
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Network error. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] text-[#2F2F2F] font-clash font-semibold mb-2">
          BVN Validation
        </h2>
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
            name="bvnNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                  BVN Number
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter your 11-digit BVN"
                    maxLength={11}
                    {...field}
                    className="bg-[#D8D8D866] h-12 border-0"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <ClipLoader size={20} color="white" />
                Validating...
              </span>
            ) : (
              "Validate"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
