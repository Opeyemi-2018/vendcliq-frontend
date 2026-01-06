/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Heart, Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getMarketplaceStocks,
  getMarketplaceOffers,
} from "@/actions/marketPlaceStock";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { CombinedStock, OfferStock, RegularStock } from "@/types/marketPlace";
import { MarketSkeletonCard } from "@/components/SkeletonLoader";



const MarketPlace = () => {
  const router = useRouter();
  const [items, setItems] = useState<CombinedStock[]>([]);
  const [displayItems, setDisplayItems] = useState<CombinedStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in");
        setLoading(false);
        return;
      }

      const [offersResult, stocksResult] = await Promise.all([
        getMarketplaceOffers(token),
        getMarketplaceStocks(token),
      ]);

      const offers: OfferStock[] = offersResult.success
        ? offersResult.data.map((o: any) => ({
            ...o,
            id: o.id,
            selling_price: o.price.toString(),
            total_qty: o.qty.toString(),
            isOffer: true,
          }))
        : [];

      const stocks: RegularStock[] = stocksResult.success
        ? stocksResult.data
        : [];

      const allItems = [...offers, ...stocks];
      setItems(allItems);
      setDisplayItems(allItems); // Initial display = all
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setDisplayItems(items); // Show all if empty
      return;
    }

    const filtered = items.filter((item) =>
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
      toast.error(`No products found for "${searchQuery}"`);
      setDisplayItems(items); // Show all products back
    } else {
      setDisplayItems(filtered); // Show only matches
    }
  }, [searchQuery, items]);

  const handleItemClick = (id: string, isOffer: boolean) => {
    const path = `/dashboards/market-place/${id}${
      isOffer ? "?type=offer" : ""
    }`;
    router.push(path);
  };

  const renderProductCard = (item: CombinedStock) => (
    <div
      key={item.id}
      className="rounded-xl overflow-hidden hover:shadow-lg flex flex-col transition-shadow cursor-pointer"
    >
      <div className="relative rounded-tr-xl rounded-tl-xl h-[153px] border-t-2 border-r-2 border-l-2 border-[#E3E3E3] bg-[#FAFAFA]">
        {item.isOffer && (
          <div className="absolute top-2 z-20 left-2 text-[#E33629] bg-[#FFE7E5] text-[8px] font-bold font-dm-sans px-2 py-1 rounded">
            20% OFF
          </div>
        )}

        <div className="absolute top-2 z-20 right-2 text-[#292D32] bg-[#F2F2F7] text-[8px] font-bold font-dm-sans p-1 rounded">
          <Heart size={15} />
        </div>
        <Image
          src={`https:${item.product.image}`}
          alt={item.product.name}
          fill
          className="object-contain p-5"
        />
      </div>
      <div className="px-3 py-2 flex flex-col justify-between h-[140px] bg-[#0A6DC0] text-white font-dm-sans">
        <div>
          <p className="font-bold">
            ₦
            {item.isOffer
              ? item.price.toFixed(2)
              : parseFloat(item.selling_price).toFixed(2)}
            /unit
          </p>
          <h3 className="font-medium text-[13px]">{item.product.name}</h3>
          <p className="font-semibold text-[10px] font-regular mb-2">
            {item.isOffer ? item.qty : item.total_qty} pieces left
          </p>
        </div>
        <Button
          onClick={() => handleItemClick(item.id, !!item.isOffer)}
          variant="outline"
          className="w-full text-[13px] text-[#2F2F2F]"
        >
          Order Now
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header & Search */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-semibold font-clash text-[20px] md:text-[20px] text-[#2F2F2F]">
            Market Place
          </h1>
          <p className="font-medium text-[13px] md:text-[16px] text-[#9E9A9A] font-dm-sans">
            Order any product from the market place
          </p>
        </div>
        <Button onClick={()=> router.push("/dashboards/cart")} className="bg-[#0A6DC0] hover:bg-[#09599a]">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <MarketSkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <Card className=" p-3  md:p-6">
            {/* Offer Products Section */}
            {displayItems.some((item) => item.isOffer) && (
              <div className="mb-8">
                <div className="">
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="text-lg font-semibold  text-[#2F2F2F] font-dm-sans">
                      Promo Products
                    </h2>
                    <h2 className="text-[14px] font-bold bg-[#E33629] px-2 text-white rounded-md font-dm-sans">
                      HOT DEALS
                    </h2>
                  </div>
                  <div className="grid  grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {displayItems
                      .filter((item) => item.isOffer)
                      .map(renderProductCard)}
                  </div>
                </div>
              </div>
            )}

            {/* All Products Section */}
            {displayItems.some((item) => !item.isOffer) && (
              <div>
                <h2 className="text-[16px] font-medium mb-4 text-[#2F2F2F] font-dm-sans">
                  All Products
                </h2>
                <div className="">
                  <div className="grid  grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {displayItems
                      .filter((item) => !item.isOffer)
                      .map(renderProductCard)}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default MarketPlace;
