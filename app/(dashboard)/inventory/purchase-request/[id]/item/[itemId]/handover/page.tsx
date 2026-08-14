/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePurchaseRequestItem,
  purchaseRequestKeys,
} from "@/hooks/usePurchaseRequests";
import {
  verifyHandover,
  handleSuccessfulHandover,
} from "@/lib/utils/api/apiHelper";
import { formatNaira, formatQuantity } from "@/lib/salesFilters";
import { handoverProgress } from "@/lib/salesRows";
import { VcIcon } from "@/components/inventory/VcIcon";
import OtpBoxes from "@/components/inventory/OtpBoxes";
import ProductThumb from "@/components/inventory/ProductThumb";
import HandoverSuccessModal, {
  HandoverReceipt,
} from "@/components/inventory/HandoverSuccessModal";

type Method = "customer" | "driver";

/** Masks all but the last four digits: 0803 ••• 4417. */
/** Length of a handover code. */
const OTP_LENGTH = 4;

const maskPhone = (phone?: string | null) => {
  if (!phone) return "the customer";
  const digits = phone.replace(/\s/g, "");
  if (digits.length < 8) return digits;
  return `${digits.slice(0, 4)} ••• ${digits.slice(-4)}`;
};

export default function HandoverPage() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: item, request, isLoading } = usePurchaseRequestItem(id, itemId);

  const [method, setMethod] = useState<Method>("customer");
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<HandoverReceipt | null>(null);

  const driverCode = item?.otp_codes?.driver_otp ?? "";

  // Handover codes are four digits. Kept as a named constant rather than
  // measured off whatever string the API happened to return.
  const otpLength = OTP_LENGTH;

  React.useEffect(() => {
    setDigits(Array(otpLength).fill(""));
    setError(null);
  }, [otpLength, method]);

  const typedCode = digits.join("");
  // Only the customer flow is completable here. A driver confirms pickup in
  // the driver app, so the seller never self-reports it — that is what keeps a
  // handover report tied to the person actually collecting the goods.
  const canSubmit = typedCode.length === otpLength;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(driverCode);
      setCopied(true);
      toast.success("Code copied — read it out to the driver");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the code");
    }
  };

  const handleSubmit = async () => {
    if (method !== "customer") return;
    const code = typedCode;
    if (!code) return;

    setVerifying(true);
    setError(null);

    try {
      const response = await verifyHandover({
        item_id: itemId,
        otp: code,
        handover_type: "customer",
      });

      const ok =
        response?.status === true ||
        response?.statusCode === 200 ||
        response?.success;

      if (!ok) {
        const serverMessage = String(
          response?.message || response?.error || "",
        ).trim();
        setError(
          serverMessage ||
            "That code does not match. Ask the customer to read it again.",
        );
        setDigits(Array(otpLength).fill(""));
        return;
      }

      toast.success("Handover verified successfully!");

      // Stock only moves into the store once the handover is verified.
      const storeId = item?.attributes?.storeId;
      if (!storeId) {
        toast.error("Store information missing, could not complete stock update");
      } else {
        try {
          const stockRes = await handleSuccessfulHandover({
            item_id: itemId,
            store_id: storeId as string,
          });
          if (
            stockRes?.statusCode === 200 ||
            stockRes?.status === true ||
            stockRes?.success
          ) {
            toast.success("Item added to store successfully!");
          } else {
            toast.error(
              stockRes?.error || stockRes?.message || "Failed to add item to store",
            );
          }
        } catch (stockErr: any) {
          toast.error(
            stockErr?.response?.data?.message ||
              stockErr?.message ||
              "Failed to add item to store",
          );
        }
      }

      // Build the receipt from what we know now — the query refetch below will
      // not have landed yet, so count this item as done locally.
      const items = request?.items ?? [];
      const { total } = handoverProgress(items);
      const doneAfter =
        items.filter(
          (i: any) => i.attributes?.handover_completed || i.id === itemId,
        ).length;
      const next = items.find(
        (i: any) => i.id !== itemId && !i.attributes?.handover_completed,
      );

      setReceipt({
        itemName: item?.product?.name ?? "Item",
        quantity: formatQuantity(item?.quantity ?? 0),
        amount: formatNaira(item?.sub_total ?? 0),
        handedTo: "Customer",
        code,
        at: format(new Date(), "h:mm a"),
        done: doneAfter,
        total,
        nextItemName: next?.product?.name,
        nextItemQty: next ? formatQuantity(next.quantity) : undefined,
        saleCode: request?.code ?? "",
      });

      queryClient.invalidateQueries({
        queryKey: purchaseRequestKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: purchaseRequestKeys.all });
    } catch (err: any) {
      toast.error(
        String(
          err?.response?.data?.message || err?.message || "An error occurred",
        ),
      );
    } finally {
      setVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <ClipLoader color="#0A6DC0" size={34} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[16px] py-10 px-5 text-center max-w-[600px]">
        <div className="font-bold text-[15px] text-[#2F2F2F]">
          Item not found on this order
        </div>
      </div>
    );
  }

  const methodCard = (
    value: Method,
    title: string,
    sub: string,
    icon: React.ReactNode,
  ) => {
    const selected = method === value;
    return (
      <button
        type="button"
        {...(value === "customer" ? { "data-tour": "ho-method" } : {})}
        onClick={() => setMethod(value)}
        className={`w-full text-left cursor-pointer rounded-[14px] px-[18px] py-4 flex items-center gap-[14px] ${
          selected
            ? "border-[1.6px] border-[#0A6DC0] bg-[#F0F7FF]"
            : "border border-[#D8D8D8E6] bg-white hover:border-[#4C87EB]"
        }`}
      >
        <span
          className={`w-10 h-10 rounded-full inline-flex items-center justify-center shrink-0 ${
            selected ? "bg-[#E1EEFF]" : "bg-[#F4F6F8]"
          }`}
        >
          {icon}
        </span>
        <span className="flex-1 min-w-0">
          <span
            className={`block text-[16px] ${selected ? "font-bold text-[#0A6DC0]" : "font-semibold text-[#6E7480]"}`}
          >
            {title}
          </span>
          <span
            className={`block text-[12.5px] mt-0.5 ${selected ? "text-[#4C87EB]" : "text-[#9AA0A8]"}`}
          >
            {sub}
          </span>
        </span>
        {selected ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#0A6DC0" className="shrink-0">
            <circle cx="12" cy="12" r="11" />
            <path d="m7 12.4 3.2 3.2L17 8.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="w-[22px] h-[22px] rounded-full border-[1.6px] border-[#D2D6DC] shrink-0" />
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-[22px] max-w-[1360px]">
      <div className="flex items-start gap-[14px] flex-wrap">
        <button
          type="button"
          aria-label="Back"
          onClick={() =>
            router.push(`/inventory/purchase-request/${id}/item/${itemId}`)
          }
          className="w-[42px] h-[42px] rounded-[12px] border border-[#D8D8D8E6] bg-white cursor-pointer inline-flex items-center justify-center shrink-0 mt-1 hover:border-[#0A6DC0]"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#2F2F2F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-[260px]">
          <span className="text-[12.5px] font-bold tracking-[.4px] uppercase text-[#8E8E93]">
            Online Sales · {request?.code ?? ""}
          </span>
          <h1 className="mt-1.5 font-clash font-semibold text-[30px] tracking-[-.6px] text-[#2F2F2F]">
            Hand over product
          </h1>
          <p className="mt-[5px] text-[14px] text-[#8E8E93]">
            How would you like to hand over this item?
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-5 items-start">
        {/* ── Method picker ──────────────────────────────────────────────── */}
        <div className="flex-[1_1_330px] min-w-[300px] max-w-[430px] bg-white border border-[#E4E4E4] rounded-[20px] p-5 flex flex-col gap-[18px]">
          <div className="flex items-center gap-[13px]">
            <ProductThumb
              src={item.product?.image}
              alt={item.product?.name ?? "Product"}
              size={48}
              className="!rounded-[13px]"
            />
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-[#2F2F2F] tracking-[-.2px]">
                {item.product?.name ?? "Item"}
              </div>
              <div className="text-[13px] text-[#8E8E93] mt-[3px]">
                {formatQuantity(item.quantity)} · {formatNaira(item.sub_total)}
              </div>
            </div>
          </div>

          <div className="h-px bg-[#D8D8D899]" />

          <div className="font-clash font-semibold text-[18px] tracking-[-.3px] text-[#2F2F2F]">
            How would you like to hand over this item?
          </div>

          <div className="flex flex-col gap-3">
            {methodCard(
              "customer",
              "Customer",
              "Buyer collects the item from your shop",
              <VcIcon
                name="person"
                size={20}
                stroke={method === "customer" ? "#0A6DC0" : "#6E7480"}
                strokeWidth={1.9}
              />,
            )}
            {methodCard(
              "driver",
              "Driver",
              "Rider picks up and delivers the item",
              <VcIcon
                name="truck"
                size={20}
                stroke={method === "driver" ? "#0A6DC0" : "#6E7480"}
                strokeWidth={1.9}
              />,
            )}
          </div>
        </div>

        {/* ── Code panel ─────────────────────────────────────────────────── */}
        <div className="flex-[2_1_420px] min-w-[340px] bg-white border border-[#E4E4E4] rounded-[20px] px-[22px] pt-5 pb-[22px] flex flex-col gap-4">
          <div>
            <div className="font-clash font-semibold text-[19px] tracking-[-.3px] text-[#2F2F2F]">
              {method === "customer"
                ? "Hand over item to customer"
                : "Hand over item to driver"}
            </div>
            <div className="text-[13.5px] text-[#8E8E93] mt-[5px]">
              {method === "customer"
                ? `Ask the customer for the ${otpLength}-digit code sent to their phone.`
                : "Give the driver this code so they can confirm pickup."}
            </div>
          </div>
          <div className="h-px bg-[#D8D8D899]" />

          {method === "customer" ? (
            <div className="flex flex-col gap-[14px]">
              <span className="text-[13.5px] font-bold text-[#2F2F2F]">
                Enter the customer&apos;s code
              </span>

              <OtpBoxes
                value={digits}
                onChange={(next) => {
                  setDigits(next);
                  if (error) setError(null);
                }}
                length={otpLength}
                error={Boolean(error)}
                disabled={verifying}
              />

              {error && (
                <div className="flex items-center gap-2.5 px-[14px] py-3 rounded-[12px] bg-[#FDECEC]">
                  <VcIcon name="warning" size={18} stroke="#B3261E" strokeWidth={2.1} className="shrink-0" />
                  <span className="text-[13.5px] font-semibold text-[#B3261E]">
                    {error}
                  </span>
                </div>
              )}

              <span className="text-[13px] text-[#8E8E93]">
                The customer received this code when they paid
                {request?.customer?.phone
                  ? ` — sent to ${maskPhone(request.customer.phone)}`
                  : ""}
                .
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-[14px]">
              <span className="text-[13.5px] font-bold text-[#2F2F2F]">
                Read this code out to the driver
              </span>

              <div className="flex gap-3 flex-wrap items-center">
                {(driverCode || "----").split("").map((digit, index) => (
                  <span
                    key={index}
                    className="w-16 h-16 box-border inline-flex items-center justify-center font-clash font-semibold text-[26px] text-[#0A2540] bg-[#F4F5F7] border-[1.6px] border-[#D8D8D8E6] rounded-[12px]"
                  >
                    {digit}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!driverCode}
                  className="h-11 px-4 rounded-[11px] border border-[#D8D8D8E6] bg-white cursor-pointer text-[13.5px] font-bold text-[#2F2F2F] inline-flex items-center gap-2 ml-1 hover:border-[#0A6DC0] hover:text-[#0A6DC0] disabled:opacity-50"
                >
                  <VcIcon name="copy" size={17} strokeWidth={1.9} />
                  <span>{copied ? "Copied" : "Copy code"}</span>
                </button>
              </div>

              <div className="flex items-start gap-[11px] p-[14px] rounded-[12px] bg-[#FFF3DB]">
                <VcIcon name="clock" size={19} stroke="#85540A" strokeWidth={2} className="shrink-0 mt-px" />
                <span className="text-[13px] text-[#85540A] leading-[1.45]">
                  This code is only for the driver. They enter it in the driver
                  app to confirm pickup, do not share it with the customer.
                </span>
              </div>
            </div>
          )}

          {method === "driver" ? (
            <div className="flex items-start gap-[11px] p-[14px] rounded-[12px] bg-[#F9FCFF] border border-dashed border-[#0A6DC059]">
              <VcIcon name="check" size={19} stroke="#0A6DC0" strokeWidth={2.2} className="shrink-0 mt-px" />
              <span className="text-[13px] text-[#4B5563] leading-[1.45]">
                The driver confirms this pickup in their own app using the code
                above. Nothing further is needed from you — the item moves to
                Completed once they do.
              </span>
            </div>
          ) : verifying ? (
            <div className="w-full h-[54px] rounded-[13px] bg-[#3A6BC4] text-white font-bold text-[16px] inline-flex items-center justify-center gap-[11px]">
              <span className="w-[19px] h-[19px] rounded-full border-[2.4px] border-white/35 border-t-white animate-spin" />
              <span>Checking code…</span>
            </div>
          ) : canSubmit ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full h-[54px] border-none rounded-[13px] bg-[#0A6DC0] text-white font-bold text-[16px] cursor-pointer inline-flex items-center justify-center gap-2.5 hover:bg-[#4C87EB] active:bg-[#3A6BC4]"
            >
              <VcIcon name="check" size={19} stroke="#fff" strokeWidth={2.4} />
              <span>Complete hand-over</span>
            </button>
          ) : (
            <>
              <div className="w-full h-[54px] rounded-[13px] bg-[#BDBDBD] text-[#8E8E93] font-bold text-[16px] inline-flex items-center justify-center cursor-not-allowed">
                Complete hand-over
              </div>
              <div className="text-[12.5px] text-[#8E8E93] text-center -mt-2">
                Enter all {otpLength} digits to complete the hand-over.
              </div>
            </>
          )}
        </div>
      </div>

      <HandoverSuccessModal
        open={Boolean(receipt)}
        receipt={receipt}
        onClose={() => {
          setReceipt(null);
          router.push(`/inventory/purchase-request/${id}`);
        }}
        onNext={() => {
          const next = (request?.items ?? []).find(
            (i: any) => i.id !== itemId && !i.attributes?.handover_completed,
          );
          setReceipt(null);
          router.push(
            next
              ? `/inventory/purchase-request/${id}/item/${next.id}/handover`
              : `/inventory/purchase-request/${id}`,
          );
        }}
        onBackHome={() => {
          setReceipt(null);
          router.push("/inventory/overview");
        }}
      />
    </div>
  );
}
