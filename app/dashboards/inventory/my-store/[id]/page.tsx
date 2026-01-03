// app/dashboards/inventory/my-store/[id]/page.tsx
"use client";

import { MoveLeft, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoreById } from "@/actions/stores";
import { ThreeDots } from "react-loader-spinner";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StockForm from "../chunks/StockForm";

interface Store {
  id: string;
  name: string;
  address: { name: string };
  phone: string;
  stock_value: number;
  stock_count: number;
  low_stock_count: number;
}

const StoreDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;

  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      setIsLoading(true);
      setError(null);

      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");

      if (!token) {
        setError("Please log in to view store details");
        setIsLoading(false);
        return;
      }

      const result = await getStoreById(storeId, token);

      if (result && result.data) {
        setStore(result.data);
      } else {
        setError("Failed to load store details");
      }

      setIsLoading(false);
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ThreeDots height="80" width="80" color="#0A6DC0" visible={true} />
        <p className="mt-4 text-[#9E9A9A]">Loading store details...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error || "Store not found"}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#0A6DC0] underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors"
      >
        <MoveLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
        <div>
          <h1 className="font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
            {store.name}
          </h1>
          <p className="text-[16px] font-dm-sans text-[#9E9A9A]">
            Here are all the details about this store
          </p>
        </div>

        {/* Add Stock Button → Opens Modal */}
        <Button
          onClick={() => setIsAddStockOpen(true)}
          className="bg-[#0A6DC0] hover:bg-[#09599a] py-5 md:py-6"
        >
          + Add Stock
        </Button>
      </div>

      <div className="bg-[url('/balance-bg.svg')] my-6 bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6">
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Image src="/value.svg" alt="value" width={20} height={20} />
            <span className="text-white font-dm-sans">Stock Value</span>
          </div>
          <p className="text-[18px] md:text-[20px] font-clash text-white">
            ₦{store.stock_value.toLocaleString()}
          </p>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <div className="grid grid-cols-2 gap-y-3 md:gap-4 text-[#2F2F2F] font-dm-sans">
          <div>
            <p className="font-bold">Store Name:</p>
            <p>{store.name}</p>
          </div>
          <div>
            <p className="font-bold">Address:</p>
            <p>{store.address.name}</p>
          </div>
          <div>
            <p className="font-bold">Phone:</p>
            <p>{store.phone}</p>
          </div>
          <div>
            <p className="font-bold">Product Count:</p>
            <p>{store.stock_count}</p>
          </div>

          {store.low_stock_count > 0 && (
            <div className="col-span-2">
              <p className="text-red-600 font-medium">
                ⚠️ {store.low_stock_count} items low in stock
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 font-dm-sans mt-8">
          <div className="text-[#2F2F2F] flex justify-between items-center">
            <p className="font-bold text-[13px] md:text-[16px]">
              Payment Options
            </p>
            <button className="text-[#0A6DC0] font-bold text-[13px] md:text-[16px]">
              + New Payment Method
            </button>
          </div>
          <div className="flex justify-between items-center border border-[#D8D8D866] p-2 rounded-lg">
            <p className="text-[13px] md:text-[16px]">Opay POS</p>
            <Trash2 color="#9E9A9A" size={20} />
          </div>
          <div className="flex justify-between items-center border border-[#D8D8D866] p-2 rounded-lg">
            <p className="text-[13px] md:text-[16px]">Ajo POS</p>
            <Trash2 color="#9E9A9A" size={20} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 gap-4">
          <Button className="bg-[#0A6DC0] hover:bg-[#09599a] w-full py-5 md:py-6">
            Edit Store
          </Button>
          <Button variant="outline" className="w-full py-5 md:py-6 bg-white">
            Store Settings
          </Button>
        </div>
      </Card>

      {/* Add Stock Modal */}
      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader className="">
            <DialogTitle className="text-[20px] font-clash font-semibold">
              Add Stock to {store.name}
            </DialogTitle>
          </DialogHeader>
          {/* Reuse your full Stock form */}
          <div className="">
            <StockForm
              storeId={store.id}
              onSuccess={() => setIsAddStockOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreDetailPage;
