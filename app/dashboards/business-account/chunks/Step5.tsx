/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Upload, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import {
  governmentIdSchema,
  type GovernmentIdData,
  ID_TYPE_LABELS,
} from "@/types/business";
import { handleSubmitBusinessVerification } from "@/lib/utils/api/apiHelper";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Lottie from "lottie-react";
import animationData from "@/public/animate.json";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

interface Props {
  onNext: () => void;
  onPrev: () => void;
  cacData: any;
}

export default function Step5({ onPrev, cacData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [idImagePreview, setIdImagePreview] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<GovernmentIdData>({
    resolver: zodResolver(governmentIdSchema),
    defaultValues: {
      idType: "votersCardId",
      idNumber: "",
    },
  });

  const selectedIdType = form.watch("idType");

 const onSubmit = async (values: GovernmentIdData) => {
  setIsLoading(true);

  const isRegistered = cacData?.isRegistered === "register";

  const formData = new FormData();

  formData.append("isRegistered", isRegistered ? "true" : "false");

  if (isRegistered) {
    if (cacData?.cacNumber) {
      formData.append("cacNumber", cacData.cacNumber.trim());
    }
    if (cacData?.cacApplicationDocumentsImage) {
      formData.append("cacApplicationDocumentsImage", cacData.cacApplicationDocumentsImage);
    }
    if (cacData?.memartImage) {
      formData.append("memartImage", cacData.memartImage);
    }
  }

  const idNumber = values.idType === "ninId"
    ? values.idNumber.replace(/\D/g, "")
    : values.idNumber.trim();

  if (values.idType === "ninId") {
    formData.append("ninId", idNumber);
    formData.append("ninImage", values.idImage);
  } else if (values.idType === "votersCardId") {
    formData.append("votersCardId", idNumber);
    formData.append("votersCardImage", values.idImage);
  } else if (values.idType === "driversLicenseId") {
    formData.append("driversLicenseId", idNumber);
    formData.append("driversLicenseImage", values.idImage);
  } else if (values.idType === "internationalPassportId") {
    formData.append("internationalPassportId", idNumber);
    formData.append("internationalPassportImage", values.idImage);
  }

  try {
    const response = await handleSubmitBusinessVerification(formData);

    if (response.status === "success") {
      toast.success("Verification completed!");
      localStorage.removeItem("businessSignupProgress");
      setShowSuccess(true);
    } else {
      toast.error(response.msg || "Validation failed");
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    toast.error("Upload failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-[16px] text-[#2F2F2F] font-clash font-semibold ">
            Government Issued ID
          </h2>
          <p className="text-[#9E9A9A] text-[14px] mb-2">
            Select and upload your government-issued ID for verification
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
              name="idType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select ID Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#D8D8D866] h-12 border-0">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="votersCardId">
                        Voter&apos;s Card
                      </SelectItem>
                      <SelectItem value="ninId">NIN</SelectItem>
                      <SelectItem value="driversLicenseId">
                        Driver&apos;s License
                      </SelectItem>
                      <SelectItem value="internationalPassportId">
                        International Passport
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter ID Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Enter your ${ID_TYPE_LABELS[selectedIdType]} number`}
                      {...field}
                      className="bg-[#D8D8D866] h-12 border-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload {ID_TYPE_LABELS[selectedIdType]}</FormLabel>
                  <FormControl>
                    {idImagePreview ? (
                      <div className="relative">
                        <Image
                          src={idImagePreview}
                          alt="ID Document"
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover rounded-xl border-2 border-gray-300"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIdImagePreview(null);
                            field.onChange(undefined);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#D8D8D8] rounded-xl cursor-pointer hover:border-[#0A6DC0] transition mt-2">
                        <Upload className="w-8 h-8 text-[#9E9A9A] mb-2" />
                        <span className="text-sm text-[#9E9A9A]">
                          Click to upload {ID_TYPE_LABELS[selectedIdType]}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("Image must be less than 5MB");
                              return;
                            }
                            field.onChange(file);
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              setIdImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  Creating Account...
                  <ClipLoader size={20} color="white" />
                </>
              ) : (
                "Continue"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </form>
        </Form>
      </div>

      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="text-center w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px]">
          <AlertDialogHeader>
            <Lottie
              animationData={animationData}
              loop
              className="w-64 h-64 mx-auto"
            />
            <AlertDialogTitle className="text-[20px] lg:text-[25px] font-semibold mb-10 font-clash text-center">
              Business Account Created Successfully
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccess(false);
                router.push("/dashboards/account/overview");
              }}
              className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
            >
              Back to Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
