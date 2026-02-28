"use client";

import { useState } from "react";
import { ChevronLeft, Upload, X, SquareCheck, SquareX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { toast } from "sonner";

interface Step4Data {
  isRegistered: "register" | "notRegistered";
  cacNumber: string;
  cacApplicationDocumentsImage: File | null;
  memartImage: File | null;
}

interface Props {
  onNext: (data: Step4Data) => void;
  onPrev: () => void;
}

export default function Step4({ onNext, onPrev }: Props) {
  const [isRegistered, setIsRegistered] = useState<
    "register" | "notRegistered"
  >("register");
  const [cacNumber, setCacNumber] = useState("");
  const [cacDoc, setCacDoc] = useState<File | null>(null);
  const [cacDocPreview, setCacDocPreview] = useState<string | null>(null);
  const [memart, setMemart] = useState<File | null>(null);
  const [memartPreview, setMemartPreview] = useState<string | null>(null);

  const handleFile = (
    file: File | null,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be less than 5MB");
      return;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProceed = () => {
    if (isRegistered === "register" && !cacNumber.trim()) {
      toast.error("CAC number is required");
      return;
    }
    if (isRegistered === "register" && !cacDoc) {
      toast.error("CAC document is required");
      return;
    }

    onNext({
      isRegistered, // ← This is correct now
      cacNumber: isRegistered === "register" ? cacNumber.trim() : "",
      cacApplicationDocumentsImage: cacDoc,
      memartImage: memart,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] text-[#2F2F2F] font-clash font-semibold">
          Business Registration
        </h2>
        <p className="text-[#9E9A9A] text-[14px] mb-2">
          Tell us your business status so we can set up the right access for
          you.
        </p>
        <Separator className="h-[1px] bg-[#E0E0E0]" />
      </div>

      {/* Registration Status */}
      <div>
        <h1 className="mb-3 text-[16px] font-dm-sans text-[#2F2F2F]">
          Is your business registered?
        </h1>
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <Label
            onClick={() => setIsRegistered("register")}
            className={`w-full flex items-center justify-between py-5 px-4 rounded-2xl border-2 cursor-pointer transition-all ${
              isRegistered === "register"
                ? "border-[#0A6DC012] bg-[#0A6DC012]"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {isRegistered === "register" ? (
                <SquareCheck color="#2F2F2F" />
              ) : (
                <SquareX color="#9E9A9A" />
              )}
              <h3
                className={`text-[16px] font-medium ${
                  isRegistered === "register"
                    ? "text-[#2F2F2F]"
                    : "text-[#9E9A9A]"
                }`}
              >
                My business is registered
              </h3>
            </div>
            {isRegistered === "register" ? (
              <Image src="/checkbox.svg" width={20} height={20} alt="checked" />
            ) : (
              <Image src="/border.svg" width={16} height={16} alt="unchecked" />
            )}
          </Label>

          <Label
            onClick={() => setIsRegistered("notRegistered")}
            className={`w-full flex items-center justify-between py-5 px-4 rounded-2xl border-2 cursor-pointer transition-all ${
              isRegistered === "notRegistered"
                ? "border-[#0A6DC012] bg-[#0A6DC012]"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {isRegistered === "notRegistered" ? (
                <SquareCheck color="#2F2F2F" />
              ) : (
                <SquareX color="#9E9A9A" />
              )}
              <h3
                className={`text-[16px] font-medium ${
                  isRegistered === "notRegistered"
                    ? "text-[#2F2F2F]"
                    : "text-[#9E9A9A]"
                }`}
              >
                My business is not registered
              </h3>
            </div>
            {isRegistered === "notRegistered" ? (
              <Image src="/checkbox.svg" width={20} height={20} alt="checked" />
            ) : (
              <Image src="/border.svg" width={16} height={16} alt="unchecked" />
            )}
          </Label>
        </div>
      </div>

      {/* CAC Form - Only if registered */}
      {isRegistered === "register" && (
        <>
          <div>
            <Label>CAC Number</Label>
            <Input
              placeholder="Enter your CAC number"
              value={cacNumber}
              onChange={(e) => setCacNumber(e.target.value)}
              className="mt-2 bg-[#D8D8D866] h-12 border-0"
            />
          </div>

          <div>
            <Label>Upload CAC Document</Label>
            {cacDocPreview ? (
              <div className="relative">
                <Image width={100} height={100}
                  src={cacDocPreview}
                  alt="CAC"
                  className="w-full h-48 object-cover rounded-xl border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCacDoc(null);
                    setCacDocPreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#D8D8D8] rounded-xl cursor-pointer hover:border-[#0A6DC0] transition mt-2">
                <Upload className="w-8 h-8 text-[#9E9A9A] mb-2" />
                <span className="text-sm text-[#0A6DC0]">
                  Click to upload CAC document
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFile(e.target.files?.[0] ?? null, setCacDoc, setCacDocPreview)
                  }
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <Label>Upload Memart (Optional)</Label>
            {memartPreview ? (
              <div className="relative">
                <Image width={100} height={100}
                  src={memartPreview}
                  alt="Memart"
                  className="w-full h-48 object-cover rounded-xl border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMemart(null);
                    setMemartPreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#D8D8D8] rounded-xl cursor-pointer hover:border-[#0A6DC0] transition mt-2">
                <Upload className="w-8 h-8 text-[#9E9A9A] mb-2" />
                <span className="text-sm text-[#0A6DC0] font-inter">
                  Click to upload Memart
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    handleFile(e.target.files?.[0] ?? null, setMemart, setMemartPreview)
                  }
                  className="hidden"
                />
              </label>
            )}
          </div>
        </>
      )}

      <Button
        onClick={handleProceed}
        className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6"
      >
        Continue
      </Button>

      <Button variant="outline" onClick={onPrev}>
        <ChevronLeft className="w-4 h-4 mr-2" /> Back
      </Button>
    </div>
  );
}
