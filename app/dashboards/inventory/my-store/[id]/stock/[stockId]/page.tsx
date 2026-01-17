"use client";

import { MoveLeft, Loader2, Package } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getStockDetail } from "@/actions/stores";
import { ThreeDots } from "react-loader-spinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { UpdateStockDialog } from "./chunks/UpdateDialog";

interface StockDetail {
  id: string;
  sku: string;
  cost_price: string;
  selling_price: string;
  selling_price_pieces: string;
  empties_price: string;
  exp_date: string;
  quantity: string;
  empties_qty: string;
  total_qty: string;
  stock_alert_no: number;
  stock_value: string;
  status: string;
  product: {
    id: string;
    name: string;
    items_per_pack: number;
    image?: string;
  };
  store: {
    id: string;
    name: string;
    address: {
      lat: number;
      lng: number;
      name: string;
    };
  };
  attributes: {
    type: string;
    batch: string;
    supplier: string;
  };
  created_at: string;
  updated_at: string;
  stats: {
    qty_sold: number;
    total_sales: number;
    qty_added: number;
    date_range: {
      userId: number;
    };
  };
}

const StockDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id as string;
  const stockId = params.stockId as string;

  const [stock, setStock] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockDetail = async () => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getStockDetail(stockId, storeId, token);

    if (result.success && result.data) {
      setStock(result.data);
    } else {
      setError(result.message || "Failed to load stock details");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (storeId && stockId) {
      fetchStockDetail();
    }
  }, [storeId, stockId]);

  const handleUpdateSuccess = () => {
    // Refresh stock data after update
    fetchStockDetail();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ThreeDots height="80" width="80" color="#0A6DC0" visible={true} />
        <p className="mt-4 text-[#9E9A9A]">Loading stock details...</p>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error || "Stock not found"}</p>
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
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="p-2 text-[#2F2F2F] hover:text-[#0A6DC0] hover:bg-[#F9F9F9] rounded-full inline-flex transition-colors"
      >
        <MoveLeft className="w-5 h-5" />
      </button>
      <div className="flex lg:items-center flex-col lg:flex-row justify-between">
        <div>
          <div className="flex gap-2 items-center font-clash text-[20px] md:text-[25px] font-semibold text-[#2F2F2F]">
            <h1 className=" ">{stock.product.name}</h1>
            {" - "}
            <p className="">{parseFloat(stock.quantity).toFixed(0)}</p>
          </div>
          <p className="font-medium font-dm-sans text-[#9E9A9A] ">
            This is all you need to know about this product{" "}
          </p>
        </div>
        <Button className="py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#09599a] w-[40%] lg:w-auto">
          View Metrics
        </Button>
      </div>

      <div className="flex items-center gap-3 text-white">
        <div className="w-full bg-[url('/blue.svg')]  bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6">
          <p className="text-[16px] font-dm-sans ">Qty Sold</p>
          <p className="text-[16px] md:text-[20px] font-clash font-semibold ">
            {stock.stats.qty_sold}
          </p>
        </div>
        <div className="w-full bg-[url('/balance-bg.svg')]  bg-cover bg-no-repeat bg-center h-[100px] rounded-2xl p-6">
          <p className="text-[16px] font-dm-sans ">Total Sales</p>
          <p className="text-[16px] md:text-[20px] font-clash font-semibold ">
            ₦{stock.stats.total_sales.toLocaleString()}
          </p>
        </div>
      </div>
      <Card className="md:p-6">
        <div className="bg-[#FAFAFA] rounded-lg border border-gray-200 overflow-hidden relative">
          <div className=" h-56 w-full flex items-center justify-center ">
            {stock.product.image ? (
              <Image
                src={
                  stock.product.image.startsWith("//")
                    ? `https:${stock.product.image}`
                    : stock.product.image
                }
                alt={stock.product.name}
                width={160}
                height={160}
                className="rounded-lg object-contain"
              />
            ) : (
              <Package className="w-16 h-16 text-gray-400" />
            )}
          </div>
        </div>

        <div className="text-[#2F2F2F] mt-4 text-[12px] md:text-[16px] grid grid-cols-2 gap-y-3 md:gap-y-5">
          <div className="">
            <h2 className=" font-bold font-dm-sans">Product Name</h2>
            <p className="font-regular lowercase">{stock.product.name}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">SKU</h2>
            <p className="font-regular lowercase">{stock.sku}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">Total Qty</h2>
            <p className="font-regular lowercase">{stock.total_qty}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">Content Qty</h2>
            <p className="font-regular lowercase">{stock.quantity}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">Empties Qty</h2>
            <p className="font-regular lowercase">{stock.empties_qty}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">Stock Value</h2>
            <p className="font-regular lowercase">₦{parseFloat(stock.stock_value).toLocaleString()}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">Cost Price</h2>
            <p className="font-regular lowercase">₦{parseFloat(stock.cost_price).toLocaleString()}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">Selling Price</h2>
            <p className="font-regular lowercase">₦{parseFloat(stock.selling_price).toLocaleString()}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">Price per piece</h2>
            <p className="font-regular lowercase">
              ₦{parseFloat(stock.selling_price_pieces).toLocaleString()}
            </p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">Empties Price</h2>
            <p className="font-regular lowercase">₦{parseFloat(stock.empties_price).toLocaleString()}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">BB Date</h2>
            <p className="font-regular lowercase">{stock.exp_date}</p>
          </div>
          <div className="">
            <h2 className=" font-bold font-dm-sans">Low Stock alert number</h2>
            <p className="font-regular lowercase">{stock.stock_alert_no}</p>
          </div>
        </div>
        <div className="flex  flex-row justify-between gap-4 mt-6">
          <Button className="w-full py-5 md:py-6 bg-[#0A6DC0] hover:bg-[#09599a]">
            Create Promo
          </Button>

          <UpdateStockDialog
            stockId={stock.id}
            stockData={{
              cost_price: stock.cost_price,
              selling_price: stock.selling_price,
              selling_price_pieces: stock.selling_price_pieces,
              empties_price: stock.empties_price,
              exp_date: stock.exp_date,
              stock_alert_no: stock.stock_alert_no,
              sku: stock.sku,
            }}
            onSuccess={handleUpdateSuccess}
          />
        </div>
      </Card>
    </div>
  );
};

export default StockDetailPage;