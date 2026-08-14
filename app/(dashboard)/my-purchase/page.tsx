"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ClipLoader } from "react-spinners";
import { usePurchasedInvoices } from "@/hooks/usePurchaseInvoices";
import { VcIcon } from "@/components/inventory/VcIcon";
import BackButton from "@/components/inventory/BackButton";
import { formatNaira } from "@/lib/salesFilters";
import type { PurchasedInvoice } from "@/types/purchase";

/** Same three tones the sales screens use for a status. */
const statusTone = (status: string) => {
  const value = (status || "").toUpperCase();
  if (value === "COMPLETED" || value === "PAID")
    return { bg: "#E7F4EB", fg: "#003909", label: "Completed" };
  if (value === "PENDING")
    return { bg: "#FFF3DB", fg: "#85540A", label: "Pending" };
  return { bg: "#F4F5F7", fg: "#6B6B70", label: value || "Unknown" };
};

const time = (iso: string) => {
  try {
    return format(new Date(iso), "d MMM · h:mm a");
  } catch {
    return "—";
  }
};

const PurchasedInvoicesPage = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data: invoices = [], isLoading, error, refetch } =
    usePurchasedInvoices();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((invoice: PurchasedInvoice) =>
      [
        invoice.code,
        invoice.status,
        String(invoice.total),
        invoice.attributes?.supplier ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [invoices, query]);

  const totalSpend = useMemo(
    () => rows.reduce((sum: number, r: PurchasedInvoice) => sum + (r.total || 0), 0),
    [rows],
  );

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

  return (
    <div className="font-dm-sans text-[#2F2F2F] flex flex-col gap-[18px] max-w-[900px]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-[14px] flex-wrap">
        <BackButton className="mt-1" />
        <div className="flex-1 min-w-[200px]">
          <h1 className="font-clash font-semibold text-[24px] md:text-[30px] tracking-[-.6px] m-0">
            My Purchases
          </h1>
          <p className="text-[14.5px] text-[#8E8E93] mt-[5px] m-0">
            Everything you bought, and what is still on its way.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/add-purchase")}
          className="shrink-0 mt-1 inline-flex items-center gap-2 h-11 px-4 sm:px-[18px] rounded-[12px] border-none bg-[#0A6DC0] cursor-pointer text-[14px] font-bold text-white whitespace-nowrap hover:bg-[#09599A]"
        >
          <VcIcon name="plus" size={18} stroke="#fff" strokeWidth={2.4} />
          <span>Upload Purchase</span>
        </button>
      </div>

      {/* ── Spend summary ──────────────────────────────────────────────── */}
      <section className="relative rounded-[20px] px-5 sm:px-6 py-[18px] sm:py-[22px] text-white bg-[linear-gradient(135deg,#0A6DC0_0%,#3A6BC4_100%)] shadow-[0_12px_28px_-10px_rgba(10,109,192,.45)] overflow-hidden">
        <div className="absolute -top-[70px] -right-[50px] w-[220px] h-[220px] rounded-full bg-white/[.06] pointer-events-none" />
        <div className="relative">
          <div className="text-[13px] text-white/85">Total purchases</div>
          <div className="font-clash font-bold text-[28px] sm:text-[34px] tracking-[-.8px] mt-1">
            {formatNaira(totalSpend)}
          </div>
          <div className="text-[13px] text-white/80 mt-1">
            {rows.length} {rows.length === 1 ? "invoice" : "invoices"}
          </div>
        </div>
      </section>

      {/* ── Search ─────────────────────────────────────────────────────── */}
      <label className="w-full flex items-center gap-[10px] h-12 px-[14px] box-border rounded-[10px] border border-[#D8D8D8E6] bg-white">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search invoice, supplier or amount"
          className="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] text-[#2F2F2F]"
        />
      </label>

      {/* ── Rows ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <ClipLoader size={34} color="#0A6DC0" />
            <p className="text-[13px] text-[#8E8E93]">Loading purchases…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[16px] py-12 px-5 text-center">
            <div className="font-bold text-[15px] text-[#2F2F2F]">
              {query ? "No purchases match this search" : "No purchases yet"}
            </div>
            <div className="text-[13px] text-[#8E8E93] mt-1">
              {query
                ? "Try another invoice code or supplier."
                : "Upload a purchase and it will show here."}
            </div>
          </div>
        ) : (
          rows.map((invoice: PurchasedInvoice) => {
            const tone = statusTone(invoice.status);
            return (
              <button
                key={invoice.id}
                type="button"
                onClick={() => router.push(`/my-purchase/${invoice.id}`)}
                className="w-full text-left bg-white border border-[#D8D8D88C] rounded-[16px] px-3 sm:px-[18px] py-3 sm:py-[14px] flex items-center gap-2.5 sm:gap-[14px] cursor-pointer transition hover:border-[#0A6DC0]"
              >
                <span className="w-10 h-10 sm:w-[46px] sm:h-[46px] rounded-[12px] sm:rounded-[14px] bg-[#E8EEFF] inline-flex items-center justify-center shrink-0">
                  <VcIcon name="truck" size={22} stroke="#4052A3" strokeWidth={1.9} />
                </span>

                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-[14px] sm:text-[15px] tracking-[-.2px] truncate">
                      {invoice.code}
                    </span>
                    <span
                      className="shrink-0 text-[10.5px] font-bold tracking-[.4px] uppercase px-2 py-[3px] rounded-full"
                      style={{ background: tone.bg, color: tone.fg }}
                    >
                      {tone.label}
                    </span>
                  </span>
                  <span className="block text-[12px] sm:text-[12.5px] text-[#8E8E93] mt-[3px] truncate">
                    {invoice.attributes?.supplier
                      ? `${invoice.attributes.supplier} · `
                      : ""}
                    {time(invoice.created_at)}
                  </span>
                </span>

                <span className="text-right shrink-0">
                  <span className="block font-clash font-bold text-[15px] sm:text-[17px] tracking-[-.3px] whitespace-nowrap">
                    {formatNaira(invoice.total)}
                  </span>
                  <span className="block text-[11.5px] text-[#8E8E93] mt-0.5 whitespace-nowrap">
                    {invoice.items_count ?? 0}{" "}
                    {(invoice.items_count ?? 0) === 1 ? "item" : "items"}
                  </span>
                </span>

                <VcIcon
                  name="chevron"
                  size={18}
                  stroke="#B9BCC2"
                  strokeWidth={2.4}
                  className="hidden sm:block shrink-0"
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PurchasedInvoicesPage;
