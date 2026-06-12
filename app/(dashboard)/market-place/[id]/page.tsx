/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, MoveLeft, Heart, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { handleAddToCart as addToCartApi } from "@/lib/utils/api/apiHelper";
import { CreateCartPayload } from "@/types/cart";
import { ClipLoader } from "react-spinners";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useMarketplaceStockDetail,
  useOfferDetail,
} from "@/hooks/useMarketplaceData";

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

  const {
    data: stockData,
    isLoading: stockLoading,
    error: stockError,
  } = useMarketplaceStockDetail(stockId);

  const {
    data: offerData,
    isLoading: offerLoading,
    error: offerError,
  } = useOfferDetail(stockId);

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const isLoading = isOffer ? offerLoading : stockLoading;
  const error = isOffer ? offerError : stockError;
  const currentItem = isOffer ? offerData?.offer : stockData?.stock;
  const relatedItems = isOffer
    ? offerData?.relatedOffers
    : stockData?.relatedStocks;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  const onAddToCart = async () => {
    if (!currentItem) {
      toast.error("Product information is missing");
      return;
    }

    const store =
      isOffer && offerData?.offer
        ? offerData.offer.store
        : stockData?.stock?.store;
    if (!store || !store.address || !store.id) {
      toast.error("Store information is missing. Please try again.");
      return;
    }

    const itemId =
      isOffer && offerData?.offer ? offerData.offer.id : stockData?.stock?.id;
    if (!itemId) {
      toast.error("Product ID is missing");
      return;
    }

    const payload: CreateCartPayload = {
      quantity,
      delivery: false,
      attributes: {
        latitude: store.address.lat,
        longitude: store.address.lng,
        address: store.address.name,
        storeId: store.id,
      },
    };

    if (isOffer) {
      payload.offer_id = itemId;
    } else {
      payload.stock_id = itemId;
    }

    try {
      setAddingToCart(true);
      const rawResponse = await addToCartApi(payload);

      if (rawResponse && rawResponse.error === null && rawResponse.data) {
        toast.success("Added to cart successfully!");
        setShowDialog(true);
        setQuantity(1);
      } else {
        toast.error(rawResponse?.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
      toast.error("An error occurred while adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRelatedStockClick = (id: string) => {
    router.push(`/market-place/${id}`);
  };

  const handleRelatedOfferClick = (id: string) => {
    router.push(`/market-place/${id}?type=offer`);
  };

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
        <Button
          onClick={() => router.push("/cart")}
          className="bg-[#0A6DC0] hover:bg-[#09599a]"
        >
          <ShoppingCart /> My Cart
        </Button>
      </div>

      {isLoading || !currentItem ? (
        <MainProductSkeleton />
      ) : (
        <div className="flex flex-col gap-3 md:p-6 lg:border bg-white border-[#E4E4E4] rounded-lg">
          <div className="bg-[#FAFAFA] rounded-lg border border-[#E3E3E3] overflow-hidden relative">
            {isOffer && (
              <div className="absolute top-2 z-20 left-2 text-[#E33629] bg-[#FFE7E5] text-[8px] font-bold font-dm-sans px-2 py-1 rounded">
                20% OFF
              </div>
            )}
            <div className="absolute top-2 z-20 right-2 text-[#292D32] bg-[#F2F2F7] text-[8px] font-bold font-dm-sans p-1 rounded cursor-pointer">
              <Heart size={15} />
            </div>
            <div className="relative h-56 w-full">
              {currentItem.product?.image ? (
                <Image
                  src={
                    currentItem.product.image.startsWith("//")
                      ? `https:${currentItem.product.image}`
                      : currentItem.product.image
                  }
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

          <div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-medium font-dm-sans text-[16px] text-[#313131]">
                    {currentItem.product?.name || "Product Name"}
                  </h1>

                  <p className="text-[16px] font-dm-sans font-bold text-[#313131]">
                    ₦{" "}
                    {isOffer && offerData?.offer
                      ? (offerData.offer.price ?? 0).toFixed(2)
                      : stockData?.stock
                        ? parseFloat(
                            stockData.stock.selling_price || "0",
                          ).toFixed(2)
                        : "0.00"}
                  </p>

                  <p className="text-[13px] font-dm-sans text-[#8E8E93]">
                    {isOffer && offerData?.offer
                      ? `${offerData.offer.qty ?? 0} available`
                      : stockData?.stock
                        ? `${stockData.stock.total_qty || "0"} available`
                        : "0 available"}
                  </p>
                </div>

                <div className="flex items-center gap-3 border border-[#D8D8D866] p-2 rounded-full">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity === 1}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-[#0A6DC0] hover:text-white duration-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quantity === 0 ? "" : quantity}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setQuantity(0);
                        return;
                      }
                      const val = parseInt(raw.replace(/\D/g, ""));
                      if (!isNaN(val)) setQuantity(val);
                    }}
                    onBlur={() => {
                      if (!quantity || quantity < 1) setQuantity(1);
                    }}
                    className="w-12 h-9 text-center text-[#2F2F2F] font-semibold text-[16px] bg-white border border-[#D8D8D8] rounded-lg outline-none focus:border-[#0A6DC0] transition-colors"
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-[#0A6DC0] hover:text-white duration-200 rounded-full"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {isOffer && offerData?.offer && (
                <>
                  <p className="text-[13px] font-dm-sans text-[#0A6DC0] font-semibold pt-1">
                    Minimum order: {offerData.offer.minimum_qty ?? 1} units
                  </p>
                  {offerData.offer.supply_available &&
                    (offerData.offer.supply_fee ?? 0) > 0 && (
                      <p className="text-[13px] font-dm-sans text-[#8E8E93] pt-1">
                        Supply fee: ₦
                        {(offerData.offer.supply_fee ?? 0).toFixed(2)}
                      </p>
                    )}
                  {offerData.offer.expiry_date && (
                    <p className="text-[12px] font-dm-sans text-[#8E8E93] pt-1">
                      Expires:{" "}
                      {new Date(
                        offerData.offer.expiry_date,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </>
              )}

              {!isOffer && stockData?.stock?.exp_date && (
                <p className="text-[12px] font-dm-sans text-[#8E8E93] pt-1">
                  Expires:{" "}
                  {new Date(stockData.stock.exp_date).toLocaleDateString()}
                </p>
              )}

              <div className="bg-[#FAFAFA] p-5 rounded-md">
                {isOffer && offerData?.offer?.store && (
                  <div className="flex gap-1 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#FCE5D7] text-[#CD1919] text-[23px] flex items-center justify-center font-medium uppercase">
                      {offerData.offer.store.name
                        ?.trim()
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[#2F2F2F] flex items-center gap-2 font-medium font-dm-sans">
                        {offerData.offer.store.name}
                      </div>
                      <div className="text-[#2F2F2F] flex items-center gap-2 text-[13px] font-regular font-dm-sans">
                        {offerData.offer.store.address.name}
                      </div>
                    </div>
                  </div>
                )}

                {!isOffer && stockData?.stock?.store && (
                  <div className="flex gap-1 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#FCE5D7] text-[#CD1919] text-[23px] flex items-center justify-center font-medium uppercase">
                      {stockData.stock.store.name
                        ?.trim()
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[#2F2F2F] flex items-center gap-2 font-medium font-dm-sans">
                        {stockData.stock.store.name}
                      </div>
                      <div className="text-[#2F2F2F] flex items-center gap-2 text-[13px] font-regular font-dm-sans">
                        {stockData.stock.store.address.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={onAddToCart}
              disabled={addingToCart}
              className="w-full mt-4 bg-[#0A6DC0] hover:bg-[#09599a] py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="mr-2" />
              {addingToCart ? (
                <>
                  Adding...
                  <ClipLoader size={24} color="white" />
                </>
              ) : (
                "Add to Cart"
              )}
            </Button>
          </div>
        </div>
      )}

      {!isOffer && relatedItems && relatedItems.length > 0 && (
        <div className="mt-10">
          <h2 className="font-medium mb-4 font-dm-sans text-[16px] text-[#2F2F2F]">
            Other products you might like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {relatedItems.map((relatedStock: any) => (
              <div
                key={relatedStock.id}
                className="rounded-xl overflow-hidden hover:shadow-lg flex flex-col transition-shadow cursor-pointer"
                onClick={() => handleRelatedStockClick(relatedStock.id)}
              >
                <div className="relative rounded-tr-xl rounded-tl-xl h-[153px] border-t-2 border-r-2 border-l-2 border-[#E3E3E3] bg-[#FAFAFA]">
                  <Image
                    src={
                      relatedStock.product.image.startsWith("//")
                        ? `https:${relatedStock.product.image}`
                        : relatedStock.product.image
                    }
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
                    variant="outline"
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

      {isOffer && relatedItems && relatedItems.length > 0 && (
        <div className="mt-10">
          <h2 className="font-medium mb-4 font-dm-sans text-[16px] text-[#2F2F2F]">
            Other offers you might like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {relatedItems.map((relatedOffer: any) => (
              <div
                key={relatedOffer.id}
                className="rounded-xl overflow-hidden hover:shadow-lg flex flex-col transition-shadow cursor-pointer"
                onClick={() => handleRelatedOfferClick(relatedOffer.id)}
              >
                <div className="relative rounded-tr-xl rounded-tl-xl h-[153px] border-t-2 border-r-2 border-l-2 border-[#E3E3E3] bg-[#FAFAFA]">
                  <div className="absolute top-2 z-20 left-2 text-[#E33629] bg-[#FFE7E5] text-[8px] font-bold font-dm-sans px-2 py-1 rounded">
                    20% OFF
                  </div>
                  <Image
                    src={
                      relatedOffer.product.image.startsWith("//")
                        ? `https:${relatedOffer.product.image}`
                        : relatedOffer.product.image
                    }
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
                    variant="outline"
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[20px] text-center font-clash md:text-[25px] font-semibold text-[#0E0E0F]">
              Item added to cart. What&apos;s next?
            </DialogTitle>
            <DialogDescription className="text-center font-dm-sans text-[#464343]">
              We have successfully added the item to your cart. select your next
              action
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => router.push("/market-place")}
            className="bg-[#0A6DC0] hover:bg-[#09599a]"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => router.push("/cart")}
            variant="outline"
            className="shadow"
          >
            Proceed to Checkout
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockDetailPage;
