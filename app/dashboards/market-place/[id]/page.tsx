"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Store, ShoppingCart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getMarketplaceStockDetail } from "@/actions/marketPlaceStock";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

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

const StockDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const stockId = params.id as string;

  const [stock, setStock] = useState<Stock | null>(null);
  const [relatedStocks, setRelatedStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stockId) {
      fetchStockDetail();
    }
  }, [stockId]);

  const fetchStockDetail = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        setLoading(false);
        return;
      }
      const result = await getMarketplaceStockDetail(token, stockId);

      if (result.success) {
        setStock(result.stock);
        setRelatedStocks(result.relatedStocks || []);
      }
    } catch (error) {
      console.error("Error fetching stock detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    alert("Added to cart!");
  };

  const handleRelatedStockClick = (id: string) => {
    router.push(`/dashboards/market-place/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A6DC0]"></div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="text-center py-20">
        <p className="text-[#9E9A9A] text-lg">Stock not found</p>
        <Button
          onClick={() => router.push("/marketplace")}
          className="mt-4 bg-[#0A6DC0] hover:bg-[#09599a]"
        >
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Button
        onClick={() => router.back()}
        variant="ghost"
        className="mb-6 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="relative h-96 w-full">
            <Image
              src={`https:${stock.product.image}`}
              alt={stock.product.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="font-bold font-clash text-3xl text-[#2F2F2F] mb-4">
            {stock.product.name}
          </h1>

          <p className="text-4xl font-bold text-[#0A6DC0] mb-6">
            ₦{parseFloat(stock.selling_price).toFixed(2)}
          </p>

          {/* Store Address */}
          <div className="bg-[#F2F2F7] rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-5 h-5 text-[#0A6DC0] mt-1" />
              <div>
                <p className="font-semibold text-[#2F2F2F] mb-1">
                  Store Location
                </p>
                <p className="text-[#9E9A9A] text-sm">
                  {stock.store.address.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-[#0A6DC0]" />
              <p className="text-[#2F2F2F]">{stock.store.name}</p>
            </div>
          </div>

          {/* Product Info */}
          <div className="border-t border-gray-200 pt-4 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-[#9E9A9A]">Available Quantity</span>
              <span className="font-semibold text-[#2F2F2F]">
                {stock.total_qty} {stock.attributes.type}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#9E9A9A]">Items per Pack</span>
              <span className="font-semibold text-[#2F2F2F]">
                {stock.product.items_per_pack}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#9E9A9A]">Price per Piece</span>
              <span className="font-semibold text-[#2F2F2F]">
                ₦{parseFloat(stock.selling_price_pieces).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#9E9A9A]">Expiry Date</span>
              <span className="font-semibold text-[#2F2F2F]">
                {new Date(stock.exp_date).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full bg-[#0A6DC0] hover:bg-[#09599a] py-6 text-lg"
          >
            <ShoppingCart className="mr-2" /> Add to Cart
          </Button>
        </div>
      </div>

      {/* Related Stocks */}
      {relatedStocks.length > 0 && (
        <div>
          <h2 className="font-bold font-clash text-2xl text-[#2F2F2F] mb-6">
            Related Products
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedStocks.map((relatedStock) => (
              <div
                key={relatedStock.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 w-full bg-gray-100">
                  <Image
                    src={`https:${relatedStock.product.image}`}
                    alt={relatedStock.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3
                    className="font-semibold text-[#2F2F2F] mb-2 line-clamp-2 min-h-[48px]"
                    title={relatedStock.product.name}
                  >
                    {relatedStock.product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-[#9E9A9A]">Price</p>
                      <p className="text-xl font-bold text-[#0A6DC0]">
                        ₦{parseFloat(relatedStock.selling_price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#9E9A9A]">Qty</p>
                      <p className="font-semibold text-[#2F2F2F]">
                        {relatedStock.total_qty}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRelatedStockClick(relatedStock.id)}
                    className="w-full bg-[#0A6DC0] hover:bg-[#09599a]"
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
