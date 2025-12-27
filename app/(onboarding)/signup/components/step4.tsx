"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { Button } from "@/components/ui/button";
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
  confirmPhoneSchema,
  type ConfirmPhoneData,
  type SignupFormData,
} from "@/types/auth";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { toast } from "sonner";
import { handleConfirmPhoneNumber } from "@/lib/utils/api/apiHelper";
import ProgressHeader from "./ProgressHeader";
import { ClipLoader } from "react-spinners";

interface Props {
  onNext: (data: Partial<SignupFormData>) => void;
  data: SignupFormData;
}

export default function Step4({ onNext, data }: Props) {
  const [method, setMethod] = useState<"whatsapp" | "sms">(
    data.isWhatsappNo === "true" ? "whatsapp" : "sms"
  );

  const form = useForm<ConfirmPhoneData>({
    resolver: zodResolver(confirmPhoneSchema),
    defaultValues: {
      phone: data.phone || "",
      isWhatsappNo: method === "whatsapp" ? "true" : "false",
    },
  });

  const onSubmit = async (values: ConfirmPhoneData) => {
    form.setValue("isWhatsappNo", method === "whatsapp" ? "true" : "false");

    let finalPhone = values.phone.replace(/\D/g, ""); 
    if (finalPhone.startsWith("234")) {
      finalPhone = finalPhone.substring(3);
    }
    if (finalPhone.startsWith("0")) {
      finalPhone = finalPhone.substring(1);
    }

    try {
      const response = await handleConfirmPhoneNumber({
        phone: finalPhone,
        isWhatsappNo: method === "whatsapp" ? "true" : "false",
      });

      if (response.status === "success") {
        const serverMessage = response.msg || "Verification code sent!";
        toast.success(serverMessage);

        onNext({
          phone: finalPhone,
          isWhatsappNo: method === "whatsapp" ? "true" : "false",
        });
      } else {
        if (
          response.msg?.includes("Duplicate entry") ||
          response.msg?.includes("users_phone_unique")
        ) {
          toast.error(
            "This phone number is already registered. Please use a different number"
          );
        } else {
          toast.error(
            response.msg ||
              "Failed to send verification code. Please try again."
          );
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error.message ||
          "An unexpected error occurred. Please check your connection and try again."
      );
    }
  };

  return (
    <div>
      <ProgressHeader currentStep={4} />

      <h1 className="text-[22px] font-semibold mb-3 font-clash">
        Phone Number
      </h1>
      <p className="text-[#9E9A9A] mb-8">
        We&apos;ll use this number to keep your account safe and send important
        updates.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <PhoneInput
                    country={"ng"}
                    value={field.value}
                    onChange={field.onChange}
                    inputStyle={{
                      width: "100%",
                      height: "56px",
                      backgroundColor: "#F3F4F6",
                      borderRadius: "8px",
                      border: "none",
                    }}
                    containerStyle={{ width: "100%" }}
                    buttonStyle={{ borderRadius: "8px 0 0 8px" }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div className="mb-4">
              <p className="text-[#2F2F2F] font-clash font-bold ">
                Choose verification method
              </p>
              <p className="text-[#9E9A9A] text-[13px]">
                Select method that&apos;s easiest for you to get your OTP.
              </p>
            </div>{" "}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMethod("whatsapp")}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-lg border-2 transition-all ${
                  method === "whatsapp"
                    ? "border-[#0A6DC0] bg-[#0A6DC012]"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <BsWhatsapp className="text-[#25D366] text-2xl" />
                  <span className="font-medium">WhatsApp</span>
                </div>
                {method === "whatsapp" && (
                  <div className="w-6 h-6 rounded-full bg-[#0A6DC0] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMethod("sms")}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-lg border-2 transition-all ${
                  method === "sms"
                    ? "border-[#0A6DC0] bg-[#0A6DC012]"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <MessageSquare className="text-[#0A6DC0] text-2xl" />
                  <span className="font-medium">SMS</span>
                </div>
                {method === "sms" && (
                  <div className="w-6 h-6 rounded-full bg-[#0A6DC0] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-bold py-6 rounded-xl"
          >
            {form.formState.isSubmitting ? (
              <>
                Sending...
                <ClipLoader size={20} color="white" />
              </>
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}