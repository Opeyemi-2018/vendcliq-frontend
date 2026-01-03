"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Search, ShoppingCart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getMarketplaceStocks } from "@/actions/marketPlaceStock";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

interface Stock {
  id: string;
  sku: string;
  selling_price: string;
  total_qty: string;
  product: {
    id: string;
    name: string;
    items_per_pack: number;
    image: string;
  };
  store: {
    name: string;
    address: {
      name: string;
    };
  };
  attributes: {
    type: string;
  };
}

const SkeletonCard = () => (
  <div className="rounded-lg overflow-hidden animate-pulse">
    <div className="h-[153px] border border-[#E5E5EA] bg-gray-200"></div>
    <div className="px-3 py-2 flex flex-col justify-between h-[150px] bg-gray-300">
      <div>
        <div className="h-5 bg-gray-400 rounded mb-2 w-20"></div>
        <div className="h-4 bg-gray-400 rounded mb-2 w-full"></div>
        <div className="h-3 bg-gray-400 rounded w-24"></div>
      </div>
      <div className="h-10 bg-gray-400 rounded"></div>
    </div>
  </div>
);

const MarketPlace = () => {
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStocks(stocks);
    } else {
      const filtered = stocks.filter((stock) =>
        stock.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filtered.length === 0) {
        toast.error(`No products match "${searchQuery}"`);
        setFilteredStocks(stocks);
      } else {
        setFilteredStocks(filtered);
      }
    }
  }, [searchQuery, stocks]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");

      if (!token) {
        console.error("No authentication token available");
        setLoading(false);
        return;
      }

      const result = await getMarketplaceStocks(token);

      if (result.success && result.data) {
        setStocks(result.data);
        setFilteredStocks(result.data);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (stockId: string) => {
    router.push(`/dashboards/market-place/${stockId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-semibold font-clash text-[20px] md:text-[20px] text-[#2F2F2F]">
            Market Place
          </h1>
          <p className="font-medium text-[#9E9A9A] font-dm-sans">
            Order any product from the market place
          </p>
        </div>
        <Button className="bg-[#0A6DC0] hover:bg-[#09599a]">
          <ShoppingCart /> My Cart
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-[#313131]" />
        <Input
          placeholder="Search products..."
          className="bg-[#F2F2F7] pl-10 py-6"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredStocks.map((stock) => (
            <div
              key={stock.id}
              className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-[153px] border border-[#E5E5EA] bg-[#FAFAFA]">
                <Image
                  src={`https:${stock.product.image}`}
                  alt={stock.product.name}
                  fill
                  className="object-contain p-5"
                />
              </div>
              <div className="px-3 py-2 flex flex-col justify-between h-[150px] bg-[#0A6DC0] text-white font-dm-sans">
                <div>
                  <p className="font-bold">
                    ₦{parseFloat(stock.selling_price).toFixed(2)}
                  </p>

                  <h3 className="font-medium text-[13px]">
                    {stock.product.name}
                  </h3>

                  <p className="font-semibold text-[10px] font-regular mb-2">
                    {stock.total_qty} pieces left
                  </p>
                </div>

                <Button
                  variant={"outline"}
                  onClick={() => handleOrderClick(stock.id)}
                  className="w-full text-[13px] text-[#2F2F2F]"
                >
                  Order Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketPlace;
