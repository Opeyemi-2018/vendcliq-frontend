/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { handleUpdateTransactionPin } from "@/lib/utils/api/apiHelper";
import { UpdatePinPayload, UpdatePinResponse } from "@/types/transferPin";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";

const ChangeTransactionPin = () => {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track which input is currently focused
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const oldInputRefs = useRef<HTMLInputElement[]>([]);
  const newInputRefs = useRef<HTMLInputElement[]>([]);
  const confirmInputRefs = useRef<HTMLInputElement[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    oldInputRefs.current[0]?.focus();
  }, []);

  const renderPinInput = (
    value: string,
    setter: (val: string) => void,
    label: string,
    refs: React.MutableRefObject<HTMLInputElement[]>,
    fieldName: string,
    nextFieldSetter?: () => void
  ) => {
    return (
      <div className="mb-3 md:mb-4">
        <h3 className="text-[16px] font-medium  text-[#1E1E1E]  mb-2">
          {label}
        </h3>

        <div className="flex gap-5">
          {[0, 1, 2, 3].map((index) => {
            const isFocused =
              focusedField === fieldName && focusedIndex === index;
            const hasValue = !!value[index];

            return (
              <div key={index} className="relative text-center">
                <div
                  className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-center text-[24px] font-medium transition-all ${
                    isFocused
                      ? "border-[#0A6DC0] bg-[#0A6DC01A] ring-4 ring-[#0A6DC033] shadow-lg scale-105"
                      : hasValue
                      ? "border-[#0A6DC0] bg-[#0A6DC01A]"
                      : "border-[#D8D8D866] bg-[#F9F9F9]"
                  }`}
                >
                  {/* Show actual digit instead of bullet */}
                  <span className="text-[#0A6DC0]">{value[index] || ""}</span>
                </div>

                <input
                  ref={(el) => {
                    if (el) refs.current[index] = el;
                  }}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={value[index] || ""}
                  onChange={(e) => {
                    const digit = e.target.value.replace(/\D/g, "");
                    if (digit || e.target.value === "") {
                      const newValue =
                        value.slice(0, index) + digit + value.slice(index + 1);
                      setter(newValue.slice(0, 4));

                      // Auto-focus next digit
                      if (digit && index < 3) {
                        refs.current[index + 1]?.focus();
                      }
                      // Auto-move to next field when this one is complete
                      else if (digit && index === 3 && nextFieldSetter) {
                        nextFieldSetter();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !value[index] && index > 0) {
                      e.preventDefault();
                      refs.current[index - 1]?.focus();
                    }
                  }}
                  onFocus={(e) => {
                    e.target.select();
                    setFocusedField(fieldName);
                    setFocusedIndex(index);
                  }}
                  onBlur={() => {
                    setFocusedField(null);
                    setFocusedIndex(null);
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

  const handleSubmit = async () => {
    if (oldPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      toast.error("Each PIN must be exactly 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      toast.error("New PIN and confirmation do not match");
      return;
    }

    setIsSubmitting(true);

    const payload: UpdatePinPayload = {
      currentPin: oldPin,
      newPin,
      confirmPin,
    };

    try {
      const res: UpdatePinResponse = await handleUpdateTransactionPin(payload);
      if (res.status === "success") {
        toast.success(res.msg || "Transaction PIN updated successfully");
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
        oldInputRefs.current[0]?.focus();
      } else {
        toast.error(res.msg || "Failed to update PIN");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Error updating PIN. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {" "}
      <div className="">
        <div className="mb-4">
          <h1 className="text-[16px] font-semibold text-[#2F2F2F] font-clash">
            Change Transaction Pin{" "}
          </h1>
          <Separator
            orientation="horizontal"
            className="h-[1px] mt-3"
            style={{ background: "#E0E0E0" }}
          />
          <p className="text-[16px] font-dm-sans text-[#9E9A9A]">
            Create a new transaction Pin{" "}
          </p>
        </div>

        {/* Old PIN */}
        {renderPinInput(
          oldPin,
          setOldPin,
          "Enter Old PIN",
          oldInputRefs,
          "oldPin",
          () => newInputRefs.current[0]?.focus()
        )}

        {/* New PIN */}
        {renderPinInput(
          newPin,
          setNewPin,
          "Enter New PIN",
          newInputRefs,
          "newPin",
          () => confirmInputRefs.current[0]?.focus()
        )}

        {/* Confirm New PIN */}
        {renderPinInput(
          confirmPin,
          setConfirmPin,
          "Enter New PIN again",
          confirmInputRefs,
          "confirmPin"
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            oldPin.length !== 4 ||
            newPin.length !== 4 ||
            confirmPin.length !== 4
          }
          className="mt-6 w-full bg-[#0A6DC0] hover:bg-[#085a9e] text-white py-5 md:py-6  transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSubmitting ? (
            <>
              Updating... <ClipLoader size={24} color="white" />
            </>
          ) : (
            "Update Pin"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChangeTransactionPin;
