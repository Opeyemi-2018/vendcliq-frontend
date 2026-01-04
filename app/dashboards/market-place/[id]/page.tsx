/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboards/market-place/[id]/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { MapPin, ShoppingCart, MoveLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  getMarketplaceStockDetail,
  getOfferDetail,
} from "@/actions/marketPlaceStock";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Stock {
  id: string;
  sku: string;
  selling_price: string;
  selling_price_pieces: string;
  total_qty: string;
  exp_date: string;
  product: {
    id: string;
    name: string;
    items_per_pack: number;
    image: string;
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
  };
}

interface Offer {
  id: string;
  stock: {
    id: string;
    sku: string;
    qty: string;
    price: number;
  };
  product: {
    id: string;
    name: string;
    image: string;
  };
  qty: number;
  minimum_qty: number;
  price: number;
  supply_fee: number;
  expiry_date: string;
  supply_available: boolean;
  views: number | null;
  store: {
    id: string;
    name: string;
    phone: string;
    address: {
      lat: number;
      lng: number;
      name: string;
    };
  };
  created_at: string;
  updated_at: string;
}

// Skeleton for Related Products
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

// Dedicated Skeleton for Main Product Detail
const MainProductSkeleton = () => (
  <Card className="flex flex-col gap-3 p-5 rounded-lg animate-pulse">
    <div className="bg-[#FAFAFA] rounded-lg border border-gray-200 overflow-hidden">
      <div className="h-56 w-full bg-gray-200" />
    </div>
    <div className="space-y-4">
      <div className="h-8 bg-gray-300 rounded w-3/4" />
      <div className="h-10 bg-gray-300 rounded w-1/2" />
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 bg-gray-300 rounded-full" />
        <div className="h-4 bg-gray-300 rounded w-64" />
      </div>
      <div className="h-12 bg-gray-300 rounded-lg w-full mt-6" />
    </div>
  </Card>
);

const StockDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const stockId = params.id as string;
  const isOffer = searchParams.get("type") === "offer";

  const [stock, setStock] = useState<Stock | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [relatedStocks, setRelatedStocks] = useState<Stock[]>([]);
  const [relatedOffers, setRelatedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (stockId) {
      fetchStockDetail();
    }
  }, [stockId, isOffer]);

  const fetchStockDetail = async () => {
    try {
      setLoading(true);
      setError(false);
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in");
        setLoading(false);
        return;
      }

      if (isOffer) {
        const result = await getOfferDetail(token, stockId);
        console.log("Offer API Response:", result);
        console.log("Offer data:", result.offer);

        if (result.success && result.offer) {
          console.log("Setting offer:", result.offer);
          setOffer(result.offer);
          setStock(null);
          setRelatedStocks([]);
        } else {
          setError(true);
          toast.error(result.error || "Failed to load offer details");
        }
      } else {
        const result = await getMarketplaceStockDetail(token, stockId);
        console.log("Stock API Response:", result);

        if (result.success && result.stock) {
          setStock(result.stock);
          setOffer(null);
          setRelatedStocks(result.relatedStocks || []);
        } else {
          setError(true);
          toast.error(result.error || "Failed to load product details");
        }
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
      setError(true);
      toast.error("An error occurred while loading product details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    alert("Added to cart!");
  };

  const handleRelatedStockClick = (id: string) => {
    router.push(`/dashboards/market-place/${id}`);
  };

  const handleRelatedOfferClick = (id: string) => {
    router.push(`/dashboards/market-place/${id}?type=offer`);
  };

  const currentItem = isOffer ? offer : stock;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">Failed to load product details</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="">
      <Button
        onClick={() => router.back()}
        variant="ghost"
        className="rounded-full p-2 hover:bg-gray-100 hover:text-[#0A6DC0]"
      >
        <MoveLeft size={25} />
      </Button>

      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-semibold font-clash text-[20px] md:text-[20px] text-[#2F2F2F]">
            {isOffer ? "Offer Product" : "Order Product"}
          </h1>
          <p className="font-medium text-[#9E9A9A] font-dm-sans">
            See more about this product before you order
          </p>
        </div>
        <Button className="bg-[#0A6DC0] hover:bg-[#09599a]">
          <ShoppingCart /> My Cart
        </Button>
      </div>

      {loading || !currentItem ? (
        <MainProductSkeleton />
      ) : (
        <Card className="flex flex-col gap-3 p-5 rounded-lg">
          {/* Product Image */}
          <div className="bg-[#FAFAFA] rounded-lg border border-gray-200 overflow-hidden relative">
            {isOffer && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1.5 rounded z-10 font-semibold">
                OFFER
              </div>
            )}
            <div className="relative h-56 w-full">
              {currentItem.product?.image ? (
                <Image
                  src={`https:${currentItem.product.image}`}
                  alt={currentItem.product?.name || "Product"}
                  fill
                  className="object-contain p-4"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="space-y-1">
              <h1 className="font-medium font-dm-sans text-[16px] text-[#313131]">
                {currentItem.product?.name || "Product Name"}
              </h1>

              <p className="text-[16px] font-dm-sans font-bold text-[#313131]">
                ₦
                {isOffer && offer
                  ? (offer.price ?? 0).toFixed(2)
                  : stock
                  ? parseFloat(stock.selling_price || "0").toFixed(2)
                  : "0.00"}
              </p>

              <p className="text-[13px] font-dm-sans text-[#8E8E93]">
                {isOffer && offer
                  ? `${offer.qty ?? 0} available`
                  : stock
                  ? `${stock.total_qty || "0"} available`
                  : "0 available"}
              </p>

              {!isOffer && stock && stock.store && (
                <div className="text-[#8E8E93] flex items-center gap-2 text-[13px] font-regular font-dm-sans pt-2">
                  <MapPin size={20} /> {stock.store.address.name}
                </div>
              )}

              {isOffer && offer && offer.store && (
                <div className="text-[#8E8E93] flex items-center gap-2 text-[13px] font-regular font-dm-sans pt-2">
                  <MapPin size={20} /> {offer.store.address.name}
                </div>
              )}

              {isOffer && offer && (
                <>
                  <p className="text-[13px] font-dm-sans text-[#0A6DC0] font-semibold pt-1">
                    Minimum order: {offer.minimum_qty ?? 1} units
                  </p>
                  {offer.supply_available && (offer.supply_fee ?? 0) > 0 && (
                    <p className="text-[13px] font-dm-sans text-[#8E8E93] pt-1">
                      Supply fee: ₦{(offer.supply_fee ?? 0).toFixed(2)}
                    </p>
                  )}
                  {offer.expiry_date && (
                    <p className="text-[12px] font-dm-sans text-[#8E8E93] pt-1">
                      Expires:{" "}
                      {new Date(offer.expiry_date).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              className="w-full mt-4 bg-[#0A6DC0] hover:bg-[#09599a] py-6 text-lg"
            >
              <ShoppingCart className="mr-2" /> Add to Cart
            </Button>
          </div>
        </Card>
      )}

      {/* Related Stocks - Only show for regular stocks */}
      {!isOffer && relatedStocks.length > 0 && (
        <div className="mt-10">
          <h2 className="font-medium mb-4 font-dm-sans text-[16px] text-[#2F2F2F]">
            Other products you might like
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {relatedStocks.map((relatedStock) => (
                <div
                  key={relatedStock.id}
                  className="rounded-xl overflow-hidden hover:shadow-lg flex flex-col transition-shadow cursor-pointer"
                  onClick={() => handleRelatedStockClick(relatedStock.id)}
                >
                  <div className="relative rounded-tr-xl rounded-tl-xl h-[153px] border-t-2 border-r-2 border-l-2 border-[#E3E3E3] bg-[#FAFAFA]">
                    <Image
                      src={`https:${relatedStock.product.image}`}
                      alt={relatedStock.product.name}
                      fill
                      className="object-contain p-5"
                    />
                  </div>
                  <div className="px-3 py-2 flex flex-col justify-between h-[140px] bg-[#0A6DC0] text-white font-dm-sans">
                    <div>
                      <p className="font-bold">
                        ₦{parseFloat(relatedStock.selling_price).toFixed(2)}
                      </p>

                      <h3 className="font-medium text-[13px]">
                        {relatedStock.product.name}
                      </h3>

                      <p className="font-semibold text-[10px] font-regular mb-2">
                        {relatedStock.total_qty} pieces left
                      </p>
                    </div>

                    <Button
                      variant={"outline"}
                      className="w-full text-[13px] text-[#2F2F2F]"
                    >
                      Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related Offers - Only show for offer products */}
      {isOffer && relatedOffers.length > 0 && (
        <div className="mt-10">
          <h2 className="font-medium mb-4 font-dm-sans text-[16px] text-[#2F2F2F]">
            Other offers you might like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {relatedOffers.map((relatedOffer) => (
              <div
                key={relatedOffer.id}
                className="rounded-xl overflow-hidden hover:shadow-lg flex flex-col transition-shadow cursor-pointer"
                onClick={() => handleRelatedOfferClick(relatedOffer.id)}
              >
                <div className="relative rounded-tr-xl rounded-tl-xl h-[153px] border-t-2 border-r-2 border-l-2 border-[#E3E3E3] bg-[#FAFAFA]">
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    OFFER
                  </div>
                  <Image
                    src={`https:${relatedOffer.product.image}`}
                    alt={relatedOffer.product.name}
                    fill
                    className="object-contain p-5"
                  />
                </div>
                <div className="px-3 py-2 flex flex-col justify-between h-[140px] bg-[#0A6DC0] text-white font-dm-sans">
                  <div>
                    <p className="font-bold">
                      ₦{relatedOffer.price.toFixed(2)}
                    </p>

                    <h3 className="font-medium text-[13px]">
                      {relatedOffer.product.name}
                    </h3>

                    <p className="font-semibold text-[10px] font-regular mb-2">
                      {relatedOffer.qty} available
                    </p>
                  </div>

                  <Button
                    variant={"outline"}
                    className="w-full text-[13px] text-[#2F2F2F]"
                  >
                    Order
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetailPage;
