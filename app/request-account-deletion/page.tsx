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
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { submitAccountDeletion } from "@/actions/accountDelete";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";

const deleteAccountSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  reason: z
    .string()
    .min(10, "Please provide a reason (at least 10 characters)")
    .max(500, "Reason is too long (max 500 characters)"),
});

type FormValues = z.infer<typeof deleteAccountSchema>;

export default function AccountDeletionPage() {
  const router = useRouter();
  const { user, getUserFullName } = useUser();

  const [isPending, startTransition] = useTransition();

  // Split full name into first + last
  const fullName = getUserFullName() || "";
  const [firstName = "", ...lastNameParts] = fullName.trim().split(/\s+/);
  const lastName = lastNameParts.join(" ") || "";

  const form = useForm<FormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      firstName: firstName || user?.firstname || "",
      lastName: lastName || user?.lastname || "",
      email: user?.email || "",
      reason: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await submitAccountDeletion({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        message: values.reason,
      });

      if (result.success) {
        toast.success("Account deletion request submitted successfully", {
          description:
            "Our team will review it shortly.",
        });

        setTimeout(() => {
          router.back();
        }, 1000);
      } else {
        toast.error(result.error || "Failed to submit request");
      }
    });
  };

  return (
    <div className="lg:max-w-[70%] mt-3 mx-auto py-4 px-4 sm:px-6">
      <div className="mb-4">
        <Button
          className="bg-[#0A6DC0] hover:bg-[#085a9e]"
          onClick={() => router.back()}
        >
          back
        </Button>
      </div>

      <div className="lg:max-w-[70%] mx-auto">
        <Card className="md:p-6">
          <h2 className="text-xl md:text-2xl font-semibold text-[#2F2F2F]">
            Delete Account
          </h2>

          <Separator className="my-2 bg-[#E0E0E0]" />

          <p className="text-[#9E9A9A] text-base mb-3">
            We&apos;re sorry to see you go. Please let us know why you&apos;re leaving so
            we can improve.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-medium">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="bg-[#F3F4F6] h-12 cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#2F2F2F] font-medium">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          className="bg-[#F3F4F6] h-12 cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2F2F2F] font-medium">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        disabled
                        className="bg-[#F3F4F6] h-12 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#2F2F2F] font-medium">
                      Reason for Deleting Your Account
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please tell us why you're leaving..."
                        className="min-h-[90px] resize-none bg-[#F3F4F6]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 10 characters. This helps us understand how we can
                      improve.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isPending || !form.formState.isValid}
                  className="bg-red-600 hover:bg-red-700 text-white px-8"
                >
                  {isPending ? (
                    <>
                      Submitting…
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "Request Account Deletion"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            This action will be reviewed by our team. Your account will remain
            active until the deletion is confirmed.
          </p>
        </Card>
      </div>
    </div>
  );
}
