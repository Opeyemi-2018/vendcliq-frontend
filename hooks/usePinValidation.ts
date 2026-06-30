import { useState } from "react";
import { toast } from "sonner";
import { handleValidatePin } from "@/lib/utils/api/apiHelper";

export function usePinValidation() {
  const [retriesLeft, setRetriesLeft] = useState<number | null>(null);

  const validatePin = async (pin: string): Promise<string | null> => {
    const res = await handleValidatePin({ pin });

    if (res.status === "success" && res.data?.validated) {
      setRetriesLeft(null);
      return res.data.pinToken ?? null;
    }

    const left = res.data?.retriesLeft;
    setRetriesLeft(left ?? null);

    if (left === 0) {
      toast.error("PIN blocked. Please contact support.");
    } else {
      toast.error(
        left !== undefined
          ? `${res.msg} ${left} of 5 attempt${left !== 1 ? "s" : ""} left.`
          : res.msg || "Invalid PIN",
      );
    }

    return null;
  };

  const resetRetries = () => setRetriesLeft(null);

  return { validatePin, retriesLeft, resetRetries };
}
