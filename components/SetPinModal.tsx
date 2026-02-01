/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";
import {
  handleRequestPinToken,
  handleCreatePin,
} from "@/lib/utils/api/apiHelper";
import { X } from "lucide-react";
import { ClipLoader } from "react-spinners";

export default function SetPinOverlay() {
  const { hasPin } = useUser();

  const [showOverlay, setShowOverlay] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const otpRefs = useRef<HTMLInputElement[]>([]);
  const pinRefs = useRef<HTMLInputElement[]>([]);
  const confirmRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (showOverlay) {
      otpRefs.current[0]?.focus();
    }
  }, [showOverlay]);

  const renderPinBoxes = (
    value: string,
    setter: (val: string) => void,
    label: string,
    refs: React.MutableRefObject<HTMLInputElement[]>,
    fieldName: string,
    length: number = 4,
    size: "normal" | "small" = "normal", // ← new param
    nextFocus?: () => void,
  ) => {
    // Define size classes
    const boxSizeClass =
      size === "small"
        ? "w-10 h-10 sm:w-12 sm:h-12 text-[18px] sm:text-[20px]"
        : "w-14 h-14 sm:w-16 sm:h-16 text-[22px] sm:text-[24px]";

    return (
      <div className="mb-6">
        <h3 className="text-[13px] md:text-[16px] font-medium text-[#1E1E1E] mb-3">
          {label}
        </h3>

        <div className="flex gap-2 sm:gap-5 ">
          {Array.from({ length }).map((_, index) => {
            const isFocused = refs.current[index] === document.activeElement;
            const hasValue = !!value[index];

            return (
              <div key={index} className="relative">
                <div
                  className={`border-2 rounded-xl flex items-center justify-center font-medium transition-all duration-200 ${boxSizeClass} ${
                    isFocused
                      ? "border-[#0A6DC0] bg-[#0A6DC01A] ring-4 ring-[#0A6DC033] shadow-lg scale-105"
                      : hasValue
                        ? "border-[#0A6DC0] bg-[#0A6DC01A]"
                        : "border-[#D8D8D866] bg-[#F9F9F9]"
                  }`}
                >
                  <span className="text-[#0A6DC0]">{value[index] || ""}</span>
                </div>

                <input
                  ref={(el) => {
                    if (el) {
                      refs.current[index] = el;
                    }
                  }}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={value[index] || ""}
                  onChange={(e) => {
                    const digit = e.target.value.replace(/\D/g, "");
                    if (digit || e.target.value === "") {
                      const newVal =
                        value.slice(0, index) + digit + value.slice(index + 1);
                      setter(newVal.slice(0, length));

                      if (digit && index < length - 1) {
                        refs.current[index + 1]?.focus();
                      } else if (digit && index === length - 1 && nextFocus) {
                        nextFocus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !value[index] && index > 0) {
                      e.preventDefault();
                      refs.current[index - 1]?.focus();
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-text"
                  autoComplete="off"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const requestCode = async () => {
    setIsRequesting(true);
    try {
      const res = await handleRequestPinToken();
      if (res.status === "success") {
        toast.success("Verification code sent to your email");
        setShowOverlay(true);
      } else {
        toast.error(res.msg || "Failed to request code");
      }
    } catch {
      toast.error("Network error – please try again");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (otp.length < 6) {
      toast.error("Please enter the full OTP");
      return;
    }
    if (pin.length !== 4 || confirmPin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { otp, pin, confirmPin };
      const res = await handleCreatePin(payload);

      if (res.status === "success") {
        toast.success("Transaction PIN created successfully!");
        setShowOverlay(false);
        setOtp("");
        setPin("");
        setConfirmPin("");
      } else {
        toast.error(res.msg || "Failed to set PIN");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Error setting PIN");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasPin) return null;

  return (
    <>
      {/* Button in header */}
      <button
        className="text-[#0A6DC0] hover:text-[#0A6DC0]/40 font-dm-sans font-bold"
        onClick={requestCode}
        disabled={isRequesting}
      >
        {isRequesting ? "Requesting..." : "Create Pin"}
      </button>

      {/* Full-screen centered overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowOverlay(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors z-10"
              disabled={isSubmitting}
              aria-label="Close PIN setup"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="p-6 sm:p-8 pt-14">
              <h2 className="text-[22px] md:text-[25px] font-semibold text-[#2F2F2F] font-clash text-center">
                Set Transaction Pin
              </h2>
              <p className="text-center text-[#9E9A9A] text-[15px] font-dm-sans mb-3">
                To proceed with transaction, please set your transaction pin
              </p>
              {/* OTP - 6 boxes, SMALL size */}
              {renderPinBoxes(
                otp,
                setOtp,
                "Enter OTP ",
                otpRefs,
                "otp",
                6,
                "small", // ← smaller boxes
                () => pinRefs.current[0]?.focus(),
              )}
              {renderPinBoxes(
                pin,
                setPin,
                "Enter New PIN",
                pinRefs,
                "pin",
                4,
                "normal", // ← or omit since default is "normal"
                () => confirmRefs.current[0]?.focus(),
              )}
              {renderPinBoxes(
                confirmPin,
                setConfirmPin,
                "Enter New PIN again",
                confirmRefs,
                "confirmPin",
                4,
                "normal",
              )}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white py-5 md:py-6"
              >
                {isSubmitting ? (
                  <>
                    Setting
                    <ClipLoader size={24} color="white" />
                  </>
                ) : (
                  "Set Transaction PIN"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
