/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { usePurchasedInvoiceById } from "@/hooks/usePurchaseInvoices";
import { VcIcon } from "@/components/inventory/VcIcon";
import BackButton from "@/components/inventory/BackButton";
import { formatNaira } from "@/lib/salesFilters";
import { formatQty } from "@/lib/priceInput";

const statusTone = (status: string) => {
  const value = (status || "").toUpperCase();
  if (value === "COMPLETED" || value === "PAID")
    return { bg: "#E7F4EB", fg: "#003909", label: "Completed" };
  if (value === "PENDING")
    return { bg: "#FFF3DB", fg: "#85540A", label: "Pending" };
  return { bg: "#F4F5F7", fg: "#6B6B70", label: value || "Unknown" };
};

const when = (iso: string) => {
  try {
    return format(new Date(iso), "d MMM yyyy · h:mm a");
  } catch {
    return "—";
  }
};

const imgSrc = (src?: string | null) =>
  src ? (src.startsWith("//") ? `https:${src}` : src) : null;

const PurchasedInvoiceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: invoice, isLoading, error, refetch } =
    usePurchasedInvoiceById(id);

  const navigateToItemDetail = (item: any) => {
    if (!item?.id) return;

    const queryParams = new URLSearchParams();
    queryParams.set("delivery", item.delivery?.toString() ?? "");
    queryParams.set("productName", encodeURIComponent(item.product.name));
    queryParams.set("quantity", item.quantity.toString());
    queryParams.set("cost", item.cost.toString());
    queryParams.set("price", item.stock.price.toString());
    queryParams.set("subTotal", item.sub_total.toString());
    queryParams.set("profit", item.profit?.toString() ?? "0");

    if (item.product.image) {
      queryParams.set("productImage", encodeURIComponent(item.product.image));
    }
    queryParams.set(
      "sku",
      encodeURIComponent(item.product.name || item.stock.sku || ""),
    );
    if (item.mode) queryParams.set("mode", item.mode);
    if (item.otp_codes?.driver_otp) {
      queryParams.set("driverOtp", item.otp_codes.driver_otp);
    }
    if (item.otp_codes?.customer_otp) {
      queryParams.set("customerOtp", item.otp_codes.customer_otp);
    }

    router.push(`/my-purchase/item/${item.id}?${queryParams.toString()}`);
  };

  if (error) {
    return (
      <div className="font-dm-sans max-w-[900px]">
        <div className="bg-white border border-[#D8D8D8B3] rounded-[16px] p-8 text-center">
          <p className="text-[#C0392B] text-[14px]">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 h-11 px-5 rounded-[12px] border-none bg-[#0A6DC0] text-white font-bold text-[14px] cursor-pointer hover:bg-[#09599A]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const tone = statusTone(invoice?.status ?? "");

  const HEAD =
    "text-left whitespace-nowrap px-4 py-3 text-[11.5px] font-bold tracking-[.5px] uppercase text-[#8E8E93]";
  const CELL = "px-4 py-3 text-[13.5px] text-[#2F2F2F] whitespace-nowrap";

  return (
    <div className="font-dm-sans text-[#2F2F2F] flex flex-col gap-[18px] max-w-[900px]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-[14px] flex-wrap">
        <BackButton className="mt-1" />
        <div className="flex-1 min-w-[200px]">
          <h1 className="font-clash font-semibold text-[22px] md:text-[28px] tracking-[-.6px] m-0 break-all">
            {isLoading ? "Loading…" : (invoice?.code ?? "Purchase")}
          </h1>
          <p className="text-[14.5px] text-[#8E8E93] mt-[5px] m-0">
            The items on this purchase.
          </p>
        </div>
      </div>

      {/* ── Summary ────────────────────────────────────────────────────── */}
      <section className="bg-white border border-[#D8D8D8B3] rounded-[18px] p-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <ClipLoader size={28} color="#0A6DC0" />
          </div>
        ) : invoice ? (
          <div className="grid gap-x-6 gap-y-4 grid-cols-2 sm:grid-cols-4">
            <div>
              <div className="text-[11.5px] font-bold tracking-[.5px] uppercase text-[#8E8E93]">
                Products
              </div>
              <div className="font-clash font-bold text-[19px] tracking-[-.3px] mt-1">
                {invoice.items_count}
              </div>
            </div>
            <div>
              <div className="text-[11.5px] font-bold tracking-[.5px] uppercase text-[#8E8E93]">
                Total
              </div>
              <div className="font-clash font-bold text-[19px] tracking-[-.3px] mt-1">
                {formatNaira(invoice.total)}
              </div>
            </div>
            <div>
              <div className="text-[11.5px] font-bold tracking-[.5px] uppercase text-[#8E8E93]">
                Bought
              </div>
              <div className="text-[13.5px] mt-1.5">
                {when(invoice.created_at)}
              </div>
            </div>
            <div>
              <div className="text-[11.5px] font-bold tracking-[.5px] uppercase text-[#8E8E93]">
                Status
              </div>
              <span
                className="inline-block mt-1.5 text-[11.5px] font-bold px-[10px] py-[3px] rounded-full"
                style={{ background: tone.bg, color: tone.fg }}
              >
                {tone.label}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-[#8E8E93] text-[13.5px] py-6">
            Purchase not found
          </p>
        )}
      </section>

      {/* ── Items ──────────────────────────────────────────────────────── */}
      <section className="bg-white border border-[#D8D8D8B3] rounded-[18px] overflow-hidden">
        <div className="px-5 pt-[18px] pb-3.5">
          <h2 className="font-clash font-semibold text-[17px] tracking-[-.3px] m-0">
            Items on this purchase
          </h2>
          <p className="text-[13px] text-[#8E8E93] mt-1 m-0">
            Tap any item to see its delivery and codes.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-14">
            <ClipLoader size={30} color="#0A6DC0" />
          </div>
        ) : invoice && invoice.items.length > 0 ? (
          /* The table keeps every column; narrow screens scroll it sideways
             rather than dropping information. */
          <div className="overflow-x-auto border-t border-[#D8D8D873]">
            <table className="w-full min-w-[620px] border-collapse">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className={HEAD}>Product</th>
                  <th className={HEAD}>Unit price</th>
                  <th className={HEAD}>Qty</th>
                  <th className={HEAD}>Amount</th>
                  <th className={HEAD}>Status</th>
                  <th className={`${HEAD} w-px`} aria-label="Open" />
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any) => {
                  const src = imgSrc(item.product?.image);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigateToItemDetail(item)}
                      className="border-t border-[#D8D8D873] cursor-pointer hover:bg-[#F9FCFF]"
                    >
                      <td className={`${CELL} !whitespace-normal`}>
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span className="w-10 h-10 rounded-[10px] bg-[#F4F6F8] border border-[#D8D8D873] shrink-0 overflow-hidden inline-flex items-center justify-center">
                            {src ? (
                              <Image
                                src={src}
                                alt={item.product?.name ?? "Product"}
                                width={40}
                                height={40}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <VcIcon name="bottle" size={18} stroke="#6E7480" />
                            )}
                          </span>
                          <span className="font-semibold truncate max-w-[190px]">
                            {item.product?.name ?? "Product"}
                          </span>
                        </span>
                      </td>
                      <td className={CELL}>{formatNaira(item.stock?.price ?? 0)}</td>
                      <td className={CELL}>{formatQty(item.quantity)}</td>
                      <td className={`${CELL} font-bold`}>
                        {formatNaira(item.cost ?? 0)}
                      </td>
                      <td className={CELL}>
                        <span
                          className="inline-block text-[11.5px] font-bold px-[10px] py-[3px] rounded-full"
                          style={{ background: tone.bg, color: tone.fg }}
                        >
                          {tone.label}
                        </span>
                      </td>
                      <td className={CELL}>
                        <VcIcon
                          name="chevron"
                          size={18}
                          stroke="#B9BCC2"
                          strokeWidth={2.4}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-[#8E8E93] text-[13.5px] py-10">
            No items on this purchase
          </p>
        )}
      </section>
    </div>
  );
};

export default PurchasedInvoiceDetailPage;
