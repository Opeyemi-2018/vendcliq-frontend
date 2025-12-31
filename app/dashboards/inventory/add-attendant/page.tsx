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
import { Lock, Mail, MoveLeft, User } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useStores } from "@/hooks/useStores";
import { useState } from "react";
import { handleAddShopAttendant } from "@/lib/utils/api/apiHelper";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

const AddAttendant = () => {
  const { stores } = useStores();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null); // Only one selected at a time
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
    setSelectedStoreId((prev) => (prev === storeId ? null : storeId)); // Deselect if same, else select new
  };

  const onSubmit = async (data: ShopAttendantForm) => {
    if (!selectedStoreId) {
      toast.error("Please select a store");
      return;
    }

    try {
      const payload = {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.startsWith("+") ? data.phone : `+${data.phone}`,
        password: data.password,
        store_ids: [selectedStoreId], // Only the selected store ID
      };

      const response = await handleAddShopAttendant(payload);

      if (response.status === "success") {
        toast.success(
          response.message || "Shop attendant created successfully!"
        );
        form.reset();
        setSelectedStoreId(null);

        router.push("/dashboards/inventory/my-store");
      } else {
        toast.error(response.message || "Failed to create attendant");
      }
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to create attendant. Please try again."
      );
      console.error("Add attendant error:", error);
    }
  };

  const handleContinue = async () => {
    const isValid = await form.trigger([
      "firstname",
      "lastname",
      "email",
      "phone",
      "password",
    ]);

    if (isValid) {
      setStep(2);
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
      <Card className="p-5 mt-5 max-w-[50rem] mx-auto">
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
                            type="password"
                            placeholder="Create a strong password"
                            {...field}
                            className="pl-10 bg-[#D8D8D866] h-12 border-0"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
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
                <MoveLeft onClick={() => setStep(1)} />
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
                          onClick={() => toggleStoreSelection(store.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedStoreId === store.id
                              ? "border-[#0A6DC0] bg-[#0A6DC0]/10"
                              : "border-[#D8D8D866]"
                          }`}
                        >
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
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !selectedStoreId}
                  className="bg-[#0A6DC0] hover:bg-[#085a9e] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg w-full h-11 transition-all mt-6"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      Creating Attendant...
                      <ClipLoader size={24} color="white" />
                    </>
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
