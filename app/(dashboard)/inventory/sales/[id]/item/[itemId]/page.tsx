/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MoveLeft } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import { getSaleById } from "@/lib/utils/api/apiHelper";
import { SaleInvoice, SaleInvoiceItem } from "@/types/sales";
import { Button } from "@/components/ui/button";

export default function SoldItemDetailPage() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const router = useRouter();

  const [invoice, setInvoice] = useState<SaleInvoice | null>(null);
  const [item, setItem] = useState<SaleInvoiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });

  useEffect(() => {
    if (!id || !itemId) {
      setError("Missing invoice ID or item ID");
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getSaleById(id);
        if (res.statusCode === 200 && res.data) {
          setInvoice(res.data);
          const foundItem = res.data.items?.find((i) => i.id === itemId);
          if (foundItem) {
            setItem(foundItem);
          } else {
            setError("Item not found in this invoice");
          }
        } else {
          setError(res.error || "Failed to load invoice");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, itemId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="py-20 px-4 flex flex-col items-center">
          <ThreeDots height="80" width="80" color="#0A6DC0" visible />
          <p className="mt-5 text-[#9E9A9A] font-dm-sans text-lg">
            Loading item details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !item || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-dm-sans">
          Error
        </h2>
        <p className="text-gray-700 mb-4 max-w-md">
          {error || "Missing invoice/item ID"}
        </p>
        <Button
          onClick={() => router.back()}
          className="px-8 py-3.5 bg-[#0A6DC0] text-white rounded-lg hover:bg-[#085a9e]"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors mb-4"
      >
        <MoveLeft className="w-5 h-5" />
      </button>

      <div className="mb-4 md:mb-6">
        <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
          {item.product?.name || "Sold Item Details"}
        </h1>
        <p className="font-medium font-dm-sans text-[#9E9A9A]">
          Full details of this sold item
        </p>
      </div>

      <div className="bg-white rounded-xl md:border border-[#E4E7EC] shadow-sm overflow-hidden md:p-6">
        {/* Image */}
        <div className="bg-[#FAFAFA] rounded-lg border border-gray-200 overflow-hidden mt-4 md:mt-0">
          <div className="h-40 md:h-80 w-full flex items-center justify-center p-6">
            {item.product?.image ? (
              <Image
                src={
                  item.product.image.startsWith("//")
                    ? `https:${item.product.image}`
                    : item.product.image
                }
                alt={item.product.name || "Product"}
                width={400}
                height={400}
                className="object-contain max-h-full rounded-lg drop-shadow-md"
                priority
              />
            ) : (
              <div className="text-gray-400 text-8xl opacity-50">📦</div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 md:mt-10 text-[#2F2F2F] text-[13px] sm:text-[15px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6">
          <div>
            <h2 className="font-bold font-dm-sans">Product Name</h2>
            <p className="mt-1.5">{item.product?.name || "—"}</p>
          </div>

          <div>
            <h2 className="font-bold font-dm-sans">Quantity Sold</h2>
            <p className="mt-1.5 font-medium">{item.quantity}</p>
          </div>

          <div>
            <h2 className="font-bold font-dm-sans">Unit Cost</h2>
            <p className="mt-1.5 font-medium">{formatCurrency(item.cost)}</p>
          </div>

          <div>
            <h2 className="font-bold font-dm-sans">Subtotal</h2>
            <p className="mt-1.5 font-medium">{formatCurrency(item.sub_total)}</p>
          </div>

          <div>
            <h2 className="font-bold font-dm-sans">Profit</h2>
            <p className="mt-1.5 font-medium text-green-700">
              {formatCurrency(item.profit)}
            </p>
          </div>

          <div>
            <h2 className="font-bold font-dm-sans">Delivery Required</h2>
            <p className="mt-1.5">
              {item.delivery ? (
                <span className="text-green-700 font-medium">Yes</span>
              ) : (
                "No"
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}