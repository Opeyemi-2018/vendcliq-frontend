"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { type SignupFormData } from "@/types/auth";
import { toast } from "sonner";
import ProgressHeader from "./ProgressHeader";
import { Input } from "@/components/ui/Input";
import PlacesAutocompleteInput from "@/hooks/googleMap"; 

interface Props {
  onNext: (data: Partial<SignupFormData>) => void;
  data: SignupFormData;
}


export default function Step7({ onNext, data }: Props) {
  const [businessName, setBusinessName] = useState(data.businessName || "");
  const [businessAddress, setBusinessAddress] = useState(
    data.businessAddress || ""
  );

  const [logoFile, setLogoFile] = useState<File | null>(
    (data.uploadedLogo as File) || null
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    data.uploadedLogoPreview || null
  );

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleContinue = () => {
    if (!businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    if (businessAddress.trim().split(/\s+/).filter(Boolean).length < 3) {
      toast.error("Please enter a complete business address");
      return;
    }

    onNext({
      businessName,
      businessAddress,
      uploadedLogo: logoFile,
      uploadedLogoPreview: logoPreview,
    });
    toast.success("Business details saved!");
  };

  return (
    <div>
      <ProgressHeader currentStep={7} />

      <h1 className="text-[22px] font-semibold mb-3 font-clash">
        Business Details
      </h1>
      <p className="text-[#9E9A9A] mb-8">
        Tell us about your business so we can set everything up perfectly
      </p>

      <div className="mb-8">
        <label className="block text-[#2F2F2F] font-medium mb-3">
          Business Logo (Optional)
        </label>
        <div className="relative">
          {logoPreview ? (
            <div className="relative inline-block w-full">
              <Image
                src={logoPreview}
                alt="Business logo"
                width={120}
                height={120}
                className="rounded-xl w-full h-[100px] border-2 border-dashed border-gray-300 object-cover"
                unoptimized
              />
              <button
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#D8D8D8] rounded-xl cursor-pointer hover:border-[#0A6DC0] transition">
              <Upload className="w-8 h-8 text-[#9E9A9A] mb-2" />
              <span className="text-sm text-[#9E9A9A]">
                Click to upload logo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-xs text-[#9E9A9A] mt-2">Max 2MB, PNG or JPG</p>
      </div>

      <div className="mb-6">
        <label className="block text-[#2F2F2F] font-medium mb-2">
          Business Name
        </label>
        <Input
          type="text"
          placeholder="Enter your business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="h-12 bg-[#D8D8D866] border-0"
        />
      </div>

      <div className="mb-8">
        <label className="block text-[#2F2F2F] font-medium mb-2">
          Business Address
        </label>
        <PlacesAutocompleteInput
          value={businessAddress}
          onChange={(value) => {
            if (typeof value === "string") {
              setBusinessAddress(value);
            } else {
              setBusinessAddress(value.formatted_address || "");
            }
          }}
          placeholder="Enter full business address"
          className="bg-[#D8D8D866] h-12 border-0"
        />
      </div>

      <Button
        onClick={handleContinue}
        className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white font-semibold py-6 rounded-xl"
      >
        Continue
      </Button>
    </div>
  );
}