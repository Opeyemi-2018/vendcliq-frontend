// chunks/Step2.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import {
  requestBvnTokenSchema,
  type RequestBvnTokenData,
} from "@/types/business";
import { handleRequestBvnToken } from "@/lib/utils/api/apiHelper";
import { Separator } from "@/components/ui/separator";

interface Props {
  onNext: () => void;
  onPrev: () => void;
  phoneNumbers: {
    phoneNumber1: string;
    phoneNumber2: string | null;
  };
}

export default function Step2({ onNext, onPrev, phoneNumbers }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string>(
    phoneNumbers.phoneNumber1
  );

  const form = useForm<RequestBvnTokenData>({
    resolver: zodResolver(requestBvnTokenSchema),
    defaultValues: {
      phoneNumber: phoneNumbers.phoneNumber1,
    },
  });

  const onSubmit = async (values: RequestBvnTokenData) => {
    setIsLoading(true);
    try {
      const response = await handleRequestBvnToken({
        phoneNumber: values.phoneNumber,
      });

      if (response.status === "success") {
        toast.success(response.msg);
        onNext();
      } else {
        toast.error(response.msg || "Failed to send verification code");
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
          Select Phone Number
        </h2>
        <p className="text-[#9E9A9A] text-[14px] mb-2">
          Choose which phone number to receive the verification code
        </p>
        <Separator
          orientation="horizontal"
          className="h-[1px]"
          style={{ background: "#E0E0E0" }}
        />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            setSelectedPhone(phoneNumbers.phoneNumber1);
            form.setValue("phoneNumber", phoneNumbers.phoneNumber1);
          }}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            selectedPhone === phoneNumbers.phoneNumber1
              ? "border-[#0A6DC0] bg-[#0A6DC01A]"
              : "border-[#E5E7EB] bg-white"
          }`}
        >
          <p className="font-medium text-[#2F2F2F]">
            {phoneNumbers.phoneNumber1}
          </p>
          <p className="text-sm text-[#9E9A9A]">Primary Phone</p>
        </button>

        {phoneNumbers.phoneNumber2 && (
          <button
            type="button"
            onClick={() => {
              setSelectedPhone(phoneNumbers.phoneNumber2!);
              form.setValue("phoneNumber", phoneNumbers.phoneNumber2!);
            }}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedPhone === phoneNumbers.phoneNumber2
                ? "border-[#0A6DC0] bg-[#0A6DC01A]"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <p className="font-medium text-[#2F2F2F]">
              {phoneNumbers.phoneNumber2}
            </p>
            <p className="text-sm text-[#9E9A9A]">Secondary Phone</p>
          </button>
        )}
      </div>
      <Button
        onClick={form.handleSubmit(onSubmit)}
        disabled={isLoading}
        className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <ClipLoader size={20} color="white" />
            Sending...
          </span>
        ) : (
          "Continue"
        )}
      </Button>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onPrev} className="">
          <ChevronLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    </div>
  );
}
