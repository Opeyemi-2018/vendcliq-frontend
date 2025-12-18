"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createStoreSchema,
  CreateStoreFormData,
  CreateStoreResponse,
} from "@/types/store";
import { useState } from "react";
import PlacesAutocompleteInput from "@/hooks/googleMap";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import { handleCreateStore } from "@/lib/utils/api/apiHelper";

interface StoreProps {
  onCreateStore: (storeId: string) => void;
}

const Store: React.FC<StoreProps> = ({ onCreateStore }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateStoreFormData>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      address: {
        name: "",
        lat: 0,
        lng: 0,
      },
      phone: "",
    },
  });

  const onSubmit = async (values: CreateStoreFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Creating store with data:", values);

      // Call the API function
      const response: CreateStoreResponse = await handleCreateStore(values);

      if (response.statusCode === 200 || response.statusCode === 201) {
        const storeId = response.data.id;
        toast.success(`Store "${values.name}" created successfully!`);
        onCreateStore(storeId);
      } else {
        toast.error(
          response.error || "Failed to create store. Please try again."
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error creating store:", error);
      toast.error(error.message || "Failed to create store. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-[50rem] mx-auto">
      <h2 className="text-[16px] text-[#2F2F2F] font-semibold font-clash mb-2">
        Create Store Myself
      </h2>
      <Separator
        orientation="horizontal"
        className="h-[1px]"
        style={{ background: "#E0E0E0" }}
      />
      <p className="text-[#9E9A9A] text-[16px] mt-5 font-dm-sans font-medium">
        Let&apos;s get your store up and running
      </p>

      <div className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] font-medium">
                    Store Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter store name"
                      {...field}
                      className="bg-[#F3F4F6] h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#2F2F2F] font-medium">
                    Store Address
                  </FormLabel>
                  <FormControl>
                    <PlacesAutocompleteInput
                      placeholder="Enter store address"
                      value={field.value?.name || ""}
                      onChange={(addressData) => {
                        // Handle both string (typing) and object (place selected)
                        if (typeof addressData === "string") {
                          // User is typing - keep existing lat/lng or use 0
                          field.onChange({
                            name: addressData,
                            lat: field.value?.lat || 0,
                            lng: field.value?.lng || 0,
                          });
                        } else {
                          // User selected a place - use full object with lat/lng
                          field.onChange(addressData);
                        }
                      }}
                      className="bg-[#F3F4F6] h-12"
                    />
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
                  <FormLabel className="text-[#2F2F2F] font-medium">
                    Store Phone Number
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      country={"ng"}
                      value={field.value}
                      onChange={field.onChange}
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        backgroundColor: "#F3F4F6",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                      }}
                      containerStyle={{ width: "100%" }}
                      buttonStyle={{
                        borderRadius: "8px 0 0 8px",
                        border: "1px solid #E5E7EB",
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
             
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0A6DC0] hover:bg-[#085a9e] px-6"
              >
                {isSubmitting ? (
                  <>
                    Creating...{" "}
                    <ClipLoader size={20} color="white" className="ml-2" />
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default Store;
