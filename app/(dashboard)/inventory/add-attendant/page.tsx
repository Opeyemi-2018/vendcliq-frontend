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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShopAttendantForm, shopAttendantSchema } from "@/types/shopAttendant";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, Lock, Mail, MoveLeft, User } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useStores } from "@/hooks/useStores";
import { useState } from "react";
import { handleAddShopAttendant } from "@/lib/utils/api/apiHelper";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

// Helper function to format validation errors
const formatValidationErrors = (errors: any[]): string => {
  if (!errors || errors.length === 0) return "Validation failed";

  return errors
    .map((error) => {
      const field = error.field || "Field";
      const message = error.message || "is invalid";
      return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${message}`;
    })
    .join(", ");
};

// Helper function to format phone number - remove country code for backend
const formatPhoneForBackend = (phone: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, "");

  // If it starts with country code (234 for Nigeria), remove it
  if (digitsOnly.startsWith("234")) {
    return digitsOnly.substring(3);
  }

  // If it starts with 0, remove it
  if (digitsOnly.startsWith("0")) {
    return digitsOnly.substring(1);
  }

  return digitsOnly;
};

const AddAttendant = () => {
  const { data: stores = [] } = useStores();
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  // store_ids is an array, so an attendant can cover more than one store.
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const router = useRouter();

  const form = useForm<ShopAttendantForm>({
    resolver: zodResolver(shopAttendantSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const toggleStoreSelection = (storeId: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId],
    );
  };

  const onSubmit = async (data: ShopAttendantForm) => {
    if (selectedStoreIds.length === 0) {
      toast.error("Select at least one store");
      return;
    }

    try {
      // Format phone number - remove country code
      const formattedPhone = formatPhoneForBackend(data.phone);

      const payload = {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        email: data.email.toLowerCase().trim(),
        phone: formattedPhone, // Send without country code
        password: data.password,
        store_ids: selectedStoreIds,
      };

      console.log("Sending payload:", payload); // Debug log

      const response = await handleAddShopAttendant(payload);

      console.log("API Response:", response); // Debug log

      if (response.status === "success") {
        toast.success(response.msg || "Shop attendant created successfully!");
        form.reset();
        setSelectedStoreIds([]);
        router.push("/inventory/my-store");
      } else {
        // Handle validation errors from the data array
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          const errorMessage = formatValidationErrors(response.data);
          toast.error(errorMessage);

          // Optionally set form errors for specific fields
          response.data.forEach((error: any) => {
            if (error.field && form.setError) {
              form.setError(error.field as any, {
                type: "manual",
                message: error.message,
              });
            }
          });
        } else {
          // Fallback to msg if no validation errors
          toast.error(response.msg || "Failed to create attendant");
        }
      }
    } catch (error: any) {
      console.error("Add attendant error:", error);

      // Extract error from response if available
      if (error.response?.data) {
        const errorData = error.response.data;

        if (
          errorData.data &&
          Array.isArray(errorData.data) &&
          errorData.data.length > 0
        ) {
          const errorMessage = formatValidationErrors(errorData.data);
          toast.error(errorMessage);

          // Set form errors
          errorData.data.forEach((err: any) => {
            if (err.field && form.setError) {
              form.setError(err.field as any, {
                type: "manual",
                message: err.message,
              });
            }
          });
        } else {
          toast.error(errorData.msg || "Failed to create attendant");
        }
      } else {
        toast.error(
          error?.message || "Failed to create attendant. Please try again.",
        );
      }
    }
  };

  const handleContinue = async () => {
    // Trigger validation for all fields
    const isValid = await form.trigger([
      "firstname",
      "lastname",
      "email",
      "phone",
      "password",
    ]);

    if (isValid) {
      // Additional check: ensure password is at least 8 characters
      const password = form.getValues("password");
      if (password.length < 8) {
        form.setError("password", {
          type: "manual",
          message: "Password must be at least 8 characters",
        });
        toast.error("Password must be at least 8 characters");
        return;
      }

      // Additional check: ensure phone is at least 10 digits (without country code)
      const phone = form.getValues("phone");
      const formattedPhone = formatPhoneForBackend(phone);
      if (formattedPhone.length < 10) {
        form.setError("phone", {
          type: "manual",
          message: "Phone number must be at least 10 digits",
        });
        toast.error("Phone number must be at least 10 digits");
        return;
      }

      setStep(2);
    } else {
      toast.error("Please fill in all required fields correctly");
    }
  };

  return (
    <div>
      <h1 className="text-[20px] md:text-[25px] font-bold text-[#2F2F2F] font-clash">
        Create Shop Attendants
      </h1>
      <p className="text-[#9E9A9A] text-[16px] font-dm-sans font-medium">
        Fill in the details below to add a new shop attendant to your store.
      </p>
      <Card className="md:p-5 mt-5 max-w-[50rem] mx-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            {step === 1 && (
              <>
                <h1 className="text-[14px] md:text-[16px] font-clash text-[#2F2F2F] font-semibold">
                  Attendant Creation
                </h1>
                <Separator
                  orientation="horizontal"
                  className="h-[1px] mt-2"
                  style={{ background: "#E0E0E0" }}
                />
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Enter first name"
                            {...field}
                            className="pl-10 bg-[#D8D8D866] h-12 border-0"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Enter last name"
                            {...field}
                            className="pl-10 bg-[#D8D8D866] h-12 border-0"
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
                      <FormLabel className="text-[#2F2F2F] font-medium text-[16px]">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                            className="pl-10 bg-[#D8D8D866] h-12 border-0"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-dm-sans font-medium text-[16px]">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <PhoneInput
                          country={"ng"}
                          value={field.value}
                          onChange={field.onChange}
                          inputStyle={{
                            width: "100%",
                            height: "48px",
                            backgroundColor: "#D8D8D866",
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
                            placeholder="Create a strong password (min. 8 characters)"
                            {...field}
                            className="pl-10 bg-[#D8D8D866] h-12 border-0"
                          />
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
                      {/* Show character count for password */}
                      <p className="text-xs text-gray-500 mt-1">
                        {field.value.length}/8 characters minimum
                      </p>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={handleContinue}
                  className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
                >
                  Continue
                </Button>
              </>
            )}

            {/* Step 2: Store Selection */}
            {step === 2 && (
              <>
                <MoveLeft
                  onClick={() => setStep(1)}
                  className="cursor-pointer"
                />
                <div>
                  <h1 className="text-[14px] md:text-[16px] font-clash text-[#2F2F2F] font-semibold">
                    Select Store you want this attendant to manage
                  </h1>
                  <Separator
                    orientation="horizontal"
                    className="h-[1px] mt-2"
                    style={{ background: "#E0E0E0" }}
                  />
                  {stores.length === 0 ? (
                    <p className="text-center text-[#9E9A9A] mt-6">
                      No stores available
                    </p>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {stores.map((store) => (
                        <div
                          key={store.id}
                          role="checkbox"
                          aria-checked={selectedStoreIds.includes(store.id)}
                          onClick={() => toggleStoreSelection(store.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                            selectedStoreIds.includes(store.id)
                              ? "border-[#0A6DC0] bg-[#0A6DC0]/10"
                              : "border-[#D8D8D866]"
                          }`}
                        >
                          <span
                            className={`w-[22px] h-[22px] rounded-full inline-flex items-center justify-center shrink-0 mt-0.5 ${
                              selectedStoreIds.includes(store.id)
                                ? "bg-[#0A6DC0]"
                                : "bg-white border-[1.6px] border-[#D2D6DC]"
                            }`}
                          >
                            {selectedStoreIds.includes(store.id) && (
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m4 12.5 5 5L20 6.5" />
                              </svg>
                            )}
                          </span>
                          <div className="min-w-0">
                          <h1 className="font-medium font-dm-sans text-[#2F2F2F]">
                            {store.name}
                          </h1>
                          <div className="flex items-center gap-1 text-[13px] text-[#9E9A9A]">
                            <p className="text-[#2F2F2F]">Inventory value:</p> ₦
                            {store.stock_value.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-[13px] text-[#9E9A9A]">
                            <p className="text-[#2F2F2F]">Product Count:</p>{" "}
                            {store.stock_count}
                          </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || selectedStoreIds.length === 0}
                  className="bg-[#0A6DC0] hover:bg-[#085a9e] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg w-full h-11 transition-all mt-6"
                >
                  {form.formState.isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      Creating Attendant...
                      <ClipLoader size={20} color="white" />
                    </span>
                  ) : (
                    "Create Attendant"
                  )}
                </Button>
              </>
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default AddAttendant;
